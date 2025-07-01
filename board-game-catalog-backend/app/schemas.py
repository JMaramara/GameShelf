# app/schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- Search Schema ---
# This new schema matches the minimal data from a BGG search
class GameSearchResult(BaseModel):
    bgg_id: int
    title: str
    year_published: Optional[int] = None

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

# --- User Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserStats(BaseModel):
    collection_count: int
    wishlist_count: int
    plays_count: int

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
    sale_trade_notes: Optional[str] = None

class UserCollectionInDB(UserCollectionBase):
    id: int
    user_id: int
    game: GameInDB
    class Config:
        from_attributes = True

# --- Wishlist Schemas ---
class WishlistBase(BaseModel):
    game_id: int
    notes: Optional[str] = None
    priority: Optional[int] = 1

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

# --- PlaySession Schemas ---
class PlaySessionBase(BaseModel):
    date: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = None
    game_state_notes: Optional[str] = None
    players: Optional[str] = None

class PlaySessionCreate(PlaySessionBase):
    bgg_id: int

class PlaySession(PlaySessionBase):
    id: int
    owner_id: int
    game_id: int
    date: date
    class Config:
        from_attributes = True

class PlaySessionWithGame(PlaySession):
    game: GameInDB
