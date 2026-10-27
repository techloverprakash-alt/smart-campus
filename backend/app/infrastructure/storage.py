import os
import uuid
from pathlib import Path
from typing import Tuple

from fastapi import UploadFile

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class MediaStorageAdapter:
    """
    Handles file persistence for uploaded photos and receipts.
    """
    def __init__(self, upload_dir: Path = UPLOAD_DIR):
        self.upload_dir = upload_dir

    async def save_upload(self, file: UploadFile) -> Tuple[str, str]:
        """
        Saves uploaded file to disk and returns (file_path, file_url).
        """
        ext = Path(file.filename or "photo.jpg").suffix or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        destination = self.upload_dir / unique_name

        content = await file.read()
        with open(destination, "wb") as f:
            f.write(content)

        file_url = f"/static/uploads/{unique_name}"
        return str(destination), file_url


storage_adapter = MediaStorageAdapter()
