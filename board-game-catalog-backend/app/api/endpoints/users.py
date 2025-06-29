# app/api/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app import crud, schemas, models
from app.api.deps import get_current_user
from app.database import get_db
from app.core.config import settings
from app.core import security # Import the whole security module

router = APIRouter()

@router.post("/register", response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_email(db, email=form_data.username)
    # This now calls security.verify_password
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserInDB)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/stats", response_model=schemas.UserStats)
def get_user_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    stats = crud.get_user_stats(db, user_id=current_user.id)
    return stats
