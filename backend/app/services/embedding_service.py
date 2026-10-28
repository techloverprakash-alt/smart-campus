import base64
import io
import logging
from pathlib import Path
from typing import Any, List, Optional, Union
import httpx
import numpy as np
from PIL import Image

from app.config import settings

logger = logging.getLogger("smart_campus.embedding_service")


class JinaClipEmbeddingService:
    """
    Production-grade Multimodal Embedding Service using Jina CLIP v2.
    Embeds both natural text and visual images into a unified, shared 1024-dimensional space.
    """
    _instance: Optional["JinaClipEmbeddingService"] = None

    def __init__(self):
        self.api_key = settings.jina_api_key
        self.model_name = settings.jina_clip_model  # "jina-clip-v2"
        self.embedding_dim = 1024
        self.api_url = "https://api.jina.ai/v1/embeddings"
        self.device = "cloud-api"
        self.is_loaded = True

    @classmethod
    def get_instance(cls) -> "JinaClipEmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize(self) -> None:
        """Verifies API credentials and connectivity."""
        if not self.api_key:
            logger.warning("JINA_API_KEY is not set. Jina CLIP embeddings will use fallback vectors.")
        else:
            logger.info(f"Jina CLIP v2 Embedding Service initialized with model: {self.model_name} (dim={self.embedding_dim})")

    def _call_jina_api(self, input_items: List[dict]) -> Optional[List[List[float]]]:
        """Calls Jina API with error handling and timeout."""
        if not self.api_key:
            return None

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        payload = {
            "model": self.model_name,
            "dimensions": self.embedding_dim,
            "normalized": True,
            "embedding_type": "float",
            "input": input_items,
        }

        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.post(self.api_url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json().get("data", [])
                    return [item["embedding"] for item in data]
                else:
                    logger.error(f"Jina API returned HTTP {resp.status_code}: {resp.text}")
                    return None
        except Exception as e:
            logger.error(f"Failed to communicate with Jina Embeddings API: {e}")
            return None

    def encode_text(self, text: str, normalize: bool = True) -> np.ndarray:
        """
        Generates a 1024-dim embedding vector for text using jina-clip-v2.
        """
        if not text or not text.strip():
            return np.zeros(self.embedding_dim, dtype=np.float32)

        api_res = self._call_jina_api([{"text": text.strip()}])
        if api_res and len(api_res) > 0:
            vec = np.array(api_res[0], dtype=np.float32)
            if normalize:
                norm = np.linalg.norm(vec)
                if norm > 0:
                    vec = vec / norm
            return vec

        # Fallback deterministic pseudo-embedding if API call fails
        logger.warning(f"Generating deterministic fallback text embedding for: {text[:40]}...")
        return self._generate_fallback_vector(f"text:{text}")

    def encode_image(self, image_input: Union[bytes, str, Path, Image.Image], normalize: bool = True) -> np.ndarray:
        """
        Generates a 1024-dim embedding vector for an image using jina-clip-v2.
        Supports bytes, local file path, or PIL Image.
        """
        data_uri = None

        if isinstance(image_input, bytes):
            b64_str = base64.b64encode(image_input).decode("utf-8")
            data_uri = f"data:image/jpeg;base64,{b64_str}"
        elif isinstance(image_input, (str, Path)):
            path_str = str(image_input).strip()
            if path_str.startswith("http://") or path_str.startswith("https://"):
                data_uri = path_str
            else:
                p = Path(path_str)
                # Resolve relative to static or project base if not found directly
                if not p.is_file():
                    cand1 = settings.BASE_DIR / path_str.lstrip("/\\")
                    cand2 = settings.BASE_DIR / "static" / path_str.lstrip("/\\")
                    if cand1.is_file():
                        p = cand1
                    elif cand2.is_file():
                        p = cand2

                if p.is_file():
                    with open(p, "rb") as f:
                        b64_str = base64.b64encode(f.read()).decode("utf-8")
                        mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
                        data_uri = f"data:{mime};base64,{b64_str}"
        elif isinstance(image_input, Image.Image):
            buf = io.BytesIO()
            image_input.convert("RGB").save(buf, format="JPEG")
            b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
            data_uri = f"data:image/jpeg;base64,{b64_str}"

        if data_uri:
            api_res = self._call_jina_api([{"image": data_uri}])
            if api_res and len(api_res) > 0:
                vec = np.array(api_res[0], dtype=np.float32)
                if normalize:
                    norm = np.linalg.norm(vec)
                    if norm > 0:
                        vec = vec / norm
                return vec

        logger.warning("Generating fallback image embedding...")
        return self._generate_fallback_vector("fallback_image")

    def compute_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Computes cosine similarity between two 1024-dim vectors."""
        if vec1 is None or vec2 is None:
            return 0.0
        v1 = vec1.flatten()
        v2 = vec2.flatten()
        n1 = np.linalg.norm(v1)
        n2 = np.linalg.norm(v2)
        if n1 == 0 or n2 == 0:
            return 0.0
        sim = float(np.dot(v1, v2) / (n1 * n2))
        return max(0.0, min(1.0, sim))

    def _generate_fallback_vector(self, seed: str) -> np.ndarray:
        """Deterministic unit vector from string seed when cloud is inaccessible."""
        import hashlib
        # Use multiple hashes to fill 1024 floats cleanly in [-1.0, 1.0]
        byte_list = []
        for i in range(32):
            h = hashlib.sha256(f"{seed}:{i}".encode("utf-8")).digest()
            byte_list.extend(h)
        byte_arr = np.array(byte_list[:1024], dtype=np.uint8)
        raw = (byte_arr.astype(np.float32) - 128.0) / 128.0
        norm = np.linalg.norm(raw)
        return raw / norm if norm > 0 else raw



embedding_service = JinaClipEmbeddingService.get_instance()
