# app/crud.py
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.core.security import get_password_hash # Correctly import from security
from typing import Optional, List
from datetime import date, datetime

# --- User CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Game CRUD ---
def get_game_by_bgg_id(db: Session, bgg_id: int):
    return db.query(models.Game).filter(models.Game.bgg_id == bgg_id).first()

def create_game(db: Session, game: schemas.GameCreate):
    db_game = models.Game(**game.model_dump())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

# --- User Collection CRUD (Restoring missing function) ---
def get_user_collection_entry(db: Session, user_id: int, game_id: int):
    return db.query(models.UserCollection).filter(
        models.UserCollection.user_id == user_id,
        models.UserCollection.game_id == game_id
    ).first()

def get_user_collections(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.UserCollection).join(models.Game).filter(
        models.UserCollection.user_id == user_id
    ).order_by(models.Game.title).offset(skip).limit(limit).all()

def add_game_to_collection(db: Session, user_id: int, game_id: int, personal_notes: Optional[str] = None, custom_tags: Optional[str] = None):
    db_collection_entry = models.UserCollection(
        user_id=user_id, game_id=game_id, personal_notes=personal_notes, custom_tags=custom_tags
    )
    db.add(db_collection_entry)
    db.commit()
    db.refresh(db_collection_entry)
    return db_collection_entry

def update_user_collection_entry(db: Session, collection_entry_id: int, collection_update: schemas.UserCollectionUpdate):
    db_entry = db.query(models.UserCollection).filter(models.UserCollection.id == collection_entry_id).first()
    if not db_entry:
        return None
    update_data = collection_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entry, key, value)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def delete_user_collection_entry(db: Session, entry_id: int):
    db_entry = db.query(models.UserCollection).filter(models.UserCollection.id == entry_id).first()
    if db_entry:
        db.delete(db_entry)
        db.commit()
    return db_entry

# --- Wishlist CRUD (Restoring missing function) ---
def get_wishlist_entry(db: Session, user_id: int, game_id: int):
    return db.query(models.Wishlist).filter(
        models.Wishlist.user_id == user_id,
        models.Wishlist.game_id == game_id
    ).first()

def get_user_wishlist(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Wishlist).join(models.Game).filter(
        models.Wishlist.user_id == user_id
    ).order_by(models.Game.title).offset(skip).limit(limit).all()

def add_game_to_wishlist(db: Session, user_id: int, game_id: int, priority: Optional[int] = 1, notes: Optional[str] = None):
    db_wishlist_entry = models.Wishlist(user_id=user_id, game_id=game_id, priority=priority, notes=notes)
    db.add(db_wishlist_entry)
    db.commit()
    db.refresh(db_wishlist_entry)
    return db_wishlist_entry

def delete_wishlist_entry(db: Session, entry_id: int):
    db_entry = db.query(models.Wishlist).filter(models.Wishlist.id == entry_id).first()
    if db_entry:
        db.delete(db_entry)
        db.commit()
    return db_entry

def update_wishlist_entry(db: Session, wishlist_entry_id: int, wishlist_update: schemas.WishlistUpdate):
    db_entry = db.query(models.Wishlist).filter(models.Wishlist.id == wishlist_entry_id).first()
    if db_entry:
        update_data = wishlist_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_entry, field, value)
        db.commit()
        db.refresh(db_entry)
    return db_entry

# --- PlaySession CRUD ---
def create_play_session(db: Session, user_id: int, game_id: int, play_data: schemas.PlaySessionCreate):
    final_date = date.today()
    if play_data.date:
        try:
            final_date = datetime.strptime(play_data.date, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            pass
    db_play_session = models.PlaySession(
        owner_id=user_id, game_id=game_id, date=final_date,
        notes=play_data.notes, rating=play_data.rating,
        game_state_notes=play_data.game_state_notes, players=play_data.players
    )
    db.add(db_play_session)
    db.commit()
    db.refresh(db_play_session)
    return db_play_session

def get_play_sessions_for_game(db: Session, user_id: int, game_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.PlaySession).filter(
        models.PlaySession.owner_id == user_id,
        models.PlaySession.game_id == game_id
    ).order_by(models.PlaySession.date.desc()).offset(skip).limit(limit).all()

# --- User Stats CRUD ---
def get_user_stats(db: Session, user_id: int):
    collection_count = db.query(models.UserCollection).filter(models.UserCollection.user_id == user_id).count()
    wishlist_count = db.query(models.Wishlist).filter(models.Wishlist.user_id == user_id).count()
    plays_count = db.query(models.PlaySession).filter(models.PlaySession.owner_id == user_id).count()
    return {"collection_count": collection_count, "wishlist_count": wishlist_count, "plays_count": plays_count}
