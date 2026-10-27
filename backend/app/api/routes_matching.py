import asyncio
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.schemas import (
    DirectComparisonResponse,
    MatchResponse,
    TextSearchRequest,
)
from app.services.matching_service import matching_service

router = APIRouter(prefix="/api/matches", tags=["Matching"])


@router.post(
    "/text-to-image",
    response_model=MatchResponse,
    summary="Workflow 1: Text-to-Image Search"
)
async def text_to_image_search(payload: TextSearchRequest):
    """
    Search stored image records matching a natural language text query (e.g., 'black backpack in library').
    """
    try:
        response = await asyncio.to_thread(
            matching_service.search_text_to_image,
            query_text=payload.text,
            top_k=payload.top_k,
            category=payload.category,
            location=payload.location,
            score_threshold=payload.score_threshold
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-image search failed: {str(exc)}"
        )


@router.post(
    "/image-to-text",
    response_model=MatchResponse,
    summary="Workflow 2: Image-to-Text Search"
)
async def image_to_text_search(
    file: UploadFile = File(..., description="Query image to match against campus text records"),
    top_k: int = Form(5, ge=1, le=50, description="Max matches to return"),
    category: Optional[str] = Form(None, description="Optional category filter"),
    location: Optional[str] = Form(None, description="Optional campus location filter"),
    score_threshold: Optional[float] = Form(None, ge=-1.0, le=1.0, description="Minimum similarity score")
):
    """
    Upload an image to retrieve matching lost/found text descriptions from Qdrant.
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{file.filename}' is not a valid image."
        )

    try:
        image_bytes = await file.read()
        response = await asyncio.to_thread(
            matching_service.search_image_to_text,
            image_input=image_bytes,
            top_k=top_k,
            category=category,
            location=location,
            score_threshold=score_threshold
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image-to-text search failed: {str(exc)}"
        )


@router.post(
    "/image-to-image",
    response_model=MatchResponse,
    summary="Workflow 3: Image-to-Image Search"
)
async def image_to_image_search(
    file: UploadFile = File(..., description="Query image to find visually similar items"),
    top_k: int = Form(5, ge=1, le=50, description="Max matches to return"),
    category: Optional[str] = Form(None, description="Optional category filter"),
    location: Optional[str] = Form(None, description="Optional campus location filter"),
    score_threshold: Optional[float] = Form(None, ge=-1.0, le=1.0, description="Minimum similarity score")
):
    """
    Upload an image to retrieve visually similar items previously indexed in the system.
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{file.filename}' is not a valid image."
        )

    try:
        image_bytes = await file.read()
        response = await asyncio.to_thread(
            matching_service.search_image_to_image,
            image_input=image_bytes,
            top_k=top_k,
            category=category,
            location=location,
            score_threshold=score_threshold
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image-to-image search failed: {str(exc)}"
        )


@router.post(
    "/text-to-text",
    response_model=MatchResponse,
    summary="Workflow 4: Text-to-Text Search"
)
async def text_to_text_search(payload: TextSearchRequest):
    """
    Find semantically similar descriptions in Qdrant based on a text search query.
    """
    try:
        response = await asyncio.to_thread(
            matching_service.search_text_to_text,
            query_text=payload.text,
            top_k=payload.top_k,
            category=payload.category,
            location=payload.location,
            score_threshold=payload.score_threshold
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-text search failed: {str(exc)}"
        )


@router.post(
    "/direct-compare",
    response_model=DirectComparisonResponse,
    summary="Direct Image vs Text Cosine Similarity"
)
async def direct_compare(
    file: UploadFile = File(..., description="Image to compare"),
    text: str = Form(..., description="Text description to compare against")
):
    """
    Directly evaluates cosine similarity between an image and a text string.
    Returns raw similarity and percentage score without database queries.
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{file.filename}' is not a valid image."
        )

    try:
        image_bytes = await file.read()
        response = await asyncio.to_thread(
            matching_service.direct_compare_image_and_text,
            image_input=image_bytes,
            text=text
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Direct comparison failed: {str(exc)}"
        )


@router.post(
    "/compare-images",
    summary="Direct Comparison Between Two Images"
)
async def compare_two_images(
    file1: UploadFile = File(..., description="First image to compare"),
    file2: UploadFile = File(..., description="Second image to compare")
):
    """
    Directly evaluates cosine similarity between two uploaded images.
    Returns raw similarity and percentage score without database queries.
    """
    for f in [file1, file2]:
        if f.content_type and not f.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{f.filename}' is not a valid image."
            )

    try:
        bytes1 = await file1.read()
        bytes2 = await file2.read()

        from app.services.embedding_service import embedding_service

        def _compute():
            v1 = embedding_service.encode_image(bytes1, normalize=True)
            v2 = embedding_service.encode_image(bytes2, normalize=True)
            return embedding_service.calculate_cosine_similarity(v1, v2)

        raw_sim, pct_sim = await asyncio.to_thread(_compute)

        return {
            "similarity": raw_sim,
            "similarity_percentage": pct_sim,
            "image1_name": file1.filename,
            "image2_name": file2.filename,
            "notes": "Cosine similarity between MobileCLIP embeddings. 1.0 (100%) represents identical feature representation."
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image comparison failed: {str(exc)}"
        )


class DirectTextCompareRequest(BaseModel):
    text1: str
    text2: str


@router.post(
    "/compare-texts",
    summary="Direct Comparison Between Two Text Descriptions"
)
async def compare_two_texts(payload: DirectTextCompareRequest):
    """
    Directly evaluates cosine similarity between two text descriptions using MobileCLIP.
    """
    t1 = payload.text1.strip()
    t2 = payload.text2.strip()
    if not t1 or not t2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both texts must be non-empty.")

    try:
        from app.services.embedding_service import embedding_service

        def _compute():
            v1 = embedding_service.encode_text(t1, normalize=True)
            v2 = embedding_service.encode_text(t2, normalize=True)
            return embedding_service.calculate_cosine_similarity(v1, v2)

        raw_sim, pct_sim = await asyncio.to_thread(_compute)

        return {
            "similarity": raw_sim,
            "similarity_percentage": pct_sim,
            "text1_preview": t1[:80],
            "text2_preview": t2[:80],
            "notes": "Cosine similarity between MobileCLIP text embeddings."
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text comparison failed: {str(exc)}"
        )


