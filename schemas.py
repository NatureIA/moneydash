from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any, List
from datetime import date, datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "Bearer"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class PayableBase(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[date] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class PayableCreate(PayableBase):
    title: str
    amount: float
    due_date: date
    receipt_id: Optional[int] = None

class PayableUpdate(PayableBase):
    status: Optional[str] = Field(default=None, description="pending|paid|canceled")
    paid_date: Optional[date] = None
    bank_transaction_id: Optional[str] = None

class PayableOut(PayableBase):
    id: int
    user_id: int
    status: str
    paid_date: Optional[date] = None
    bank_transaction_id: Optional[str] = None
    class Config:
        from_attributes = True

class ReceiptOut(BaseModel):
    id: int
    user_id: int
    image_url: str
    status: str
    extracted_json: Optional[Any] = None
    created_at: datetime
    class Config:
        from_attributes = True

class BankAccountOut(BaseModel):
    id: str
    provider: str
    name: str
    masked_account_number: str | None = None

class BalanceOut(BaseModel):
    account_id: str
    currency: str
    available: float
    ledger: float
    as_of: datetime

class BankTxOut(BaseModel):
    id: str
    date: date
    amount: float
    description: str | None = None
