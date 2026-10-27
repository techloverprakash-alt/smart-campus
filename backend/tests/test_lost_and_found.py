import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.modules.core.models import Location, User
from app.modules.lost_and_found.models import (
    FoundReport,
    ItemCategory,
    ItemClaim,
    ItemHandover,
    ItemMatch,
    LostReport,
    MatchVerification,
    ReportMedia,
)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Test SQLite database in-memory with StaticPool to persist schema across threads
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    
    # Seed initial test category & location
    cat = ItemCategory(id="cat_elec", name="Electronics", description="Electronic gadgets")
    loc = Location(id="loc_lib", name="Central Library", zone="Central Digital Library Complex")
    user_student = User(id="user_stud", identifier="714022104045", full_name="Prakash S", role="STUDENT")
    user_officer = User(id="user_off", identifier="OFFICER_01", full_name="Officer Raman", role="OFFICER")
    
    db.add_all([cat, loc, user_student, user_officer])
    db.commit()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=test_engine)


client = TestClient(app)


def test_list_categories():
    response = client.get("/api/v1/lost-found/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1
    assert any(c["name"] == "Electronics" for c in data["data"])


def test_create_category_role_restricted():
    # As student -> 403 Forbidden
    resp = client.post(
        "/api/v1/lost-found/categories",
        json={"name": "Accessories", "description": "Personal accessories"},
        headers={"x-user-role": "STUDENT", "x-user-id": "stud_1"}
    )
    assert resp.status_code == 403

    # As officer/admin -> 201 Created
    resp_officer = client.post(
        "/api/v1/lost-found/categories",
        json={"name": "Accessories", "description": "Personal accessories"},
        headers={"x-user-role": "OFFICER", "x-user-id": "off_1"}
    )
    assert resp_officer.status_code == 201
    assert resp_officer.json()["data"]["name"] == "Accessories"


def test_submit_lost_report():
    payload = {
        "title": "Casio Scientific Calculator FX-991EX",
        "category_id": "cat_elec",
        "last_seen_location_name": "Central Library",
        "brand_model": "Casio FX-991EX",
        "description": "Black dual-power solar calculator with hard cover and small scuff on corner.",
        "image_url": "https://example.com/calculator.jpg"
    }
    response = client.post(
        "/api/v1/lost-found/lost",
        json=payload,
        headers={"x-user-role": "STUDENT", "x-user-id": "714022104045"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["title"] == payload["title"]
    assert data["data"]["status"] == "OPEN"
    assert len(data["data"]["media"]) >= 1
    return data["data"]["id"]


def test_submit_found_report():
    payload = {
        "title": "Black Scientific Calculator",
        "category_id": "cat_elec",
        "found_location_name": "Central Library",
        "description": "Turned in to security desk. Protective cover attached.",
        "custody_desk": "Desk 02 (Vault A-14)",
        "inventory_tag": "#SEC-990",
        "image_url": "https://example.com/intake_calc.jpg"
    }
    response = client.post(
        "/api/v1/lost-found/found",
        json=payload,
        headers={"x-user-role": "OFFICER", "x-user-id": "OFFICER_01"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["inventory_tag"] == "#SEC-990"
    assert data["data"]["storage_status"] == "INTAKE_PENDING"
    return data["data"]["id"]


def test_ai_matching_and_triage():
    # Trigger matching between lost & found
    resp = client.get("/api/v1/lost-found/matches")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    matches = data["data"]
    assert len(matches) >= 1
    match = matches[0]
    assert match["combined_score"] >= 50.0
    assert len(match["criteria_list"]) >= 1
    return match["id"]


def test_match_double_blind_verification():
    matches_resp = client.get("/api/v1/lost-found/matches")
    match_id = matches_resp.json()["data"][0]["id"]

    verification_payload = {
        "challenge_question": "Does the calculator cover have any markings or scratches?",
        "owner_response": "Yes, slight scuff on lower-right edge of slide cover.",
        "officer_notes": "Physical inspection of Vault item confirms scuff.",
        "concordance_score": 98.0
    }
    resp = client.post(
        f"/api/v1/lost-found/matches/{match_id}/verify",
        json=verification_payload,
        headers={"x-user-role": "OFFICER", "x-user-id": "OFFICER_01"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["concordance_score"] == 98.0
    assert data["data"]["status"] == "VERIFIED"


def test_claim_lifecycle_and_handover():
    # 1. Get found item
    founds = client.get("/api/v1/lost-found/found").json()["data"]
    found_id = founds[0]["id"]
    losts = client.get("/api/v1/lost-found/lost").json()["data"]
    lost_id = losts[0]["id"]

    # 2. Student submits claim
    claim_resp = client.post(
        "/api/v1/lost-found/claims",
        json={"found_report_id": found_id, "lost_report_id": lost_id},
        headers={"x-user-role": "STUDENT", "x-user-id": "714022104045"}
    )
    assert claim_resp.status_code == 201
    claim_id = claim_resp.json()["data"]["id"]
    assert claim_resp.json()["data"]["status"] == "PENDING"

    # 3. Officer reviews and approves claim
    review_resp = client.patch(
        f"/api/v1/lost-found/claims/{claim_id}/review",
        json={"status": "APPROVED", "review_notes": "Verified against student ID card."},
        headers={"x-user-role": "OFFICER", "x-user-id": "OFFICER_01"}
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["data"]["status"] == "APPROVED"

    # 4. Officer finalizes physical handover release
    handover_resp = client.post(
        "/api/v1/lost-found/handovers",
        json={"claim_id": claim_id},
        headers={"x-user-role": "OFFICER", "x-user-id": "OFFICER_01"}
    )
    assert handover_resp.status_code == 201
    handover_data = handover_resp.json()["data"]
    assert handover_data["claim_id"] == claim_id
    assert handover_data["pickup_pass_tag"] is not None
    assert handover_data["pickup_pass_tag"].startswith("#DISC-")

    # 5. Check found report status updated to RELEASED
    updated_found = client.get(f"/api/v1/lost-found/found/{found_id}").json()["data"]
    assert updated_found["storage_status"] == "RELEASED"

    # 6. Check lost report status updated to CLOSED
    updated_lost = client.get(f"/api/v1/lost-found/lost/{lost_id}").json()["data"]
    assert updated_lost["status"] == "CLOSED"


def test_ownership_authorization_restriction():
    # User 2 tries to delete report belonging to User 1
    losts = client.get("/api/v1/lost-found/lost").json()["data"]
    lost_id = losts[0]["id"]

    resp = client.delete(
        f"/api/v1/lost-found/lost/{lost_id}",
        headers={"x-user-role": "STUDENT", "x-user-id": "different_student_999"}
    )
    assert resp.status_code == 403
    assert "Forbidden" in resp.json()["detail"]
