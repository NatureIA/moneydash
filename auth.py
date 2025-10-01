import time, jwt
from passlib.hash import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .config import settings
from .database import SessionLocal
from .models import User

bearer = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_demo_user(db: Session):
    user = db.query(User).filter(User.email == settings.DEMO_EMAIL).first()
    if not user:
        pwd = bcrypt.hash(settings.DEMO_PASSWORD)
        user = User(email=settings.DEMO_EMAIL, password_hash=pwd, name="Admin Demo", role="admin")
        db.add(user); db.commit()

def create_token(user_id: int, email: str):
    payload = { "sub": str(user_id), "email": email, "exp": int(time.time()) + settings.JWT_EXPIRE_MIN * 60 }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user: raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user
