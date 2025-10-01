from fastapi import Depends
from .auth import get_db, get_current_user
from sqlalchemy.orm import Session
from .models import User

def DB() -> Session:
    return next(get_db())

def CurrentUser(user: User = Depends(get_current_user)) -> User:
    return user
