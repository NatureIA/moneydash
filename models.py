from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    role = Column(String(50), default="admin")
    created_at = Column(DateTime, default=datetime.utcnow)
    payables = relationship("Payable", back_populates="user")
    receipts = relationship("Receipt", back_populates="user")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String(50), nullable=False)
    external_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    masked_account_number = Column(String(30), nullable=True)
    last_sync = Column(DateTime, nullable=True)

class BankTransaction(Base):
    __tablename__ = "bank_transactions"
    id = Column(Integer, primary_key=True)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"))
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    external_id = Column(String(255), nullable=True)
    reconciled = Column(Boolean, default=False)

class Payable(Base):
    __tablename__ = "payables"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(20), default="pending")
    paid_date = Column(Date, nullable=True)
    bank_transaction_id = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    user = relationship("User", back_populates="payables")

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String(1024), nullable=False)
    status = Column(String(20), default="processing")
    extracted_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    matched_payable_id = Column(Integer, ForeignKey("payables.id"), nullable=True)
    user = relationship("User", back_populates="receipts")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
