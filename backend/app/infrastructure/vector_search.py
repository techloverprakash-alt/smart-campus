import logging
from typing import Any, Dict, List, Optional
import numpy as np

from app.services.qdrant_service import qdrant_service

logger = logging.getLogger("smart_campus.vector_search_adapter")


class VectorSearchAdapter:
    """
    Adapter for Qdrant vector database operations with fault-tolerant fallbacks.
    """
    def __init__(self):
        self.service = qdrant_service

    def upsert_item(
        self,
        record_id: Any,
        vector: np.ndarray,
        modality: str,
        payload: Dict[str, Any]
    ) -> bool:
        """Indexes item vector and metadata into Qdrant collection."""
        try:
            vector_list = vector.tolist() if isinstance(vector, np.ndarray) else vector
            res = self.service.upsert_embedding(
                record_id=str(record_id),
                modality=modality,
                vector=vector_list,
                description=payload.get("description", ""),
                image_path=payload.get("image_url", ""),
                category=str(payload.get("category_id", "")),
                location=str(payload.get("location_id", "")),
                created_at=payload.get("created_at", ""),
                additional_metadata=payload
            )
            return res is not None
        except Exception as e:
            logger.info(f"Qdrant indexing deferred: {e}")
            return False

    def search_similar(
        self,
        query_vector: np.ndarray,
        modality: Optional[str] = None,
        top_k: int = 5,
        category: Optional[Any] = None,
        location: Optional[Any] = None,
        item_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Searches nearest vectors in Qdrant."""
        try:
            vector_list = query_vector.tolist() if isinstance(query_vector, np.ndarray) else query_vector
            results = self.service.search_similar(
                query_vector=vector_list,
                limit=top_k,
                modality_filter=modality,
                category_filter=str(category) if category else None,
                location_filter=str(location) if location else None,
                type_filter=item_type
            )
            return results
        except Exception as e:
            logger.info(f"Qdrant vector search skipped: {e}")
            return []


vector_search_adapter = VectorSearchAdapter()
