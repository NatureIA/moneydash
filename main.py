from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from .config import settings
from .database import init_db, SessionLocal
from .auth import create_token, get_db
from .models import User
from .schemas import LoginIn, TokenOut
from .routers import bank, payables, receipts

app = FastAPI(title="Finance Website API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        from .auth import create_demo_user
        create_demo_user(db)
    finally:
        db.close()

@app.post("/auth/login", response_model=TokenOut, tags=["auth"])
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not bcrypt.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_token(user.id, user.email)
    return TokenOut(access_token=token)

app.include_router(bank.router)
app.include_router(payables.router)
app.include_router(receipts.router)
