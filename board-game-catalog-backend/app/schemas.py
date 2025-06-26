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
class User(BaseModel):
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
class Game(GameBase):
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
class UserCollection(UserCollectionBase):
    id: int
    user_id: int
    game: Game
    class Config:
        from_attributes = True

# --- Wishlist Schemas ---
class WishlistBase(BaseModel):
    game_id: int
    notes: Optional[str] = None
class WishlistCreate(WishlistBase):
    pass
class Wishlist(WishlistBase):
    id: int
    user_id: int
    game: Game
    class Config:
        from_attributes = True

# --- Add the entire new section below ---
# --- PlaySession Schemas ---

# Base class with all common, optional fields
class PlaySessionBase(BaseModel):
    notes: Optional[str] = None
    rating: Optional[int] = None
    game_state_notes: Optional[str] = None
    players: Optional[str] = None

# Schema for CREATING a play session
class PlaySessionCreate(PlaySessionBase):
    bgg_id: int
    date: Optional[date] = None # User can optionally provide a date

# Base for the RESPONSE model, with fields guaranteed from the DB
class PlaySessionInDBBase(PlaySessionBase):
    id: int
    owner_id: int
    game_id: int
    date: date # The response will ALWAYS have a date

# Final RESPONSE model
class PlaySession(PlaySessionInDBBase):
    class Config:
        from_attributes = True
