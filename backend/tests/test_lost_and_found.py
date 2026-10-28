import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.modules.academic.models import CampusLocation, MediaAttachment
from app.modules.auth.models import Role, User, user_roles
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
from app.modules.lost_and_found.seeder import seed_lost_and_found_csvs

# In-memory SQLite database with StaticPool for test isolation
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


def setup_database():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # 1. Seed Roles
    admin_role = Role(id=1, name="ADMIN", description="Campus Administrator")
    staff_role = Role(id=2, name="STAFF", description="Faculty & Custody Officer")
    student_role = Role(id=3, name="STUDENT", description="Campus Student")
    db.add_all([admin_role, staff_role, student_role])
    db.commit()

    # 2. Seed Users matching CSV IDs (1: Admin, 2: Staff, 4: Student, 7: Student, 14: Staff)
    admin_user = User(
        id=1, identifier="ADM001", email="admin@nexus.edu",
        password_hash="mockhash", full_name="Dr. Ramanathan K", is_active=True
    )
    admin_user.roles.append(admin_role)

    staff_user = User(
        id=2, identifier="FAC101", email="staff@nexus.edu",
        password_hash="mockhash", full_name="Prof. Anand Kumar", is_active=True
    )
    staff_user.roles.append(staff_role)

    student_user_4 = User(
        id=4, identifier="STU2025001", email="student4@nexus.edu",
        password_hash="mockhash", full_name="Aditya K", is_active=True
    )
    student_user_4.roles.append(student_role)

    student_user_7 = User(
        id=7, identifier="STU2025002", email="student7@nexus.edu",
        password_hash="mockhash", full_name="Sneha M", is_active=True
    )
    student_user_7.roles.append(student_role)

    staff_user_14 = User(
        id=14, identifier="FAC102", email="staff14@nexus.edu",
        password_hash="mockhash", full_name="Officer Suresh V", is_active=True
    )
    staff_user_14.roles.append(staff_role)

    db.add_all([admin_user, staff_user, student_user_4, student_user_7, staff_user_14])
    db.commit()

    # 3. Seed Campus Locations (Table 14)
    loc_5 = CampusLocation(id=5, name="Lecture Hall LH-101", location_type="ROOM")
    loc_8 = CampusLocation(id=8, name="Central Cafeteria", location_type="COMMON_AREA")
    loc_9 = CampusLocation(id=9, name="Security & Custody Desk", location_type="OFFICE")
    db.add_all([loc_5, loc_8, loc_9])
    db.commit()

    # 4. Seed Media Attachments (Table 15)
    med_8 = MediaAttachment(id=8, storage_key="lost_found/lost_airpods_pro.jpg", original_filename="airpods.jpg")
    med_9 = MediaAttachment(id=9, storage_key="lost_found/found_airpods_cafeteria.jpg", original_filename="found_airpods.jpg")
    med_10 = MediaAttachment(id=10, storage_key="lost_found/found_casio_calc.jpg", original_filename="casio.jpg")
    db.add_all([med_8, med_9, med_10])
    db.commit()

    # 5. Seed Lost and Found CSVs (Tables 34-41)
    seed_lost_and_found_csvs(db)

    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


client = TestClient(app)

# Helper headers
ADMIN_HEADERS = {"X-User-Id": "1", "X-User-Role": "ADMIN"}
STAFF_HEADERS = {"X-User-Id": "2", "X-User-Role": "STAFF"}
STUDENT_HEADERS = {"X-User-Id": "4", "X-User-Role": "STUDENT"}
OTHER_STUDENT_HEADERS = {"X-User-Id": "7", "X-User-Role": "STUDENT"}


