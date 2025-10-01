import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from redis import Redis
from rq import Queue
from ..deps import CurrentUser
from ..auth import get_db
from ..models import Receipt
from ..services.storage import save_receipt_file, public_url
from ..config import settings

router = APIRouter(prefix="/receipts", tags=["receipts"])
redis_conn = Redis.from_url(settings.REDIS_URL)
queue = Queue(settings.RQ_OCR_QUEUE, connection=redis_conn)

@router.post("/upload", status_code=201)
def upload_receipt(file: UploadFile = File(...), payable_id: int | None = Form(None), user=Depends(CurrentUser), db: Session = Depends(get_db)):
    path = save_receipt_file(file)
    url = public_url(path)
    r = Receipt(user_id=user.id, image_url=url, status="processing")
    db.add(r); db.commit(); db.refresh(r)
    queue.enqueue("app.workers.ocr_worker.process_receipt", r.id)
    return {"receipt_id": r.id, "status": r.status}

@router.get("/{rid}")
def get_receipt(rid: int, user=Depends(CurrentUser), db: Session = Depends(get_db)):
    r = db.query(Receipt).filter(Receipt.id == rid, Receipt.user_id == user.id).first()
    if not r: raise HTTPException(status_code=404, detail="Receipt não encontrado")
    data = None
    if r.extracted_json:
        try: data = json.loads(r.extracted_json)
        except: data = r.extracted_json
    return { "id": r.id, "user_id": r.user_id, "image_url": r.image_url, "status": r.status, "extracted": data, "created_at": r.created_at.isoformat() }
