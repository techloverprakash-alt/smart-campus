"""
Test Google Drive link upload and respective tables verification
"""
import sys
import os

backend_path = os.path.abspath("backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.database import SessionLocal
from app.modules.materials.service import MaterialService
from app.modules.materials.schemas import StudyMaterialCreate
from app.modules.auth.models import User
from app.modules.academic.models import MediaAttachment
from app.modules.materials.models import StudyMaterial

def main():
    print("=" * 60)
    print("TESTING GOOGLE DRIVE LINK STUDY MATERIAL UPLOAD")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        sharma = db.query(User).filter_by(email="r.sharma@institution.edu").first()
        assert sharma, "Staff user not found"
        
        aravind = db.query(User).filter_by(email="aravind.k@student.edu").first()
        assert aravind, "Student user not found"
        
        service = MaterialService(db)
        
        # 1. Staff uploads study material via Google Drive link
        drive_link = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing"
        payload = StudyMaterialCreate(
            title="CS8701 Unit 2 - Consensus & Raft Protocol Slides",
            subject_code="CS8701",
            unit_number=2,
            drive_url=drive_link,
            academic_year="2025-2026"
        )
        
        created = service.create_material(current_user=sharma, data=payload)
        print("\n1. Created Study Material with Google Drive Link:")
        print(f"  - ID: {created['id']}")
        print(f"  - Title: {created['title']}")
        print(f"  - Code: {created['code']}")
        print(f"  - Unit: {created['unit']}")
        print(f"  - Drive URL: {created['drive_url']}")
        print(f"  - Is Drive Link: {created['is_drive_link']}")
        print(f"  - Type: {created['type']}")
        
        assert created['drive_url'] == drive_link
        assert created['is_drive_link'] is True
        assert created['type'] == "G-DRIVE"
        print("  >>> [PASS] Upload returned proper Google Drive metadata!")
        
        # 2. Verify Table 15 (media_attachments)
        print("\n2. Verifying Table 15 (media_attachments):")
        media = db.query(MediaAttachment).filter_by(id=created['file_id']).first()
        assert media is not None, "MediaAttachment not found in DB"
        print(f"  - Storage Key (Drive Link): {media.storage_key}")
        print(f"  - Mime Type: {media.mime_type}")
        print(f"  - Original Filename: {media.original_filename}")
        assert media.storage_key == drive_link
        print("  >>> [PASS] Table 15 stores the Google Drive link!")
        
        # 3. Verify Table 21 (study_materials)
        print("\n3. Verifying Table 21 (study_materials):")
        mat = db.query(StudyMaterial).filter_by(id=created['id']).first()
        assert mat is not None, "StudyMaterial not found in DB"
        print(f"  - Material ID: {mat.id}")
        print(f"  - Title: {mat.title}")
        print(f"  - Unit Number: {mat.unit_number}")
        print(f"  - Course Offering ID: {mat.course_offering_id}")
        print(f"  - File ID (FK to media_attachments): {mat.file_id}")
        assert mat.file_id == media.id
        print("  >>> [PASS] Table 21 connects to Course Offering and MediaAttachment!")
        
        # 4. Verify fetching data for student from respective tables
        print("\n4. Verifying Student view fetching from respective tables:")
        student_materials = service.list_materials(current_user=aravind)
        print(f"  - Student materials count: {len(student_materials)}")
        found = False
        for m in student_materials:
            if m['id'] == created['id']:
                found = True
                print(f"  - Found created material in student query:")
                print(f"    * Code: {m['code']}")
                print(f"    * Title: {m['title']}")
                print(f"    * Drive URL: {m['drive_url']}")
                print(f"    * Type: {m['type']}")
                assert m['drive_url'] == drive_link
                assert m['is_drive_link'] is True
        assert found, "Created material not found in student query"
        print("  >>> [PASS] Student query retrieves the Google Drive material from respective tables!")
        
        print("\n" + "=" * 60)
        print("ALL GOOGLE DRIVE STUDY MATERIAL TESTS PASSED (100%)")
        print("=" * 60)
        
    finally:
        db.close()

if __name__ == "__main__":
    main()

