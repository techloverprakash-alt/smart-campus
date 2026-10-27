import io
import logging
import sys
from pathlib import Path
from typing import Any, List, Optional, Tuple, Union

import numpy as np
from PIL import Image

from app.config import settings

logger = logging.getLogger(__name__)

# Ensure ml-mobileclip directory is on sys.path
mobileclip_dir = str(settings.mobileclip_source_dir.resolve())
if mobileclip_dir not in sys.path:
    sys.path.insert(0, mobileclip_dir)


class MobileCLIPEmbeddingService:
    """
    Singleton service for cross-modal MobileCLIP embedding generation.
    Supports both image and text encoding into a shared 512-dimensional vector space.
    """
    _instance: Optional["MobileCLIPEmbeddingService"] = None

    def __init__(self):
        self.device = "cpu"
        self.model: Optional[Any] = None
        self.preprocess: Optional[Any] = None
        self.tokenizer: Optional[Any] = None
        self.embedding_dim: int = settings.embedding_dim
        self.is_loaded: bool = False
        self.checkpoint_loaded: bool = False

    @classmethod
    def get_instance(cls) -> "MobileCLIPEmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize(self) -> None:
        """
        Loads the configured MobileCLIP model, preprocessing transforms, and tokenizer.
        Automatically selects CUDA if available and compatible; falls back to CPU.
        """
        if self.is_loaded:
            logger.info("MobileCLIP model already loaded.")
            return

        try:
            import torch
            
            # 1. Device selection
            if torch.cuda.is_available():
                self.device = "cuda"
                device_name = torch.cuda.get_device_name(0)
                logger.info(f"Using CUDA device: {device_name}")
            else:
                self.device = "cpu"
                logger.info("CUDA not available. Falling back to CPU.")

            # 2. Check for checkpoint file
            checkpoint_file = settings.checkpoint_path
            pretrained_path = str(checkpoint_file) if checkpoint_file.exists() else None
            if pretrained_path:
                logger.info(f"Found MobileCLIP checkpoint at {pretrained_path}")
            else:
                logger.warning(
                    f"Checkpoint not found at {checkpoint_file}. Initializing model architecture. "
                    "Place 'mobileclip_s0.pt' in the checkpoints folder for pre-trained weights."
                )

            # 3. Create model and preprocessing transforms using mobileclip
            try:
                import mobileclip
                
                # create_model_and_transforms handles config loading, model instantiation, 
                # checkpoint weight loading, and inference reparameterization
                self.model, _, self.preprocess = mobileclip.create_model_and_transforms(
                    model_name=settings.model_name,
                    pretrained=pretrained_path,
                    reparameterize=True,
                    device=self.device,
                )
                self.model.eval()
                self.checkpoint_loaded = pretrained_path is not None
                
                # 4. Tokenizer
                self.tokenizer = mobileclip.get_tokenizer(settings.model_name)
                logger.info("MobileCLIP model and tokenizer initialized successfully.")
            except Exception as e:
                logger.error(f"Error loading via mobileclip module: {e}. Attempting custom fallback pipeline...")
                self._initialize_fallback(pretrained_path)

            # Record actual embedding dimension
            if hasattr(self.model, "projection_dim") and self.model.projection_dim:
                self.embedding_dim = self.model.projection_dim
            else:
                self.embedding_dim = settings.embedding_dim

            self.is_loaded = True
            logger.info(
                f"MobileCLIP ready on {self.device} with shared embedding dimension: {self.embedding_dim}"
            )

        except Exception as exc:
            self.is_loaded = False
            logger.error(f"Failed to initialize MobileCLIP embedding service: {exc}", exc_info=True)
            raise RuntimeError(f"MobileCLIP initialization error: {str(exc)}") from exc

    def _initialize_fallback(self, pretrained_path: Optional[str]) -> None:
        """Fallback initialization in case open_clip or dependencies need direct resolution."""
        import torch
        from torchvision.transforms import Compose, Resize, CenterCrop, ToTensor, Normalize, InterpolationMode

        logger.info("Building preprocessing pipeline...")
        self.preprocess = Compose([
            Resize(256, interpolation=InterpolationMode.BILINEAR),
            CenterCrop(256),
            ToTensor(),
            Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ])

        # Attempt to load model definition directly from mobileclip.clip
        try:
            import json
            from mobileclip.clip import CLIP
            config_file = settings.mobileclip_source_dir / "mobileclip" / "configs" / f"{settings.model_name}.json"
            with open(config_file, "r") as f:
                cfg = json.load(f)
            
            self.model = CLIP(cfg=cfg)
            if pretrained_path:
                chkpt = torch.load(pretrained_path, map_location=self.device)
                self.model.load_state_dict(chkpt, strict=False)
                self.checkpoint_loaded = True
            self.model.to(self.device)
            self.model.eval()
            
            # Simple tokenizer fallback if needed
            from mobileclip.modules.text.tokenizer import ClipTokenizer
            self.tokenizer = ClipTokenizer(cfg)
        except Exception as err:
            raise RuntimeError(f"Fallback initialization failed: {err}")

    def validate_image_input(self, image_data: Union[bytes, Image.Image, Path, str]) -> Image.Image:
        """
        Validates and converts image input to an RGB PIL Image.
        Raises ValueError with clear message if image is corrupt or invalid.
        """
        try:
            if isinstance(image_data, Image.Image):
                img = image_data
            elif isinstance(image_data, bytes):
                img = Image.open(io.BytesIO(image_data))
            elif isinstance(image_data, (Path, str)):
                p = Path(image_data)
                if not p.is_file():
                    raise ValueError(f"Image file does not exist at path: {image_data}")
                img = Image.open(p)
            else:
                raise ValueError(f"Unsupported image input type: {type(image_data)}")

            # Verify integrity
            img.verify()
            
            # Reopen because verify() closes the file/buffer in PIL
            if isinstance(image_data, bytes):
                img = Image.open(io.BytesIO(image_data)).convert("RGB")
            elif isinstance(image_data, (Path, str)):
                img = Image.open(Path(image_data)).convert("RGB")
            else:
                img = img.convert("RGB")

            # Check dimensions
            if img.width < 10 or img.height < 10:
                raise ValueError(f"Image resolution too small ({img.width}x{img.height}) to extract features.")

            return img
        except Exception as exc:
            if isinstance(exc, ValueError):
                raise
            raise ValueError(f"Invalid or unreadable image file: {str(exc)}")

    def encode_image(
        self, 
        image_input: Union[bytes, Image.Image, Path, str], 
        normalize: bool = True
    ) -> np.ndarray:
        """
        Preprocesses and encodes an image into the shared embedding space.
        
        Args:
            image_input: Image bytes, PIL Image, or file path.
            normalize: Whether to apply L2 normalization (required for cosine similarity).
            
        Returns:
            np.ndarray: 1D float32 numpy array of shape (embedding_dim,).
        """
        if not self.is_loaded or self.model is None:
            self.initialize()

        import torch

        # Validate and open image
        pil_image = self.validate_image_input(image_input)

        try:
            # Apply exact preprocessing
            image_tensor = self.preprocess(pil_image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                features = self.model.encode_image(image_tensor, normalize=normalize)
                if isinstance(features, dict):
                    features = features.get("logits", features.get("image_features", features))
                
                # Ensure 1D numpy array
                vector = features.squeeze(0).cpu().numpy().astype(np.float32)

            if normalize:
                norm = np.linalg.norm(vector)
                if norm > 0:
                    vector = vector / norm

            return vector
        except Exception as exc:
            logger.error(f"Image encoding failed: {exc}", exc_info=True)
            raise RuntimeError(f"Image embedding generation error: {str(exc)}")

    def encode_text(self, text: str, normalize: bool = True) -> np.ndarray:
        """
        Tokenizes and encodes text description/query into the shared embedding space.
        
        Args:
            text: Non-empty query string.
            normalize: Whether to apply L2 normalization (required for cosine similarity).
            
        Returns:
            np.ndarray: 1D float32 numpy array of shape (embedding_dim,).
        """
        if not self.is_loaded or self.model is None:
            self.initialize()

        import torch

        cleaned = text.strip() if text else ""
        if not cleaned:
            raise ValueError("Input text cannot be empty or whitespace only.")

        try:
            # Tokenize using MobileCLIP tokenizer
            if callable(self.tokenizer):
                tokens = self.tokenizer(cleaned).to(self.device)
            else:
                tokens = self.tokenizer.forward(cleaned).to(self.device)

            if tokens.ndim == 1:
                tokens = tokens.unsqueeze(0)

            with torch.no_grad():
                features = self.model.encode_text(tokens, normalize=normalize)
                if isinstance(features, dict):
                    features = features.get("logits", features.get("text_features", features))

                vector = features.squeeze(0).cpu().numpy().astype(np.float32)

            if normalize:
                norm = np.linalg.norm(vector)
                if norm > 0:
                    vector = vector / norm

            return vector
        except Exception as exc:
            logger.error(f"Text encoding failed for query '{cleaned}': {exc}", exc_info=True)
            raise RuntimeError(f"Text embedding generation error: {str(exc)}")

    @staticmethod
    def calculate_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> Tuple[float, float]:
        """
        Computes cosine similarity between two vectors:
            similarity = dot(u, v) / (norm(u) * norm(v))
        
        Returns:
            Tuple of (raw_similarity, similarity_percentage)
            where raw_similarity is in [-1.0, 1.0] and percentage is raw_similarity * 100.
        """
        if vec1.shape != vec2.shape:
            raise ValueError(
                f"Incompatible vector dimensions: {vec1.shape} vs {vec2.shape}. "
                "Both must originate from the same embedding space."
            )

        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0, 0.0

        raw_similarity = float(np.dot(vec1, vec2) / (norm1 * norm2))
        
        # Clamp to [-1.0, 1.0] to account for any small floating point rounding issues
        raw_similarity = max(-1.0, min(1.0, raw_similarity))
        
        # Format percentage: similarity * 100
        similarity_percentage = round(raw_similarity * 100.0, 2)
        
        return round(raw_similarity, 4), similarity_percentage


# Global accessor
embedding_service = MobileCLIPEmbeddingService.get_instance()
