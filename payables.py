from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from ..deps import CurrentUser
from ..auth import get_db
from ..models import Payable
from ..schemas import PayableCreate, PayableUpdate, PayableOut
from ..services.bank_provider import provider
from ..services.reconciliation import auto_reconcile

router = APIRouter(prefix="/payables", tags=["payables"])

@router.get("", response_model=List[PayableOut])
def list_payables(status: Optional[str] = None, user=Depends(CurrentUser), db: Session = Depends(get_db)):
    q = db.query(Payable).filter(Payable.user_id == user.id)
    if status: q = q.filter(Payable.status == status)
    return q.order_by(Payable.due_date.desc()).all()

@router.post("", response_model=PayableOut, status_code=201)
def create_payable(payload: PayableCreate, user=Depends(CurrentUser), db: Session = Depends(get_db)):
    p = Payable(user_id=user.id, title=payload.title, amount=payload.amount, due_date=payload.due_date, category=payload.category, notes=payload.notes, status="pending")
    db.add(p); db.commit(); db.refresh(p); return p

@router.patch("/{pid}", response_model=PayableOut)
def update_payable(pid: int, payload: PayableUpdate, user=Depends(CurrentUser), db: Session = Depends(get_db)):
    p = db.query(Payable).filter(Payable.id == pid, Payable.user_id == user.id).first()
    if not p: raise HTTPException(status_code=404, detail="Payable não encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.add(p); db.commit(); db.refresh(p); return p

@router.post("/{pid}/autoreconcile", response_model=PayableOut)
def reconcile_with_bank(pid: int, account_id: str, user=Depends(CurrentUser), db: Session = Depends(get_db)):
    p = db.query(Payable).filter(Payable.id == pid, Payable.user_id == user.id).first()
    if not p: raise HTTPException(status_code=404, detail="Payable não encontrado")
    txs = provider.get_transactions(account_id, None, None)
    auto_reconcile(db, p, txs); db.refresh(p); return p
