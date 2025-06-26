# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
class UserCreate(UserBase):
    password: str
class UserLogin(UserBase):
    password: str
class UserInDB(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    class Config:
        from_attributes = True
class Token(BaseModel):
    access_token: str
    token_type: str
class TokenData(BaseModel):
    email: Optional[str] = None

# --- Game Schemas ---
class GameBase(BaseModel):
    bgg_id: int
    title: str
    publisher: Optional[str] = None
    year_published: Optional[int] = None
    min_players: Optional[int] = None
    max_players: Optional[int] = None
    playing_time_min: Optional[int] = None
    playing_time_max: Optional[int] = None
    recommended_age: Optional[int] = None
    box_art_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    description: Optional[str] = None
    bgg_rating: Optional[str] = None
    bgg_num_voters: Optional[int] = None
    bgg_link: Optional[str] = None
class GameCreate(GameBase):
    pass
class GameInDB(GameBase):
    id: int
    class Config:
        from_attributes = True

# --- User Collection Schemas ---
class UserCollectionBase(BaseModel):
    game_id: int
    personal_notes: Optional[str] = None
    custom_tags: Optional[str] = None
class UserCollectionCreate(UserCollectionBase):
    pass
class UserCollectionUpdate(BaseModel):
    personal_notes: Optional[str] = None
    custom_tags: Optional[str] = None
    for_sale_trade: Optional[bool] = None
class UserCollectionInDB(UserCollectionBase):
    id: int
    user_id: int
    game: GameInDB
    class Config:
        from_attributes = True

# --- Wishlist Schemas (Now with Update) ---
class WishlistBase(BaseModel):
    game_id: int
    notes: Optional[str] = None
class WishlistCreate(WishlistBase):
    pass
class WishlistUpdate(BaseModel):
    notes: Optional[str] = None
    priority: Optional[int] = None
class WishlistInDB(WishlistBase):
    id: int
    user_id: int
    game: GameInDB
    class Config:
        from_attributes = True

# --- Barcode Schemas ---
class BarcodeMappingBase(BaseModel):
    barcode: str
    game_id: int
class BarcodeMappingCreate(BarcodeMappingBase):
    pass
class BarcodeMappingInDB(BarcodeMappingBase):
    id: int
    class Config:
        from_attributes = True
class BarcodeLookupResult(BaseModel):
    game: Optional[GameInDB] = None
    message: str
    success: bool

# --- PlaySession Schemas ---
class PlaySessionBase(BaseModel):
    notes: Optional[str] = None
    rating: Optional[int] = None
    game_state_notes: Optional[str] = None
    players: Optional[str] = None
class PlaySessionCreate(PlaySessionBase):
    bgg_id: int
    date: Optional[date] = None
class PlaySessionInDBBase(PlaySessionBase):
    id: int
    owner_id: int
    game_id: int
    date: date
class PlaySession(PlaySessionInDBBase):
    class Config:
        from_attributes = True
