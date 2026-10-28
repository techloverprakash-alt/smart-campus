import logging
from typing import Optional, Union
import numpy as np

from app.services.embedding_service import embedding_service

logger = logging.getLogger("smart_campus.embedding_adapter")


class EmbeddingAdapter:
    """
    Adapter interfacing with the Jina CLIP v2 inference service for multimodal embeddings.
    Unified 1024-dimensional shared text-image vector representations.
    """
    def __init__(self):
        self.service = embedding_service

    def get_text_vector(self, text: str) -> Optional[np.ndarray]:
        """Generates a normalized 1024-dim embedding for text queries or descriptions."""
        if not text:
            return None
        try:
            return self.service.encode_text(text, normalize=True)
        except Exception as e:
            logger.warning(f"Embedding generation failed: {e}")
            return None

    def get_image_vector(self, image_input: Union[bytes, str]) -> Optional[np.ndarray]:
        """Generates a normalized 1024-dim embedding for image byte buffers or file paths."""
        if not image_input:
            return None
        try:
            return self.service.encode_image(image_input, normalize=True)
        except Exception as e:
            logger.warning(f"Image embedding failed: {e}")
            return None


embedding_adapter = EmbeddingAdapter()