def test_seeded_csv_data():
    """Verify that Tables 34 through 41 are properly populated from the CSV files."""
    db = TestingSessionLocal()
    try:
        # Table 34
        assert db.query(ItemCategory).count() >= 2
        cat1 = db.query(ItemCategory).filter_by(id=1).first()
        assert cat1 is not None
        assert "Electronics" in cat1.name

        # Table 35
        assert db.query(LostReport).count() >= 2
        lr1 = db.query(LostReport).filter_by(id=1).first()
        assert lr1.reporter_id == 4
        assert lr1.last_seen_location_id == 8

        # Table 36
        assert db.query(FoundReport).count() >= 2
        fr1 = db.query(FoundReport).filter_by(id=1).first()
        assert fr1.reported_by == 14
        assert fr1.inventory_tag == "LF-2025-001"

        # Table 37
        assert db.query(ReportMedia).count() >= 3

        # Table 38
        assert db.query(ItemMatch).count() >= 2
        m1 = db.query(ItemMatch).filter_by(id=1).first()
        assert m1.combined_score > 0.90

        # Table 39
        assert db.query(MatchVerification).count() >= 1

        # Table 40
        assert db.query(ItemClaim).count() >= 2

        # Table 41
        assert db.query(ItemHandover).count() >= 1
    finally:
        db.close()


def test_get_categories():
    """Test GET /api/v1/lost-found/categories"""
    res = client.get("/api/v1/lost-found/categories")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) >= 2
    names = [c["name"] for c in data["data"]]
    assert "Electronics & Audio" in names


def test_get_locations():
    """Test GET /api/v1/lost-found/locations"""
    res = client.get("/api/v1/lost-found/locations")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) >= 3
    loc_names = [l["name"] for l in data["data"]]
    assert "Central Cafeteria" in loc_names


def test_list_lost_reports():
    """Test GET /api/v1/lost-found/lost with filters"""
    res = client.get("/api/v1/lost-found/lost")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) >= 2

    # Filter by reporter
    res_filtered = client.get("/api/v1/lost-found/lost?reporter_id=4")
    assert res_filtered.status_code == 200
    filtered_data = res_filtered.json()["data"]
    assert len(filtered_data) == 1
    assert filtered_data[0]["title"] == "Lost Apple AirPods Pro (2nd Gen)"


def test_list_found_reports():
    """Test GET /api/v1/lost-found/found with filters"""
    res = client.get("/api/v1/lost-found/found")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) >= 2

    # Filter by custody status
    res_custody = client.get("/api/v1/lost-found/found?storage_status=IN_CUSTODY")
    assert res_custody.status_code == 200
    assert len(res_custody.json()["data"]) == 1
    assert res_custody.json()["data"][0]["inventory_tag"] == "LF-2025-002"


def test_list_matches():
    """Test GET /api/v1/lost-found/matches"""
    res = client.get("/api/v1/lost-found/matches")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) >= 2
    assert data["data"][0]["combined_score"] > 0.8


def test_create_lost_report():
    """Test POST /api/v1/lost-found/lost"""
    payload = {
        "title": "Lost Dell XPS 15 Laptop",
        "category_id": 1,
        "last_seen_location_id": 5,
        "brand_model": "Dell XPS 9520",
        "description": "Silver aluminum laptop with Intel i7 sticker, misplaced in LH-101.",
        "image_url": "/static/uploads/dell_xps.jpg"
    }
    res = client.post("/api/v1/lost-found/lost", json=payload, headers=STUDENT_HEADERS)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["title"] == "Lost Dell XPS 15 Laptop"
    assert data["data"]["reporter_id"] == 4
    assert len(data["data"]["media"]) >= 1


def test_create_found_report():
    """Test POST /api/v1/lost-found/found"""
    payload = {
        "title": "Found Dell XPS Laptop Silver",
        "category_id": 1,
        "found_location_id": 5,
        "description": "Silver 15-inch Dell laptop found near the front podium of LH-101.",
        "custody_desk": "Security Desk B-01",
        "image_url": "/static/uploads/found_dell.jpg"
    }
    res = client.post("/api/v1/lost-found/found", json=payload, headers=STAFF_HEADERS)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["title"] == "Found Dell XPS Laptop Silver"
    assert data["data"]["reported_by"] == 2
    assert data["data"]["inventory_tag"].startswith("LF-")


def test_trigger_matching():
    """Test POST /api/v1/lost-found/matches/trigger"""
    payload = {"top_k": 5}
    res = client.post("/api/v1/lost-found/matches/trigger", json=payload, headers=ADMIN_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) > 0


