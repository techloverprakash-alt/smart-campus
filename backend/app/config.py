import os
from pathlib import Path
from pydantic import BaseModel

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file into os.environ if present
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\""))

class Settings(BaseModel):
    # App Settings
    app_name: str = "Smart Campus Cross-Modal Matching Service"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() in ("true", "1")
    
    # Qdrant Vector DB Settings
    # Supports cloud cluster endpoint if set, otherwise falls back to local host
    qdrant_cluster_endpoint: str = os.getenv("QDRANT_CLUSTER_ENDPOINT", "").strip()
    qdrant_api_key: str = os.getenv("QDRANT_API_KEY", "").strip()
    qdrant_host: str = os.getenv("QDRANT_HOST", "http://localhost:6333").strip()
    qdrant_grpc_port: int = int(os.getenv("QDRANT_GRPC_PORT", "6334"))
    qdrant_collection_name: str = os.getenv("QDRANT_COLLECTION", "nexus_lost_found_jina")
    
    # Model Configuration: Jina CLIP v2 Multimodal Cloud Embeddings
    jina_api_key: str = os.getenv("JINA_API_KEY", "").strip()
    jina_clip_model: str = os.getenv("JINA_CLIP_MODEL", "jina-clip-v2")
    model_name: str = os.getenv("MOBILECLIP_MODEL_NAME", "mobileclip_s0")
    
    # Checkpoint path (optional fallback)
    checkpoints_dir: Path = BASE_DIR / "checkpoints"
    checkpoint_path: Path = BASE_DIR / "checkpoints" / "mobileclip_s0.pt"
    
    # Path to Apple's ml-mobileclip source directory
    mobileclip_source_dir: Path = BASE_DIR / "ml-mobileclip"
    
    # Shared Multimodal Embedding Dimension for jina-clip-v2 is 1024
    embedding_dim: int = 1024
    
    # Search settings
    default_top_k: int = 5
    # JWT and Security Settings
    jwt_secret: str = os.getenv("JWT_SECRET", "nexus-smart-campus-super-secret-jwt-key-2026")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    class Config:
        arbitrary_types_allowed = True

settings = Settings()
