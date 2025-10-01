from datetime import timedelta
from sqlalchemy.orm import Session
from .models import Payable
from dateutil.parser import parse as dtparse

def auto_reconcile(db: Session, payable: Payable, candidate_txs: list[dict], date_tolerance_days: int = 3, amount_tolerance: float = 0.5):
    for tx in candidate_txs:
        try:
            tx_date = dtparse(tx["date"]).date()
        except Exception:
            continue
        if payable.due_date - timedelta(days=date_tolerance_days) <= tx_date <= payable.due_date + timedelta(days=date_tolerance_days):
            if abs(float(tx["amount"]) + payable.amount) <= amount_tolerance:
                payable.status = "paid"
                payable.bank_transaction_id = tx["id"]
                db.add(payable); db.commit()
                return True
    return False
