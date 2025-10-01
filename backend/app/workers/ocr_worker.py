import json
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Receipt, Payable
from ..services.ocr import run_ocr

def process_receipt(receipt_id: int):
    db: Session = SessionLocal()
    try:
        r = db.query(Receipt).filter(Receipt.id == receipt_id).first()
        if not r: return
        path = r.image_url.replace("file://", "")
        data = run_ocr(path)
        r.extracted_json = json.dumps(data, ensure_ascii=False)
        r.status = "ready"
        db.add(r)
        total, dt = data.get("total"), data.get("date")
        if total and dt:
            p = Payable(user_id=r.user_id, title=f"Despesa - {data.get('vendor') or 'Recibo'}", amount=float(total), due_date=dt, status="pending", notes=f"CNPJ: {data.get('cnpj') or ''} | OCR")
            db.add(p)
        db.commit()
    except Exception:
        if r:
            r.status = "failed"; db.add(r); db.commit()
    finally:
        db.close()
