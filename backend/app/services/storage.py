import os
from uuid import uuid4
from fastapi import UploadFile
from ..config import settings
os.makedirs(settings.RECEIPTS_DIR, exist_ok=True)

def save_receipt_file(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    fname = f"{uuid4().hex}{ext}"
    path = os.path.join(settings.RECEIPTS_DIR, fname)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return path

def public_url(path: str) -> str:
    return f"file://{path}"
