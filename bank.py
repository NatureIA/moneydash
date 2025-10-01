from fastapi import APIRouter, Depends
from datetime import date
from typing import List
from ..deps import CurrentUser
from ..schemas import BankAccountOut, BalanceOut, BankTxOut
from ..services.bank_provider import provider

router = APIRouter(prefix="/bank-accounts", tags=["bank"])

@router.get("", response_model=List[BankAccountOut])
def list_accounts(user=Depends(CurrentUser)):
    return provider.list_accounts(user.id)

@router.get("/{account_id}/balance", response_model=BalanceOut)
def get_balance(account_id: str, user=Depends(CurrentUser)):
    return provider.get_balance(account_id)

@router.get("/{account_id}/transactions", response_model=List[BankTxOut])
def get_transactions(account_id: str, from_: date | None = None, to: date | None = None, user=Depends(CurrentUser)):
    return provider.get_transactions(account_id, from_, to)
