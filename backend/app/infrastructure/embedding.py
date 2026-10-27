import logging
from typing import Optional
import numpy as np

from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


class EmbeddingAdapter:
    """
    Adapter interfacing with the MobileCLIP inference model for multimodal feature extraction.
    """
    def __init__(self):
        self.service = embedding_service

    def get_text_vector(self, text: str) -> Optional[np.ndarray]:
        """Generates a normalized 512-dim embedding for text queries or descriptions."""
        if not text:
            return None
        try:
            if not self.service.is_loaded:
                self.service.initialize()
            return self.service.encode_text(text, normalize=True)
        except Exception as e:
            logger.warning(f"Embedding generation failed: {e}")
            return None

    def get_image_vector(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Generates a normalized 512-dim embedding for image byte buffers."""
        if not image_bytes:
            return None
        try:
            if not self.service.is_loaded:
                self.service.initialize()
            return self.service.encode_image(image_bytes, normalize=True)
        except Exception as e:
            logger.warning(f"Image embedding failed: {e}")
            return None


embedding_adapter = EmbeddingAdapter()
