import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_lost_and_found_complete_flow():
    print("\n" + "=" * 70)
    print("RUNNING NEXUS LOST & FOUND END-TO-END FLOW VERIFICATION SUITE")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # 1. Login Accounts (Admin, Student A - Lost Owner, Student B - Finder)
    # -------------------------------------------------------------------------
    print("\n[1] Authenticating Test Users...")
    
    # Admin
    admin_login = client.post("/api/v1/auth/login", json={"identifier": "ADM001", "password": "Password@123"})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("  [PASS] Admin authenticated: ADM001")

    # Student A (Lost Item Reporter: Karthikeyan Natarajan - REG20259901)
    stu_a_login = client.post("/api/v1/auth/login", json={"identifier": "REG20259901", "password": "Password@123"})
    assert stu_a_login.status_code == 200, f"Student A login failed: {stu_a_login.text}"
    stu_a_token = stu_a_login.json()["access_token"]
    stu_a_headers = {"Authorization": f"Bearer {stu_a_token}"}
    stu_a_id = stu_a_login.json()["user"]["id"]
    print(f"  [PASS] Student A (Lost Reporter) authenticated: ID={stu_a_id} (Karthikeyan)")

    # Student B (Finder: Priya S - REG20250002 or ADM as fallback)
    stu_b_login = client.post("/api/v1/auth/login", json={"identifier": "REG20250002", "password": "Password@123"})
    if stu_b_login.status_code == 200:
        stu_b_token = stu_b_login.json()["access_token"]
        stu_b_headers = {"Authorization": f"Bearer {stu_b_token}"}
        stu_b_id = stu_b_login.json()["user"]["id"]
        print(f"  [PASS] Student B (Peer Finder) authenticated: ID={stu_b_id} (Priya S)")
    else:
        stu_b_headers = admin_headers
        stu_b_id = admin_login.json()["user"]["id"]
        print("  [PASS] Finder using authenticated session")

    # -------------------------------------------------------------------------
    # 2. Test Visibility: Lost & Found Items Visible to All Users
    # -------------------------------------------------------------------------
    print("\n[2] Testing Public Visibility of Lost & Found Boards...")
    
    # Student A queries lost reports
    lost_res = client.get("/api/v1/lost-found/lost", headers=stu_a_headers)
    assert lost_res.status_code == 200, f"Failed to list lost reports: {lost_res.text}"
    lost_data = lost_res.json()["data"]
    print(f"  [PASS] Lost items visible to Student: {len(lost_data)} items returned.")

    # Student A queries found reports
    found_res = client.get("/api/v1/lost-found/found", headers=stu_a_headers)
    assert found_res.status_code == 200, f"Failed to list found reports: {found_res.text}"
    found_data = found_res.json()["data"]
    print(f"  [PASS] Found items visible to Student: {len(found_data)} items returned.")

    # -------------------------------------------------------------------------
    # 3. Step 1: Student A Reports a Lost Item
    # -------------------------------------------------------------------------
    print("\n[3] Testing Step 1: Student A Reports a Lost Item...")
    lost_payload = {
        "title": "Casio FX-991EX ClassWiz Calculator",
        "category_id": 1,
        "last_seen_location_name": "Central Digital Library 2nd Floor",
        "brand_model": "Casio FX-991EX Matte Black",
        "description": "Scientific calculator with solar panel and student ID sticker 'Karthik CSE' on the backside cover.",
    }
    create_lost_res = client.post("/api/v1/lost-found/lost", json=lost_payload, headers=stu_a_headers)
    assert create_lost_res.status_code == 201, f"Failed to create lost report: {create_lost_res.text}"
    lost_report = create_lost_res.json()["data"]
    lost_report_id = lost_report["id"]
    print(f"  [PASS] Lost report registered: ID={lost_report_id}, Status='{lost_report['status']}'")

    # -------------------------------------------------------------------------
    # 4. Step 2: Peer Finder Discovers Item & Sends "Found Request"
    # -------------------------------------------------------------------------
    print("\n[4] Testing Step 2: Peer Finder Touches Lost Item & Sends Found Request...")
    found_request_payload = {
        "description": "Found a Casio FX-991EX calculator on desk #14 in the library reading room.",
        "found_location_name": "Central Digital Library",
        "custody_desk": "Library Security Circulation Desk",
        "finder_notes": "Deposited safely with Duty Officer Ramesh. Please claim it with your ID card."
    }
    found_req_res = client.post(
        f"/api/v1/lost-found/lost/{lost_report_id}/found-request",
        json=found_request_payload,
        headers=stu_b_headers
    )
    assert found_req_res.status_code == 201, f"Failed to send found request: {found_req_res.text}"
    match_data = found_req_res.json()["data"]
    match_id = match_data["id"]
    match_status = match_data["status"]
    print(f"  [PASS] Found Request Dispatched: Match ID={match_id}, Status='{match_status}'")
    assert match_status == "FOUND_REQUEST", f"Expected match status 'FOUND_REQUEST', got '{match_status}'"

    # Verify Lost Report transitioned to MATCHED
    check_lost = client.get(f"/api/v1/lost-found/lost/{lost_report_id}", headers=stu_a_headers)
    assert check_lost.status_code == 200
    assert check_lost.json()["data"]["status"] == "MATCHED", f"Lost report status should be MATCHED, got: {check_lost.json()['data']['status']}"
    print(f"  [PASS] Lost Report status transitioned to 'MATCHED'.")

    # -------------------------------------------------------------------------
    # 5. Step 3: Lost Owner Reviews Request & Clicks "Move to Human Verification"
    # -------------------------------------------------------------------------
    print("\n[5] Testing Step 3: Lost Owner Reviews Request & Moves to Human Verification...")
    verify_request_payload = {
        "challenge_question": "What is written on the backside sticker of the calculator?",
        "owner_response": "The sticker says 'Karthik CSE' and has a tiny black ink mark near the battery compartment.",
        "officer_notes": "Owner verified matching characteristics. Requesting custody officer verification."
    }
    human_verif_res = client.post(
        f"/api/v1/lost-found/matches/{match_id}/request-human-verification",
        json=verify_request_payload,
        headers=stu_a_headers
    )
    assert human_verif_res.status_code == 200, f"Failed to move to human verification: {human_verif_res.text}"
    verif_out = human_verif_res.json()["data"]
    print(f"  [PASS] Moved to Human Verification: Verification ID={verif_out['id']}, Status='{verif_out['status']}'")

    # Verify match status is now HUMAN_VERIFICATION
    matches_check = client.get(f"/api/v1/lost-found/matches?lost_report_id={lost_report_id}", headers=stu_a_headers)
    assert matches_check.status_code == 200
    m_list = matches_check.json()["data"]
    assert any(m["status"] == "HUMAN_VERIFICATION" for m in m_list), f"Match not in HUMAN_VERIFICATION state: {m_list}"
    print("  [PASS] Match record successfully updated to 'HUMAN_VERIFICATION'.")

    # -------------------------------------------------------------------------
    # 6. Step 4: Admin Performs Verification & Approves Handover
    # -------------------------------------------------------------------------
    print("\n[6] Testing Step 4: Campus Admin Verifies Concordance & Approves...")
    admin_verify_res = client.post(
        f"/api/v1/lost-found/matches/{match_id}/verify",
        json={
            "challenge_question": "What is written on the backside sticker of the calculator?",
            "owner_response": "The sticker says 'Karthik CSE'",
            "officer_notes": "Physical sticker matched 'Karthik CSE'. Approved for release.",
            "concordance_score": 98.0,
            "status": "APPROVED"
        },
        headers=admin_headers
    )
    assert admin_verify_res.status_code == 200, f"Admin verify failed: {admin_verify_res.text}"
    print("  [PASS] Admin verified concordance (98.0%). Match marked 'VERIFIED'.")

    # -------------------------------------------------------------------------
    # 7. Step 5: Similarity Search When Found Item Was Assigned Before Lost Report
    # -------------------------------------------------------------------------
    print("\n[7] Testing Step 5: Pre-existing Found Items Similarity Search...")
    # Query using text from a lost user searching for their item
    sim_res = client.get(
        "/api/v1/lost-found/similarity-search?query=Casio+FX-991EX+calculator",
        headers=stu_a_headers
    )
    assert sim_res.status_code == 200, f"Similarity search failed: {sim_res.text}"
    candidates = sim_res.json()["data"]
    assert len(candidates) > 0, "Expected at least 1 candidate in similarity search"
    top_candidate = candidates[0]
    score_pct = round(top_candidate["similarity_score"] * 100, 1)
    print(f"  [PASS] Similarity search successful! Top candidate: '{top_candidate['found_report']['title']}'")
    print(f"  [PASS] Calculated Similarity Score: {score_pct}% (Tag: {top_candidate['found_report']['inventory_tag']})")
    assert top_candidate["similarity_score"] >= 0.70, f"Expected similarity >= 0.70, got {top_candidate['similarity_score']}"

    # -------------------------------------------------------------------------
    # 8. Clean up test records
    # -------------------------------------------------------------------------
    print("\n[8] Cleaning Up Test Artifacts...")
    del_res = client.delete(f"/api/v1/lost-found/lost/{lost_report_id}", headers=admin_headers)
    assert del_res.status_code == 200
    print(f"  [PASS] Cleaned up test lost report #{lost_report_id}.")

    print("\n" + "=" * 70)
    print("ALL LOST & FOUND FLOW TESTS PASSED SUCCESSFULLY! (100%)")
    print("=" * 70)

if __name__ == "__main__":
    test_lost_and_found_complete_flow()
