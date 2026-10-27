import logging
from typing import Any, Dict, List, Optional
import numpy as np

from app.config import settings
from app.services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)


class VectorSearchAdapter:
    """
    Adapter for Qdrant vector database operations with fault-tolerant fallbacks.
    """
    def __init__(self):
        self.service = qdrant_service

    def upsert_item(
        self,
        record_id: str,
        vector: np.ndarray,
        modality: str,
        payload: Dict[str, Any]
    ) -> bool:
        """Indexes item vector and metadata into Qdrant collection."""
        try:
            vector_list = vector.tolist() if isinstance(vector, np.ndarray) else vector
            self.service.upsert_embedding(
                record_id=record_id,
                modality=modality,
                vector=vector_list,
                description=payload.get("description", ""),
                image_path=payload.get("image_url", ""),
                category=payload.get("category", ""),
                location=payload.get("location", ""),
                created_at=payload.get("created_at", ""),
                additional_metadata=payload
            )
            return True
        except Exception as e:
            logger.info(f"Qdrant indexing deferred (running offline or standalone): {e}")
            return False

    def search_similar(
        self,
        query_vector: np.ndarray,
        modality: str = "text",
        top_k: int = 5,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Searches nearest vectors in Qdrant; returns empty list if vector DB offline."""
        try:
            vector_list = query_vector.tolist() if isinstance(query_vector, np.ndarray) else query_vector
            results = self.service.search_by_vector(
                query_vector=vector_list,
                target_modality=modality,
                top_k=top_k,
                category_filter=category
            )
            return results
        except Exception as e:
            logger.info(f"Qdrant vector search skipped (offline fallback): {e}")
            return []


vector_search_adapter = VectorSearchAdapter()
