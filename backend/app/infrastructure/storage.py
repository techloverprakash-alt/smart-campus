import logging
import os
import uuid
from pathlib import Path
from typing import Optional, Tuple

from fastapi import UploadFile

logger = logging.getLogger("smart_campus.storage")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class MediaStorageAdapter:
    """
    Handles dual file persistence:
    1. Primary: Supabase S3 Storage Bucket ('lost-and-found')
    2. Resilient Fallback / Cache: Local static uploads directory
    """

    def __init__(self, upload_dir: Path = UPLOAD_DIR):
        self.upload_dir = upload_dir
        self.bucket = os.getenv("SUPABASE_S3_BUCKET", "lost-and-found")
        self.supabase_url = os.getenv("SUPABASE_URL", "https://svxpszxdzlmceiahtqmj.supabase.co")
        self.access_key = os.getenv("SUPABASE_ACCESS_KEY_ID")
        self.secret_key = os.getenv("SUPABASE_SCRET_ACCESS_KEY") or os.getenv("SUPABASE_SECRET_ACCESS_KEY")
        self.endpoint = os.getenv("SUPABASE_S3_ENDPOINT")
        self.region = os.getenv("SUPABASE_S3_REGION", "ap-south-1")
        self._s3_client = None

    @property
    def s3_client(self):
        if self._s3_client is None and self.access_key and self.secret_key and self.endpoint:
            try:
                import boto3
                from botocore.config import Config

                self._s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    endpoint_url=self.endpoint,
                    region_name=self.region,
                    config=Config(s3={"addressing_style": "path"}, signature_version="s3v4")
                )
                logger.info(f"Supabase S3 storage client initialized (bucket={self.bucket}, endpoint={self.endpoint})")
            except Exception as e:
                logger.warning(f"Could not initialize Supabase S3 client: {e}")
                self._s3_client = None
        return self._s3_client

    async def save_upload(self, file: UploadFile) -> Tuple[str, str]:
        """
        Saves uploaded file to disk and Supabase S3 bucket.
        Returns (file_path, file_url).
        """
        ext = Path(file.filename or "photo.jpg").suffix or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        destination = self.upload_dir / unique_name

        content = await file.read()

        # 1. Always save a local copy for resilience and static serving
        with open(destination, "wb") as f:
            f.write(content)

        file_url = f"/static/uploads/{unique_name}"

        # 2. Upload to Supabase S3 bucket if available
        client = self.s3_client
        if client:
            try:
                s3_key = f"uploads/{unique_name}"
                content_type = file.content_type or ("image/png" if ext.lower() == ".png" else "image/jpeg")
                client.put_object(
                    Bucket=self.bucket,
                    Key=s3_key,
                    Body=content,
                    ContentType=content_type
                )
                s3_public_url = f"{self.supabase_url.rstrip('/')}/storage/v1/object/public/{self.bucket}/{s3_key}"
                logger.info(f"File uploaded to Supabase S3: {s3_public_url}")
                file_url = s3_public_url
            except Exception as e:
                logger.warning(f"Failed to upload file to Supabase S3, using local URL: {e}")

        return str(destination), file_url


storage_adapter = MediaStorageAdapter()
