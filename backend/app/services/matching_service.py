import logging
from typing import Any, Dict, List, Optional, Union
from pathlib import Path
from PIL import Image

from app.config import settings
from app.schemas import DirectComparisonResponse, MatchItem, MatchResponse
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)


class CrossModalMatchingService:
    """
    Orchestrates cross-modal similarity matching and semantic search workflows
    connecting MobileCLIP embeddings with Qdrant vector retrieval.
    """
    def __init__(self):
        self.embedding_service = embedding_service
        self.qdrant_service = qdrant_service

    def direct_compare_image_and_text(
        self,
        image_input: Union[bytes, Image.Image, Path, str],
        text: str
    ) -> DirectComparisonResponse:
        """
        Computes direct cosine similarity between an image and a text description.
        No database query is required.
        """
        # Validate and encode image
        image_vector = self.embedding_service.encode_image(image_input, normalize=True)
        # Validate and encode text
        text_vector = self.embedding_service.encode_text(text, normalize=True)

        raw_sim, percentage_sim = self.embedding_service.calculate_cosine_similarity(
            image_vector, text_vector
        )

        preview = text[:80] + ("..." if len(text) > 80 else "")

        return DirectComparisonResponse(
            similarity=raw_sim,
            similarity_percentage=percentage_sim,
            text_preview=preview,
            notes=(
                "Similarity score is a ranking metric and comparative signal. "
                "It does not guarantee identity without campus administrator verification."
            )
        )

    def search_text_to_image(
        self,
        query_text: str,
        top_k: int = 5,
        category: Optional[str] = None,
        location: Optional[str] = None,
        score_threshold: Optional[float] = None,
        collection_name: Optional[str] = None
    ) -> MatchResponse:
        """
        Workflow 1: Text-to-Image
        Accepts a user description (e.g., 'black backpack left in library'),
        generates its text embedding, and searches stored IMAGE embeddings in Qdrant.
        """
        top_k = min(max(1, top_k), settings.max_top_k)
        query_vector = self.embedding_service.encode_text(query_text, normalize=True).tolist()

        scored_points = self.qdrant_service.search_similar(
            query_vector=query_vector,
            limit=top_k,
            modality_filter="image",
            category_filter=category,
            location_filter=location,
            score_threshold=score_threshold,
            collection_name=collection_name
        )

        results = self._format_scored_points(scored_points)
        return MatchResponse(
            query_type="text_to_image",
            total_results=len(results),
            results=results,
            query_preview=query_text
        )

    def search_image_to_text(
        self,
        image_input: Union[bytes, Image.Image, Path, str],
        top_k: int = 5,
        category: Optional[str] = None,
        location: Optional[str] = None,
        score_threshold: Optional[float] = None,
        collection_name: Optional[str] = None
    ) -> MatchResponse:
        """
        Workflow 2: Image-to-Text
        Accepts an uploaded image, generates its image embedding,
        and searches stored TEXT descriptions in Qdrant.
        """
        top_k = min(max(1, top_k), settings.max_top_k)
        query_vector = self.embedding_service.encode_image(image_input, normalize=True).tolist()

        scored_points = self.qdrant_service.search_similar(
            query_vector=query_vector,
            limit=top_k,
            modality_filter="text",
            category_filter=category,
            location_filter=location,
            score_threshold=score_threshold,
            collection_name=collection_name
        )

        results = self._format_scored_points(scored_points)
        return MatchResponse(
            query_type="image_to_text",
            total_results=len(results),
            results=results,
            query_preview="Query Image (Uploaded)"
        )

    def search_image_to_image(
        self,
        image_input: Union[bytes, Image.Image, Path, str],
        top_k: int = 5,
        category: Optional[str] = None,
        location: Optional[str] = None,
        score_threshold: Optional[float] = None,
        collection_name: Optional[str] = None
    ) -> MatchResponse:
        """
        Workflow 3: Image-to-Image
        Accepts an image, generates its embedding, and searches existing IMAGE embeddings.
        Returns visually similar lost or found items.
        """
        top_k = min(max(1, top_k), settings.max_top_k)
        query_vector = self.embedding_service.encode_image(image_input, normalize=True).tolist()

        scored_points = self.qdrant_service.search_similar(
            query_vector=query_vector,
            limit=top_k,
            modality_filter="image",
            category_filter=category,
            location_filter=location,
            score_threshold=score_threshold,
            collection_name=collection_name
        )

        results = self._format_scored_points(scored_points)
        return MatchResponse(
            query_type="image_to_image",
            total_results=len(results),
            results=results,
            query_preview="Query Image (Uploaded)"
        )

    def search_text_to_text(
        self,
        query_text: str,
        top_k: int = 5,
        category: Optional[str] = None,
        location: Optional[str] = None,
        score_threshold: Optional[float] = None,
        collection_name: Optional[str] = None
    ) -> MatchResponse:
        """
        Workflow 4: Text-to-Text
        Accepts a text query, generates its embedding, and searches existing TEXT descriptions.
        Returns semantically similar complaint descriptions.
        """
        top_k = min(max(1, top_k), settings.max_top_k)
        query_vector = self.embedding_service.encode_text(query_text, normalize=True).tolist()

        scored_points = self.qdrant_service.search_similar(
            query_vector=query_vector,
            limit=top_k,
            modality_filter="text",
            category_filter=category,
            location_filter=location,
            score_threshold=score_threshold,
            collection_name=collection_name
        )

        results = self._format_scored_points(scored_points)
        return MatchResponse(
            query_type="text_to_text",
            total_results=len(results),
            results=results,
            query_preview=query_text
        )

    def _format_scored_points(self, scored_points: List[Any]) -> List[MatchItem]:
        """Formats and sorts Qdrant scored points into standardized MatchItem responses."""
        match_items = []
        for pt in scored_points:
            payload = pt.payload or {}
            # In Qdrant, cosine distance score is cosine similarity directly (from -1 to 1)
            raw_score = float(pt.score)
            raw_score = max(-1.0, min(1.0, raw_score))
            similarity_pct = round(raw_score * 100.0, 2)

            match_items.append(
                MatchItem(
                    record_id=str(payload.get("record_id", pt.id)),
                    modality=payload.get("modality"),
                    description=payload.get("description"),
                    image_path=payload.get("image_path"),
                    category=payload.get("category"),
                    location=payload.get("location"),
                    created_at=payload.get("created_at"),
                    similarity=round(raw_score, 4),
                    similarity_percentage=similarity_pct,
                    metadata=payload.get("metadata", {})
                )
            )

        # Sort descending by similarity
        match_items.sort(key=lambda x: x.similarity, reverse=True)
        return match_items


# Global accessor
matching_service = CrossModalMatchingService()
