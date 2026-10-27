import logging
import uuid
from typing import Any, Dict, List, Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.http.exceptions import UnexpectedResponse

from app.config import settings

logger = logging.getLogger(__name__)


class QdrantVectorService:
    """
    Manages vector storage, indexing, and similarity search in the local Qdrant instance.
    Connects to the pre-existing container 'smart-campus-qdrant' at localhost:6333.
    """
    _instance: Optional["QdrantVectorService"] = None

    def __init__(self):
        self.host = settings.qdrant_host
        self.client: Optional[QdrantClient] = None
        self.collection_name = settings.qdrant_collection_name
        self.vector_dim = settings.embedding_dim

    @classmethod
    def get_instance(cls) -> "QdrantVectorService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def connect(self) -> QdrantClient:
        """Establishes or returns the existing connection to Qdrant."""
        if self.client is None:
            logger.info(f"Connecting to Qdrant at {self.host}...")
            self.client = QdrantClient(url=self.host, timeout=10.0)
        return self.client

    def ensure_collection(
        self, 
        collection_name: Optional[str] = None, 
        vector_dim: Optional[int] = None
    ) -> bool:
        """
        Verifies if the specified collection exists. If not, creates it with Cosine distance.
        Preserves existing collections and vectors without overwriting.
        """
        target_collection = collection_name or self.collection_name
        target_dim = vector_dim or self.vector_dim
        client = self.connect()

        try:
            # Check if collection already exists
            collection_exists = client.collection_exists(target_collection)
            if collection_exists:
                info = client.get_collection(target_collection)
                logger.info(
                    f"Qdrant collection '{target_collection}' exists with {info.points_count} points."
                )
                return True

            # Collection does not exist; create it
            logger.info(
                f"Creating Qdrant collection '{target_collection}' with dim={target_dim}, distance=COSINE..."
            )
            client.create_collection(
                collection_name=target_collection,
                vectors_config=qmodels.VectorParams(
                    size=target_dim,
                    distance=qmodels.Distance.COSINE
                )
            )

            # Create payload indexes on commonly filtered fields for fast campus search
            self._create_payload_indexes(target_collection)
            logger.info(f"Collection '{target_collection}' successfully created.")
            return True

        except Exception as exc:
            logger.error(f"Failed to ensure Qdrant collection '{target_collection}': {exc}", exc_info=True)
            raise RuntimeError(f"Qdrant collection management error: {str(exc)}")

    def _create_payload_indexes(self, collection_name: str) -> None:
        """Creates keyword indexes for payload filtering on modality, category, location."""
        client = self.connect()
        fields_to_index = ["modality", "category", "location", "record_id"]
        for field in fields_to_index:
            try:
                client.create_payload_index(
                    collection_name=collection_name,
                    field_name=field,
                    field_schema=qmodels.PayloadSchemaType.KEYWORD
                )
            except Exception as e:
                logger.debug(f"Index creation note for field {field}: {e}")

    @staticmethod
    def generate_point_id(record_id: str, modality: str) -> str:
        """
        Generates a stable, deterministic UUID5 for a given record_id and modality.
        Ensures idempotent updates and prevents point collisions.
        """
        seed = f"campus:{record_id}:{modality.lower()}"
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, seed))

    def upsert_embedding(
        self,
        record_id: str,
        modality: str,
        vector: List[float],
        description: Optional[str] = None,
        image_path: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        created_at: Optional[str] = None,
        additional_metadata: Optional[Dict[str, Any]] = None,
        collection_name: Optional[str] = None
    ) -> str:
        """
        Inserts or updates an embedding vector into Qdrant with campus metadata payload.
        
        Returns:
            str: Deterministic point ID in Qdrant.
        """
        target_collection = collection_name or self.collection_name
        client = self.connect()

        point_id = self.generate_point_id(record_id, modality)

        payload = {
            "record_id": record_id,
            "modality": modality.lower(),
            "description": description,
            "image_path": image_path,
            "category": category.lower() if category else None,
            "location": location.lower() if location else None,
            "created_at": created_at,
        }

        if additional_metadata:
            payload["metadata"] = additional_metadata

        # Clean None values from top-level payload
        payload = {k: v for k, v in payload.items() if v is not None}

        point = qmodels.PointStruct(
            id=point_id,
            vector=vector,
            payload=payload
        )

        try:
            client.upsert(
                collection_name=target_collection,
                points=[point]
            )
            logger.info(f"Upserted point {point_id} (record_id={record_id}, modality={modality}) into {target_collection}")
            return point_id
        except Exception as exc:
            logger.error(f"Failed to upsert point {point_id}: {exc}", exc_info=True)
            raise RuntimeError(f"Qdrant point upsert error: {str(exc)}")

    def search_similar(
        self,
        query_vector: List[float],
        limit: int = 5,
        modality_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        location_filter: Optional[str] = None,
        score_threshold: Optional[float] = None,
        collection_name: Optional[str] = None
    ) -> List[qmodels.ScoredPoint]:
        """
        Searches for the nearest vectors using cosine similarity, applying optional metadata filters.
        """
        target_collection = collection_name or self.collection_name
        client = self.connect()

        # Ensure collection exists before searching
        try:
            if not client.collection_exists(target_collection):
                self.ensure_collection(target_collection)
                return []
        except Exception as e:
            logger.warning(f"Error checking collection existence: {e}")

        # Build Qdrant filter conditions
        must_conditions = []
        if modality_filter:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="modality",
                    match=qmodels.MatchValue(value=modality_filter.lower())
                )
            )
        if category_filter:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="category",
                    match=qmodels.MatchValue(value=category_filter.lower())
                )
            )
        if location_filter:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="location",
                    match=qmodels.MatchValue(value=location_filter.lower())
                )
            )

        query_filter = qmodels.Filter(must=must_conditions) if must_conditions else None

        try:
            # Query Qdrant with search
            # With qdrant-client >= 1.7.0, client.query_points is supported, but client.search is universal
            if hasattr(client, "search"):
                scored_points = client.search(
                    collection_name=target_collection,
                    query_vector=query_vector,
                    query_filter=query_filter,
                    limit=limit,
                    score_threshold=score_threshold
                )
            else:
                response = client.query_points(
                    collection_name=target_collection,
                    query=query_vector,
                    query_filter=query_filter,
                    limit=limit,
                    score_threshold=score_threshold
                )
                scored_points = response.points

            return scored_points
        except Exception as exc:
            logger.error(f"Qdrant vector search failed: {exc}", exc_info=True)
            raise RuntimeError(f"Qdrant search error: {str(exc)}")

    def get_point_by_id(self, point_id: str, collection_name: Optional[str] = None) -> Optional[qmodels.Record]:
        """Retrieves a point by its Qdrant UUID."""
        target_collection = collection_name or self.collection_name
        client = self.connect()
        try:
            records = client.retrieve(
                collection_name=target_collection,
                ids=[point_id],
                with_payload=True,
                with_vectors=False
            )
            return records[0] if records else None
        except Exception as exc:
            logger.error(f"Error retrieving point {point_id}: {exc}")
            return None

    def delete_point_by_id(self, point_id: str, collection_name: Optional[str] = None) -> bool:
        """Deletes a point by its Qdrant UUID."""
        target_collection = collection_name or self.collection_name
        client = self.connect()
        try:
            client.delete(
                collection_name=target_collection,
                points_selector=qmodels.PointIdsList(points=[point_id])
            )
            return True
        except Exception as exc:
            logger.error(f"Error deleting point {point_id}: {exc}")
            return False

    def delete_by_record_id(self, record_id: str, collection_name: Optional[str] = None) -> bool:
        """Deletes all modalities for a given record_id."""
        target_collection = collection_name or self.collection_name
        client = self.connect()
        try:
            client.delete(
                collection_name=target_collection,
                points_selector=qmodels.FilterSelector(
                    filter=qmodels.Filter(
                        must=[
                            qmodels.FieldCondition(
                                key="record_id",
                                match=qmodels.MatchValue(value=record_id)
                            )
                        ]
                    )
                )
            )
            logger.info(f"Deleted all points for record_id {record_id} from {target_collection}")
            return True
        except Exception as exc:
            logger.error(f"Error deleting record_id {record_id}: {exc}")
            return False

    def get_collection_count(self, collection_name: Optional[str] = None) -> int:
        """Returns total vector count in the collection."""
        target_collection = collection_name or self.collection_name
        client = self.connect()
        try:
            info = client.get_collection(target_collection)
            return info.points_count or 0
        except Exception as exc:
            logger.warning(f"Unable to get point count for {target_collection}: {exc}")
            return 0


# Global accessor
qdrant_service = QdrantVectorService.get_instance()
