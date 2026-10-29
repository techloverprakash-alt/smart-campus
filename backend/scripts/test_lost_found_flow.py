import sys
sys.path.insert(0, 'backend')
import os
import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.modules.auth.models import User, Role
from app.modules.notifications.models import Notification
from app.modules.lost_and_found.models import (
    LostReport,
    FoundReport,
    ItemCategory,
    ItemMatch,
    MatchVerification,
    ItemClaim,
    ItemEmbedding
)
from app.modules.lost_and_found.schemas import (
    LostReportCreate,
    FoundReportCreate,
    MoveToVerificationRequest,
    VerificationReview
)
from app.modules.lost_and_found.service import LostAndFoundService

def run_test():
    db: Session = SessionLocal()
    service = LostAndFoundService(db)

    print("=========================================================")
    print("NEXUS LOST & FOUND END-TO-END FLOW VERIFICATION")
    print("=========================================================")

    # 1. Check Admin User
    admins = (
        db.query(User)
        .join(User.roles)
        .filter(Role.name.ilike("%ADMIN%"), User.is_active == True)
        .all()
    )
    print(f"[OK] Found {len(admins)} Admin user(s):", [(a.id, a.email, a.full_name) for a in admins])
    admin_user = admins[0]

    # Student user
    student = db.query(User).filter(User.id != admin_user.id).first()
    finder = db.query(User).filter(User.id != admin_user.id, User.id != student.id).first()
    print(f"[OK] Reporter Student: #{student.id} ({student.full_name})")
    print(f"[OK] Finder User: #{finder.id} ({finder.full_name})")

    # 2. Submit Lost Report
    lost_data = LostReportCreate(
        title="Midnight Blue Bose Noise Cancelling Headphones 700",
        brand_model="Bose 700",
        description="Over-ear Bluetooth headphones with silver headband and a small scratch on left ear cup. Lost near library.",
        last_seen_location_name="Central Library 2nd Floor",
        category_id=1
    )
    lost_report = service.submit_lost_report(lost_data, reporter_id=student.id)
    print(f"\n[OK] Step 1: Created Lost Report #{lost_report.id} ('{lost_report.title}')")

    # Check Dual-Persistence
    lost_emb = db.query(ItemEmbedding).filter(ItemEmbedding.lost_report_id == lost_report.id).first()
    print(f"     -> Lost item_embeddings table record exists: {lost_emb is not None}")
    if lost_emb:
        print(f"     -> Vector dim: {lost_emb.vector_dim}, Qdrant point: {lost_emb.qdrant_point_id}")
    print(f"     -> LostReport.embedding_json populated: {lost_report.embedding_json is not None and len(lost_report.embedding_json) > 50}")

    # 3. Submit Found Report matching the item
    found_data = FoundReportCreate(
        title="Found Bose Bluetooth Headphones",
        description="Dark blue Bose headphones found on table in Library study cubicle. Silver accent band.",
        found_location_name="Central Library 2nd Floor",
        custody_desk="Central Library Security Desk",
        category_id=1
    )
    found_report = service.submit_found_report(found_data, reported_by=finder.id)
    print(f"\n[OK] Step 2: Created Found Report #{found_report.id} ('{found_report.title}')")

    # Check Dual-Persistence
    found_emb = db.query(ItemEmbedding).filter(ItemEmbedding.found_report_id == found_report.id).first()
    print(f"     -> Found item_embeddings table record exists: {found_emb is not None}")
    print(f"     -> FoundReport.embedding_json populated: {found_report.embedding_json is not None and len(found_report.embedding_json) > 50}")

    # 4. Check AI Candidate Match
    match = db.query(ItemMatch).filter(
        ItemMatch.lost_report_id == lost_report.id,
        ItemMatch.found_report_id == found_report.id
    ).first()
    print(f"\n[OK] Step 3: AI Candidate Match Result:")
    if match:
        print(f"     -> Match #{match.id}: score={match.combined_score}, status={match.status}")
    else:
        print("     -> Match not automatically created; running explicit evaluation...")
        matches = service.evaluate_matches_for_lost(lost_report.id)
        match = db.query(ItemMatch).filter(
            ItemMatch.lost_report_id == lost_report.id,
            ItemMatch.found_report_id == found_report.id
        ).first()
        print(f"     -> Match evaluated: #{match.id if match else 'None'}, score={match.combined_score if match else 0}")

    assert match is not None, "Match was not generated!"

    # 5. Move to Human Verification
    print(f"\n[OK] Step 4: Owner moves match #{match.id} to Human Verification Queue...")
    initial_admin_notifs = db.query(Notification).filter(Notification.user_id == admin_user.id).count()

    move_req = MoveToVerificationRequest(
        challenge_question="Confirm unique identifying marks, contents, or serial number.",
        owner_response="There is a small scratch on the left ear cup hinge and a tiny sticker residue under the headband.",
        officer_notes="Owner initiated verification review."
    )
    verification = service.request_human_verification(
        match_id=match.id,
        data=move_req,
        user_id=student.id,
        is_admin=False
    )
    print(f"     -> MatchVerification #{verification.id} created with status: '{verification.status}'")
    db.refresh(match)
    print(f"     -> Match #{match.id} status transitioned to: '{match.status}'")
    db.refresh(lost_report)
    print(f"     -> LostReport #{lost_report.id} status transitioned to: '{lost_report.status}'")

    # Check Admin Notification Push
    latest_admin_notifs = db.query(Notification).filter(
        Notification.user_id == admin_user.id,
        Notification.notification_type == "LOST_AND_FOUND_ADMIN"
    ).order_by(Notification.id.desc()).first()
    print(f"     -> Admin notification pushed: '{latest_admin_notifs.title if latest_admin_notifs else 'NONE'}'")
    print(f"     -> Notification message: '{latest_admin_notifs.message if latest_admin_notifs else 'NONE'}'")
    assert latest_admin_notifs is not None, "Admin notification was NOT dispatched!"

    # 6. Admin Reviews Human Verification Queue
    print(f"\n[OK] Step 5: Admin inspects verification queue and authorizes handover...")
    verif_list = service.repo.list_verifications(status="PENDING")
    print(f"     -> Found {len(verif_list)} pending verification(s) in Admin Queue.")
    target_v = [v for v in verif_list if v.id == verification.id][0]
    print(f"     -> Challenge: '{target_v.challenge_question}'")
    print(f"     -> Owner Secret Proof: '{target_v.owner_response}'")

    # Admin approves
    reviewed_v = service.review_verification(
        verification_id=target_v.id,
        status="APPROVED",
        officer_notes="Physical inspection of headphones confirmed scratch on left ear cup hinge. Handover authorized.",
        concordance_score=98.0,
        verified_by=admin_user.id
    )
    print(f"     -> Verification #{reviewed_v.id} review status: '{reviewed_v.status}'")
    db.refresh(match)
    print(f"     -> Match #{match.id} status: '{match.status}'")
    db.refresh(lost_report)
    print(f"     -> LostReport #{lost_report.id} status: '{lost_report.status}'")

    # Check Student & Finder notifications
    student_notif = db.query(Notification).filter(
        Notification.user_id == student.id,
        Notification.notification_type == "LOST_AND_FOUND"
    ).order_by(Notification.id.desc()).first()
    print(f"     -> Owner pickup notification dispatched: '{student_notif.title if student_notif else 'NONE'}'")

    finder_notif = db.query(Notification).filter(
        Notification.user_id == finder.id,
        Notification.notification_type == "LOST_AND_FOUND"
    ).order_by(Notification.id.desc()).first()
    print(f"     -> Finder thank you notification dispatched: '{finder_notif.title if finder_notif else 'NONE'}'")

    # Check auto-approved claim
    claim = db.query(ItemClaim).filter(
        ItemClaim.found_report_id == found_report.id,
        ItemClaim.lost_report_id == lost_report.id
    ).first()
    print(f"     -> Auto-approved Claim record exists: #{claim.id if claim else 'NONE'} with status: '{claim.status if claim else 'NONE'}'")

    db.refresh(found_report)
    print(f"     -> FoundReport #{found_report.id} storage_status: '{found_report.storage_status}' (atomic verification)")
    assert lost_report.status == "VERIFIED", "LostReport must be VERIFIED after HOD approval"
    assert found_report.storage_status == "VERIFIED", "FoundReport must be VERIFIED after HOD approval"

    # 7. Physical Custody Handover Execution (Separate step from verification)
    print(f"\n[OK] Step 6: Physical Handover & Digital Pickup Pass issuance...")
    from app.modules.lost_and_found.schemas import HandoverCreate
    handover = service.execute_handover(
        data=HandoverCreate(claim_id=claim.id, received_by=student.id, handover_notes="Physical handover completed with student ID check"),
        handed_over_by=admin_user.id
    )
    db.refresh(found_report)
    db.refresh(lost_report)
    print(f"     -> Handover #{handover.id} generated with Pass Tag: '{handover.pickup_pass_tag}'")
    print(f"     -> FoundReport #{found_report.id} final storage_status: '{found_report.storage_status}'")
    print(f"     -> LostReport #{lost_report.id} final status: '{lost_report.status}'")
    assert found_report.storage_status == "HANDED_OVER", "Found report must be HANDED_OVER after collection"
    assert lost_report.status == "RESOLVED", "Lost report must be RESOLVED after collection"

    # 8. Privacy Rule Verification: Finder cannot see raw scores or private owner contact
    print(f"\n[OK] Step 7: Privacy Rule Check (Finder perspective)...")
    from app.modules.lost_and_found.router import format_match
    finder_view = format_match(match, current_user=finder)
    print(f"     -> Finder view combined_score: {finder_view.combined_score} (Masked)")
    print(f"     -> Finder view owner name: {finder_view.lost_report.reporter_name if finder_view.lost_report else 'N/A'}")
    assert finder_view.combined_score == 0.0, "Raw similarity score must be masked from finder"

    # Owner perspective:
    owner_view = format_match(match, current_user=student)
    print(f"     -> Owner view combined_score: {owner_view.combined_score} (Visible to Owner)")
    assert owner_view.combined_score > 0.0, "Similarity score should be accessible to owner"

    db.close()
    print("\n=========================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! FULL FLOW VERIFIED!")
    print("=========================================================")

if __name__ == '__main__':
    run_test()

