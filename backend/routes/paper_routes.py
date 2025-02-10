from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from models.database import SessionLocal
from models.models import Paper
from pydantic import BaseModel
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PaperCreate(BaseModel):
    title: str
    content: str
    author_id: int
    is_public: int

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
def upload_paper(title: str = Form(...), file: UploadFile = File(...), author_id: int = Form(...), db: Session = Depends(get_db)):
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_paper = Paper(title=title, content=file_path, author_id=author_id, is_public=0)
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)

    return {"message": "Paper uploaded successfully", "paper_id": db_paper.id}