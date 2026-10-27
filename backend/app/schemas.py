from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class TextEmbeddingRequest(BaseModel):
    """Request payload for text embedding generation."""
    text: str = Field(..., description="Text query or description to embed")
    return_vector: bool = Field(
        False, 
        description="Whether to return the full raw vector array. Defaults to False to conserve bandwidth."
    )

    @field_validator("text")
    def validate_text(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Text cannot be empty or whitespace only.")
        return stripped


class EmbeddingResponse(BaseModel):
    """Response containing embedding metadata and optional vector."""
    status: str = Field("success", description="Status of the embedding operation")
    dimension: int = Field(..., description="Dimensionality of the embedding vector")
    modality: Literal["image", "text"] = Field(..., description="Modality of the input")
    embedding: Optional[List[float]] = Field(
        None, 
        description="The raw embedding vector (included only when explicitly requested)"
    )


class DirectComparisonResponse(BaseModel):
    """Response for direct image-to-text cosine similarity comparison."""
    similarity: float = Field(..., description="Raw cosine similarity score between -1.0 and 1.0")
    similarity_percentage: float = Field(
        ..., 
        description="Percentage formatted similarity score (similarity * 100). Note: Ranking signal, not identity probability."
    )
    text_preview: str = Field(..., description="Preview of compared text description")
    notes: str = Field(
        "Similarity is a ranking metric and comparative score, not a definitive proof of identity.",
        description="Interpretation guidance"
    )


class MatchItem(BaseModel):
    """A single matched record with similarity metrics and metadata."""
    record_id: str = Field(..., description="Unique campus item or complaint identifier")
    modality: Optional[str] = Field(None, description="Modality of the stored record ('image' or 'text')")
    description: Optional[str] = Field(None, description="Item description if available")
    image_path: Optional[str] = Field(None, description="Path or URL to stored item image")
    category: Optional[str] = Field(None, description="Item category (e.g. 'electronics', 'clothing', 'documents')")
    location: Optional[str] = Field(None, description="Campus location (e.g. 'library', 'cafeteria', 'hall-a')")
    created_at: Optional[str] = Field(None, description="Timestamp when record was indexed")
    similarity: float = Field(..., description="Raw cosine similarity (-1.0 to 1.0)")
    similarity_percentage: float = Field(
        ..., 
        description="Percentage formatted similarity score (similarity * 100)"
    )
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional custom metadata")


class MatchResponse(BaseModel):
    """Standardized response structure for all cross-modal search workflows."""
    query_type: Literal[
        "text_to_image", 
        "image_to_text", 
        "image_to_image", 
        "text_to_text"
    ] = Field(..., description="Type of search executed")
    total_results: int = Field(..., description="Number of results returned")
    results: List[MatchItem] = Field(
        default_factory=list, 
        description="List of matched items sorted in descending order of similarity"
    )
    query_preview: Optional[str] = Field(None, description="Summary or text of the query")
    notes: str = Field(
        "Similarity is a ranking signal, not proof of item identity. Match thresholds require empirical campus validation.",
        description="Interpretation guidance"
    )


class TextSearchRequest(BaseModel):
    """Request payload for text-initiated searches (text-to-image or text-to-text)."""
    text: str = Field(..., description="Search query description")
    top_k: int = Field(5, ge=1, le=50, description="Maximum number of matches to return")
    category: Optional[str] = Field(None, description="Optional filter by item category")
    location: Optional[str] = Field(None, description="Optional filter by campus location")
    score_threshold: Optional[float] = Field(
        None, 
        ge=-1.0, 
        le=1.0, 
        description="Optional minimum cosine similarity threshold"
    )

    @field_validator("text")
    def validate_text(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Query text cannot be empty or whitespace only.")
        return stripped


class ItemIndexRequest(BaseModel):
    """Request payload to index a lost/found item description or image into Qdrant."""
    record_id: str = Field(..., description="Authoritative complaint or item ID from relational DB")
    modality: Literal["image", "text", "both"] = Field("both", description="Modality being indexed")
    description: Optional[str] = Field(None, description="Text description of the item")
    image_path: Optional[str] = Field(None, description="Local path or URI to the item image")
    category: Optional[str] = Field(None, description="Item category")
    location: Optional[str] = Field(None, description="Campus location where found or lost")
    created_at: Optional[str] = Field(None, description="ISO timestamp")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional custom metadata")


class ItemIndexResponse(BaseModel):
    """Response returned after indexing an item into Qdrant."""
    status: str = "indexed"
    record_id: str
    indexed_modalities: List[str]
    point_ids: List[str]
    collection: str


class HealthResponse(BaseModel):
    """System health and operational status."""
    status: str
    app_name: str
    model_name: str
    embedding_dimension: int
    device: str
    model_loaded: bool
    qdrant_connected: bool
    collection_name: str
    total_vectors_in_collection: int


# =====================================================================
# Automated Lost-and-Found Matching Engine Schemas
# =====================================================================

class ReportCreate(BaseModel):
    """Request payload to create a new Lost or Found item report."""
    report_id: Optional[str] = Field(None, description="Optional custom report ID (e.g. 'lost_001'). Auto-generated if omitted.")
    report_type: Literal["lost", "found"] = Field(..., description="Whether this report is for a lost or found item")
    title: str = Field(..., min_length=2, max_length=200, description="Short title of the item")
    description: str = Field(..., min_length=3, description="Detailed item description")
    category: str = Field(..., description="Item category (e.g. electronics, accessories, clothing, documents, keys)")
    color: Optional[str] = Field(None, description="Primary item color (e.g. black, red, silver)")
    brand: Optional[str] = Field(None, description="Brand name (e.g. Apple, Dell, Hydro Flask, Nike)")
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional custom item attributes")
    location_id: str = Field(..., description="Campus location identifier (e.g. 'library_floor_2', 'gym_court_1')")
    location_name: Optional[str] = Field(None, description="Human readable location name")
    incident_datetime: Optional[str] = Field(None, description="ISO datetime string of incident")
    user_id: str = Field(..., description="User ID of the student submitting the report")
    user_contact_private: Optional[str] = Field(None, description="Private contact info; never exposed in public match results")


class ReportOut(BaseModel):
    """Public-safe representation of a student report."""
    id: str
    report_type: str
    title: str
    description: str
    category: str
    color: Optional[str] = None
    brand: Optional[str] = None
    location_id: str
    location_name: str
    incident_datetime: Optional[str] = None
    image_path: Optional[str] = None
    has_image: bool
    status: str
    user_id: str
    created_at: str
    updated_at: str


class SignalScores(BaseModel):
    """Multi-signal evaluation scores normalized between 0.0 and 1.0."""
    text: Optional[float] = Field(None, description="MobileCLIP text description semantic similarity")
    image: Optional[float] = Field(None, description="MobileCLIP visual cosine similarity (None if image missing)")
    keyword: Optional[float] = Field(None, description="Attribute matching score (category, color, brand, keywords)")
    location: Optional[float] = Field(None, description="Campus location proximity score")
    time: Optional[float] = Field(None, description="Incident date and time compatibility score")


class CandidateMatchItem(BaseModel):
    """A ranked candidate match between a lost report and found report."""
    match_id: str
    candidate_report_id: str
    candidate_report_type: str
    title: str
    description: str
    category: str
    color: Optional[str] = None
    brand: Optional[str] = None
    location_name: str
    incident_datetime: Optional[str] = None
    image_path: Optional[str] = None
    has_image: bool
    ranking_score: float = Field(..., description="Combined weighted ranking score (0.0 to 1.0)")
    ranking_percentage: float = Field(..., description="Ranking score formatted as percentage")
    signals: SignalScores
    reasons: List[str] = Field(default_factory=list, description="Human-interpretable explanation reasons")
    status: str = Field("potential_match", description="Match review status")
    is_reviewed: bool = False
    evaluated_at: str


class ReportVerificationSummary(BaseModel):
    """Summary of a report for manual verification dispatch."""
    report_id: str
    report_type: str
    title: str
    description: str
    category: str
    color: Optional[str] = None
    brand: Optional[str] = None
    location_name: str
    incident_datetime: Optional[str] = Field(None, description="Incident time is completely optional; null if unspecified")
    has_image: bool
    image_path: Optional[str] = None
    user_id: str
    status: str


class ManualVerificationPacket(BaseModel):
    """
    Structured JavaScript/JSON verification packet formatted for manual verification sending.
    Contains top similarity score, full candidate details, 5-signal breakdown,
    explanation reasons, and verification checklist for campus administrators.
    """
    match_id: str
    top_similarity_score: float = Field(..., description="Top candidate ranking score (0.0 to 1.0)")
    top_similarity_percentage: float = Field(..., description="Top similarity score formatted as percentage")
    verification_status: str = Field("potential_match", description="Current review status")
    is_reviewed: bool = False
    query_report: ReportVerificationSummary
    top_matched_report: ReportVerificationSummary
    signals: SignalScores
    reasons: List[str] = Field(default_factory=list)
    manual_verification_checklist: List[str] = Field(
        default_factory=lambda: [
            "Request student to describe distinctive identifying marks, scratches, or interior contents not visible in public descriptions",
            "Verify student ID or university card before item release",
            "Confirm approximate loss location or timeframe context with claimant",
            "Do not disclose private claimant contact details to finder before authorization"
        ]
    )
    disclaimer: str = (
        "Automated matching score is an algorithmic recommendation to guide human verification, "
        "never an automated declaration of legal ownership. Manual verification is always required."
    )
    evaluated_at: str


class ReportMatchesResponse(BaseModel):
    """Response returned when querying or generating ranked matches for a report."""
    query_report_id: str
    query_report_type: str
    total_candidates_found: int
    top_match: Optional[CandidateMatchItem] = Field(None, description="The #1 highest-ranked candidate match with top similarity score")
    matches: List[CandidateMatchItem]
    disclaimer: str = (
        "This is an automated recommendation and ranking signal, not legal proof of ownership. "
        "Final item release requires human administrator verification of unique identifying features."
    )


class MatchStatusUpdate(BaseModel):
    """Payload to review and update match candidate status."""
    status: Literal["potential_match", "reviewed", "rejected", "confirmed", "pending_higher_verification"] = Field(..., description="New review status")
    notes: Optional[str] = Field(None, description="Administrator or reviewer notes")


class ConfirmClaimRequest(BaseModel):
    """Request payload when a user confirms 'this is mine' to dispatch for higher user manual verification."""
    match_id: str = Field(..., description="Unique ID of the match record")
    claimant_id: Optional[str] = Field(None, description="User ID of the claimant")
    claimant_notes: Optional[str] = Field(None, description="Claimant notes / description of unique markings")


class DualReportVerificationDetail(BaseModel):
    """
    Detailed verification report containing BOTH the lost and found report details,
    individual 5-signal scores, and explanation reasons in JavaScript/JSON format
    for manual verification by a higher authority user.
    """
    match_id: str
    match_status: str
    is_reviewed: bool
    top_similarity_score: float = Field(..., description="Ranking score (0.0 to 1.0)")
    top_similarity_percentage: float = Field(..., description="Ranking score as percentage")
    lost_report: ReportVerificationSummary
    found_report: ReportVerificationSummary
    signals: SignalScores
    reasons: List[str]
    verification_checklist: List[str] = Field(
        default_factory=lambda: [
            "Verify claimant identity against university student or staff directory",
            "Cross-examine distinctive identifiers, lock screen, scratches, or interior contents",
            "Compare claimed loss timeframe with turn-in custody record",
            "Obtain physical custody release signature before final handoff"
        ]
    )
    action_required_by: str = "higher_user_admin"
    disclaimer: str = (
        "Algorithmic candidate match only. Not legal proof of ownership. "
        "Higher authority administrator must verify before releasing item."
    )
    evaluated_at: str


class ReportWithTopMatchesResponse(BaseModel):
    """Response returned upon report submission with immediate top 3 candidate matches."""
    report: ReportOut
    top_3_candidates: List[CandidateMatchItem] = Field(default_factory=list, description="Top 3 matching candidate reports")
    verification_ready: bool = True



class EngineConfig(BaseModel):
    """Configurable weights and tuning thresholds for the matching engine."""
    text_weight: float = Field(0.35, ge=0.0, le=1.0)
    image_weight: float = Field(0.30, ge=0.0, le=1.0)
    keyword_weight: float = Field(0.15, ge=0.0, le=1.0)
    location_weight: float = Field(0.12, ge=0.0, le=1.0)
    time_weight: float = Field(0.08, ge=0.0, le=1.0)
    min_score_threshold: float = Field(0.25, ge=0.0, le=1.0)
    top_k: int = Field(10, ge=1, le=50)