def test_verify_match():
    """Test POST /api/v1/lost-found/matches/{matchId}/verify"""
    payload = {
        "challenge_question": "What stickers or serial number are on the bottom chassis?",
        "owner_response": "A small blue Linux penguin sticker.",
        "officer_notes": "Sticker confirmed on item under physical custody.",
        "concordance_score": 96.0,
        "status": "APPROVED"
    }
    res = client.post("/api/v1/lost-found/matches/2/verify", json=payload, headers=ADMIN_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["concordance_score"] == 96.0
    assert data["data"]["status"] == "APPROVED"


def test_claim_conflict_resolution():
    """
    Test submitting two competing claims for the same found item:
    When Admin approves Claim A, Claim B is automatically REJECTED.
    """
    # 1. Student 4 submits Claim A
    claim_a = client.post("/api/v1/lost-found/claims", json={"found_report_id": 2}, headers=STUDENT_HEADERS)
    assert claim_a.status_code == 201
    claim_a_id = claim_a.json()["data"]["id"]

    # 2. Student 7 submits Claim B for the same found item
    claim_b = client.post("/api/v1/lost-found/claims", json={"found_report_id": 2}, headers=OTHER_STUDENT_HEADERS)
    assert claim_b.status_code == 201
    claim_b_id = claim_b.json()["data"]["id"]

    # 3. Admin reviews and approves Claim A
    review_res = client.patch(
        f"/api/v1/lost-found/claims/{claim_a_id}/review",
        json={"status": "APPROVED", "review_notes": "Verified against ownership proof."},
        headers=ADMIN_HEADERS
    )
    assert review_res.status_code == 200
    assert review_res.json()["data"]["status"] == "APPROVED"

    # 4. Verify that Claim B was automatically set to REJECTED
    claims_res = client.get("/api/v1/lost-found/claims", headers=ADMIN_HEADERS)
    claims = {c["id"]: c["status"] for c in claims_res.json()["data"]}
    assert claims[claim_a_id] == "APPROVED"
    assert claims[claim_b_id] == "REJECTED"


def test_handover_requires_approved_claim():
    """Business rule: Handover cannot be executed on a pending/unapproved claim."""
    db = TestingSessionLocal()
    # Create an unapproved claim
    pending_claim = ItemClaim(
        found_report_id=2, claimed_by=7, status="PENDING"
    )
    db.add(pending_claim)
    db.commit()
    p_id = pending_claim.id
    db.close()

    res = client.post(
        "/api/v1/lost-found/handovers",
        json={"claim_id": p_id},
        headers=ADMIN_HEADERS
    )
    assert res.status_code == 400
    assert "must be 'APPROVED' first" in res.json()["detail"]


def test_successful_handover():
    """Test executing a verified handover on an approved claim."""
    db = TestingSessionLocal()
    approved_claim = ItemClaim(
        found_report_id=2, claimed_by=4, status="APPROVED"
    )
    db.add(approved_claim)
    db.commit()
    app_id = approved_claim.id
    db.close()

    res = client.post(
        "/api/v1/lost-found/handovers",
        json={"claim_id": app_id, "handover_location_id": 9},
        headers=ADMIN_HEADERS
    )
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["claim_id"] == app_id
    assert data["data"]["pickup_pass_tag"].startswith("PASS-")


def test_rbac_security():
    """Ensure non-admin students cannot access privileged operations."""
    # Student cannot approve claims
    res1 = client.patch(
        "/api/v1/lost-found/claims/1/review",
        json={"status": "APPROVED"},
        headers=STUDENT_HEADERS
    )
    assert res1.status_code == 403

    # Student cannot execute handovers
    res2 = client.post(
        "/api/v1/lost-found/handovers",
        json={"claim_id": 1},
        headers=STUDENT_HEADERS
    )
    assert res2.status_code == 403

    # Student cannot update custody
    res3 = client.patch(
        "/api/v1/lost-found/found/1/custody",
        json={"storage_status": "RELEASED"},
        headers=STUDENT_HEADERS
    )
    assert res3.status_code == 403
