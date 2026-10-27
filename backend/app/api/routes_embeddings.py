import asyncio
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas import EmbeddingResponse, TextEmbeddingRequest
from app.services.embedding_service import embedding_service

router = APIRouter(prefix="/api/embeddings", tags=["Embeddings"])


@router.post(
    "/text", 
    response_model=EmbeddingResponse, 
    status_code=status.HTTP_200_OK,
    summary="Generate text embedding using MobileCLIP"
)
async def generate_text_embedding(payload: TextEmbeddingRequest):
    """
    Encodes a text description or query into the shared 512-dimensional vector space.
    Raw vector is withheld by default unless `return_vector=True`.
    """
    try:
        # Offload CPU/GPU inference to thread to keep asyncio event loop responsive
        vector = await asyncio.to_thread(
            embedding_service.encode_text, 
            payload.text, 
            True  # normalize
        )
        return EmbeddingResponse(
            status="success",
            dimension=len(vector),
            modality="text",
            embedding=vector.tolist() if payload.return_vector else None
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate text embedding: {str(exc)}"
        )


@router.post(
    "/image", 
    response_model=EmbeddingResponse, 
    status_code=status.HTTP_200_OK,
    summary="Generate image embedding using MobileCLIP"
)
async def generate_image_embedding(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WEBP)"),
    return_vector: bool = Form(False, description="Whether to include raw vector array in response")
):
    """
    Validates uploaded image and encodes it into the shared MobileCLIP embedding space.
    Raw vector is withheld by default unless `return_vector=True`.
    """
    # Validate mime type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file type '{file.content_type}' is not a valid image."
        )

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image file received."
            )

        # Offload encoding to thread pool
        vector = await asyncio.to_thread(
            embedding_service.encode_image, 
            image_bytes, 
            True  # normalize
        )

        return EmbeddingResponse(
            status="success",
            dimension=len(vector),
            modality="image",
            embedding=vector.tolist() if return_vector else None
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate image embedding: {str(exc)}"
        )
