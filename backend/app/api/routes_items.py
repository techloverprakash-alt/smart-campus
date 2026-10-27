import asyncio
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas import ItemIndexRequest, ItemIndexResponse
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service

router = APIRouter(prefix="/api/items", tags=["Item Indexing"])


@router.post(
    "/index-text",
    response_model=ItemIndexResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Index item text description into Qdrant"
)
async def index_item_text(payload: ItemIndexRequest):
    """
    Generates text embedding and indexes an item description into Qdrant.
    """
    if not payload.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required for text indexing."
        )

    try:
        vector = await asyncio.to_thread(
            embedding_service.encode_text,
            payload.description,
            True
        )

        created_at = payload.created_at or datetime.utcnow().isoformat()

        point_id = await asyncio.to_thread(
            qdrant_service.upsert_embedding,
            record_id=payload.record_id,
            modality="text",
            vector=vector.tolist(),
            description=payload.description,
            image_path=payload.image_path,
            category=payload.category,
            location=payload.location,
            created_at=created_at,
            additional_metadata=payload.metadata
        )

        return ItemIndexResponse(
            status="indexed",
            record_id=payload.record_id,
            indexed_modalities=["text"],
            point_ids=[point_id],
            collection=qdrant_service.collection_name
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index text item: {str(exc)}"
        )


@router.post(
    "/index-image",
    response_model=ItemIndexResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Index item image into Qdrant"
)
async def index_item_image(
    record_id: str = Form(..., description="Unique campus item or complaint identifier"),
    file: UploadFile = File(..., description="Image file to encode and store in Qdrant"),
    description: Optional[str] = Form(None, description="Optional accompanying text description"),
    category: Optional[str] = Form(None, description="Category of the item"),
    location: Optional[str] = Form(None, description="Campus location"),
    created_at: Optional[str] = Form(None, description="Timestamp ISO format")
):
    """
    Encodes an image file and stores its MobileCLIP embedding into Qdrant.
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{file.filename}' is not a valid image."
        )

    try:
        image_bytes = await file.read()
        vector = await asyncio.to_thread(
            embedding_service.encode_image,
            image_bytes,
            True
        )

        timestamp = created_at or datetime.utcnow().isoformat()

        point_id = await asyncio.to_thread(
            qdrant_service.upsert_embedding,
            record_id=record_id,
            modality="image",
            vector=vector.tolist(),
            description=description,
            image_path=file.filename,
            category=category,
            location=location,
            created_at=timestamp
        )

        return ItemIndexResponse(
            status="indexed",
            record_id=record_id,
            indexed_modalities=["image"],
            point_ids=[point_id],
            collection=qdrant_service.collection_name
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index image item: {str(exc)}"
        )


@router.delete(
    "/{record_id}",
    summary="Delete all embeddings associated with a record ID from Qdrant"
)
async def delete_item(record_id: str):
    """
    Deletes all vector points (both image and text modalities) for a specific record_id.
    """
    success = await asyncio.to_thread(
        qdrant_service.delete_by_record_id,
        record_id=record_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not delete record '{record_id}'."
        )
    return {"status": "deleted", "record_id": record_id}


@router.get("/stats", summary="Get vector count in Qdrant collection")
async def get_collection_stats():
    """
    Returns total number of points stored in the active Qdrant collection.
    """
    count = await asyncio.to_thread(qdrant_service.get_collection_count)
    return {
        "collection": qdrant_service.collection_name,
        "total_points": count
    }
