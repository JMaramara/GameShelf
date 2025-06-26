# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

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
    pass # No extra fields for creation, inherits from GameBase

class GameInDB(GameBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- User Collection Schemas ---
class UserCollectionBase(BaseModel):
    game_id: int
    personal_notes: Optional[str] = None
    custom_tags: Optional[str] = None
    times_played: Optional[int] = 0

class UserCollectionCreate(UserCollectionBase):
    pass

class UserCollectionUpdate(BaseModel):
    personal_notes: Optional[str] = None
    custom_tags: Optional[str] = None
    times_played: Optional[int] = None
    for_sale_trade: Optional[bool] = None  
    sale_trade_notes: Optional[str] = None  

class UserCollectionInDB(UserCollectionBase):
    id: int
    user_id: int
    owned_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    game: GameInDB # Include game details when fetching collection
    for_sale_trade: bool  # ADD THIS LINE
    sale_trade_notes: Optional[str] = None

    class Config:
        from_attributes = True

# --- Wishlist Schemas ---
class WishlistBase(BaseModel):
    game_id: int
    priority: Optional[int] = 1
    notes: Optional[str] = None

class WishlistCreate(WishlistBase):
    pass

class WishlistUpdate(BaseModel):
    priority: Optional[int] = None
    notes: Optional[str] = None

class WishlistInDB(WishlistBase):
    id: int
    user_id: int
    added_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    game: GameInDB # Include game details when fetching wishlist

    class Config:
        from_attributes = True

# --- Barcode Mapping Schemas ---
class BarcodeMappingBase(BaseModel):
    barcode: str
    game_id: int

class BarcodeMappingCreate(BarcodeMappingBase):
    pass

class BarcodeMappingInDB(BarcodeMappingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BarcodeLookupResult(BaseModel):
    game: Optional[GameInDB] = None
    message: str
    success: bool
