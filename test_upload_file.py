"""
Test study material physical file upload and database persistence.
"""
import sys
import os
import io

backend_path = os.path.abspath("backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from fastapi import UploadFile
from app.database import SessionLocal
from app.modules.materials.service import MaterialService
from app.modules.auth.models import User
from app.modules.academic.models import MediaAttachment
from app.modules.materials.models import StudyMaterial

def main():
    db = SessionLocal()
    try:
        sharma = db.query(User).filter_by(email="r.sharma@institution.edu").first()
        assert sharma, "Staff user not found"
        
        service = MaterialService(db)
        
        # Create a mock PDF upload
        fake_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Title (CS3351 Machine Learning Lecture Notes) >>\nendobj\ntrailer\n<< >>\n%%EOF"
        upload = UploadFile(
            filename="CS3351_Unit1_Supervised_Learning.pdf",
            file=io.BytesIO(fake_pdf_content),
            headers={"content-type": "application/pdf"}
        )
        
        result = service.upload_material_file(
            current_user=sharma,
            file=upload,
            title="CS3351 - Unit 1 Supervised Learning Notes",
            subject_code="CS3351",
            unit_number=1,
            academic_year="2024-2025"
        )
        
        print("\n--- Upload Successful! ---")
        print(f"Material ID: {result['id']}")
        print(f"Title: {result['title']}")
        print(f"Code: {result['code']}")
        print(f"File Name: {result['file_name']}")
        print(f"Storage Key: {result['storage_key']}")
        print(f"File Size: {result['file_size']} bytes")
        print(f"Instructor: {result['instructor']}")
        print(f"Type: {result['type']}")
        
        # Verify in DB
        db_mat = db.query(StudyMaterial).filter_by(id=result['id']).first()
        assert db_mat is not None, "StudyMaterial record not found in DB"
        
        db_file = db.query(MediaAttachment).filter_by(id=db_mat.file_id).first()
        assert db_file is not None, "MediaAttachment record not found in DB"
        print(f"Verified MediaAttachment in DB: id={db_file.id}, filename={db_file.original_filename}")
        
        # Verify file exists on disk
        from app.infrastructure.storage import BASE_DIR
        disk_path = BASE_DIR / db_file.storage_key.lstrip("/")
        assert disk_path.exists(), f"Physical file does not exist at {disk_path}"
        print(f"Verified Physical File exists on disk: {disk_path} ({disk_path.stat().st_size} bytes)")
        
        print("\n>>> [PASS] All physical document upload checks passed!")

    finally:
        db.close()

if __name__ == "__main__":
    main()
