# app/crud.py
from sqlalchemy.orm import Session, joinedload # ADD joinedload here
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from passlib.context import CryptContext
from typing import Optional, List

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- User CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

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
    try:
        db.commit()
        db.refresh(db_game)
        return db_game
    except IntegrityError:
        db.rollback()
        return get_game_by_bgg_id(db, game.bgg_id)

# --- User Collection CRUD ---
def get_user_collection_entry(db: Session, user_id: int, game_id: int):
    # Eager load the 'game' relationship
    return db.query(models.UserCollection).options(joinedload(models.UserCollection.game)).filter(
        models.UserCollection.user_id == user_id,
        models.UserCollection.game_id == game_id
    ).first()

def get_user_collections(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    # Eager load the 'game' relationship for efficient fetching
    return db.query(models.UserCollection).options(joinedload(models.UserCollection.game)).filter(models.UserCollection.user_id == user_id).offset(skip).limit(limit).all()

def add_game_to_collection(db: Session, user_id: int, game_id: int, personal_notes: Optional[str] = None, custom_tags: Optional[str] = None):
    db_collection_entry = models.UserCollection(
        user_id=user_id,
        game_id=game_id,
        personal_notes=personal_notes,
        custom_tags=custom_tags
    )
    db.add(db_collection_entry)
    db.commit()
    db.refresh(db_collection_entry)
    return db_collection_entry

def update_user_collection_entry(db: Session, collection_entry_id: int, collection_update: schemas.UserCollectionUpdate):
    db_entry = db.query(models.UserCollection).filter(models.UserCollection.id == collection_entry_id).first()
    if db_entry:
        for field, value in collection_update.model_dump(exclude_unset=True).items():
            setattr(db_entry, field, value)
        db.commit()
        db.refresh(db_entry) # Refresh the entry to update its state in the session
    return db_entry

def delete_user_collection_entry(db: Session, collection_entry_id: int):
    db_entry = db.query(models.UserCollection).filter(models.UserCollection.id == collection_entry_id).first()
    if db_entry:
        db.delete(db_entry)
        db.commit()
    return db_entry

# --- Barcode Mapping CRUD ---
def get_barcode_mapping(db: Session, barcode: str):
    return db.query(models.BarcodeMapping).filter(models.BarcodeMapping.barcode == barcode).first()

def create_barcode_mapping(db: Session, barcode: str, game_id: int):
    db_mapping = models.BarcodeMapping(barcode=barcode, game_id=game_id)
    db.add(db_mapping)
    try:
        db.commit()
        db.refresh(db_mapping)
        return db_mapping
    except IntegrityError:
        db.rollback()
        return get_barcode_mapping(db, barcode)

# --- Wishlist CRUD ---
def get_wishlist_entry(db: Session, user_id: int, game_id: int):
    # Eager load the 'game' relationship
    return db.query(models.Wishlist).options(joinedload(models.Wishlist.game)).filter(
        models.Wishlist.user_id == user_id,
        models.Wishlist.game_id == game_id
    ).first()

def get_user_wishlist(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    # Eager load the 'game' relationship for efficient fetching
    return db.query(models.Wishlist).options(joinedload(models.Wishlist.game)).filter(models.Wishlist.user_id == user_id).offset(skip).limit(limit).all()

def add_game_to_wishlist(db: Session, user_id: int, game_id: int, priority: Optional[int] = None, notes: Optional[str] = None):
    db_wishlist_entry = models.Wishlist(
        user_id=user_id,
        game_id=game_id,
        priority=priority,
        notes=notes
    )
    db.add(db_wishlist_entry)
    db.commit()
    db.refresh(db_wishlist_entry)
    return db_wishlist_entry

def update_wishlist_entry(db: Session, wishlist_entry_id: int, wishlist_update: schemas.WishlistUpdate):
    db_entry = db.query(models.Wishlist).filter(models.Wishlist.id == wishlist_entry_id).first()
    if db_entry:
        for field, value in wishlist_update.model_dump(exclude_unset=True).items():
            setattr(db_entry, field, value)
        db.commit()
        db.refresh(db_entry)
    return db_entry

def delete_wishlist_entry(db: Session, wishlist_entry_id: int):
    db_entry = db.query(models.Wishlist).filter(models.Wishlist.id == wishlist_entry_id).first()
    if db_entry:
        db.delete(db_entry)
        db.commit()
    return db_entry
