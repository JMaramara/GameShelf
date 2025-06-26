# app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    collections = relationship("UserCollection", back_populates="owner")
    wishlists = relationship("Wishlist", back_populates="owner")
    play_sessions = relationship("PlaySession", back_populates="owner") # Add this line

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    bgg_id = Column(Integer, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    publisher = Column(String)
    year_published = Column(Integer)
    min_players = Column(Integer)
    max_players = Column(Integer)
    playing_time_min = Column(Integer)
    playing_time_max = Column(Integer)
    recommended_age = Column(Integer)
    box_art_url = Column(String)
    thumbnail_url = Column(String)
    description = Column(Text)
    bgg_rating = Column(String)
    bgg_num_voters = Column(Integer)
    bgg_link = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user_collections = relationship("UserCollection", back_populates="game")
    wishlist_entries = relationship("Wishlist", back_populates="game")
    barcode_mappings = relationship("BarcodeMapping", back_populates="game")
    play_sessions = relationship("PlaySession", back_populates="game") # Add this line

class UserCollection(Base):
    __tablename__ = "user_collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    personal_notes = Column(Text)
    custom_tags = Column(String)
    times_played = Column(Integer, default=0)
    owned_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    for_sale_trade = Column(Boolean, default=False)
    sale_trade_notes = Column(Text)

    owner = relationship("User", back_populates="collections")
    game = relationship("Game", back_populates="user_collections")

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    priority = Column(Integer, default=1)
    notes = Column(Text)
    added_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="wishlists")
    game = relationship("Game", back_populates="wishlist_entries")

class BarcodeMapping(Base):
    __tablename__ = "barcode_mappings"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, index=True, nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    game = relationship("Game", back_populates="barcode_mappings")

# Add the entire new class below
class PlaySession(Base):
    __tablename__ = "play_sessions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    notes = Column(String) # For post-game thoughts
    rating = Column(Integer)
    players = Column(String) # Simple text field for player names
    game_state_notes = Column(Text) # For saving in-progress games

    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    game = relationship("Game", back_populates="play_sessions")
    owner = relationship("User", back_populates="play_sessions")
