import os
from pathlib import Path
from pydantic import BaseModel

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    # App Settings
    app_name: str = "Smart Campus Cross-Modal Matching Service"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() in ("true", "1")
    
    # Qdrant Vector DB Settings
    # Matches existing docker container 'smart-campus-qdrant' at localhost:6333
    qdrant_host: str = os.getenv("QDRANT_HOST", "http://localhost:6333")
    qdrant_grpc_port: int = int(os.getenv("QDRANT_GRPC_PORT", "6334"))
    qdrant_collection_name: str = os.getenv("QDRANT_COLLECTION", "smart_campus_lost_found")
    
    # Model Configuration
    # Supported variants in ml-mobileclip: mobileclip_s0, mobileclip_s1, mobileclip_s2, mobileclip_b
    model_name: str = os.getenv("MOBILECLIP_MODEL_NAME", "mobileclip_s0")
    
    # Checkpoint path (optional; will use weights if present, or architecture defaults)
    checkpoints_dir: Path = BASE_DIR / "checkpoints"
    checkpoint_path: Path = BASE_DIR / "checkpoints" / "mobileclip_s0.pt"
    
    # Path to Apple's ml-mobileclip source directory
    mobileclip_source_dir: Path = BASE_DIR / "ml-mobileclip"
    
    # Shared Embedding Dimension for MobileCLIP-S0 / S1 / S2 is 512
    embedding_dim: int = 512
    
    # Search settings
    default_top_k: int = 5
    # JWT and Security Settings
    jwt_secret: str = os.getenv("JWT_SECRET", "nexus-smart-campus-super-secret-jwt-key-2026")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    class Config:
        arbitrary_types_allowed = True

settings = Settings()
