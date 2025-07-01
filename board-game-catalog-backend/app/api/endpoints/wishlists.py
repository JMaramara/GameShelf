# app/api/endpoints/wishlists.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.api.deps import get_current_user
from app.database import get_db
from app.services import bgg_api

router = APIRouter()

def get_or_create_game(db: Session, bgg_id: int) -> models.Game:
    """
    Helper to ensure a game exists in our local DB before adding to wishlist.
    """
    db_game = crud.get_game_by_bgg_id(db, bgg_id=bgg_id)
    if db_game:
        return db_game
    try:
        bgg_details = bgg_api.get_bgg_game_details(bgg_id)
        if not bgg_details:
            raise HTTPException(status_code=404, detail=f"Game with BGG ID {bgg_id} not found.")
        game_to_create = schemas.GameCreate(**bgg_details)
        return crud.create_game(db=db, game=game_to_create)
    except bgg_api.BGGAPIError as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.get("/", response_model=List[schemas.WishlistInDB])
def get_user_wishlist(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all games in the current user's wishlist."""
    return crud.get_user_wishlist(db, user_id=current_user.id)

@router.post("/", response_model=schemas.WishlistInDB, status_code=status.HTTP_201_CREATED)
def add_game_to_user_wishlist(
    wishlist_data: schemas.WishlistCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a game to the current user's wishlist."""
    game_in_db = get_or_create_game(db, bgg_id=wishlist_data.game_id)

    # Check if game is already in collection
    collection_entry = crud.get_user_collection_entry(db, user_id=current_user.id, game_id=game_in_db.id)
    if collection_entry:
        raise HTTPException(status_code=409, detail="This game is already in your collection.")

    existing_entry = crud.get_wishlist_entry(db, user_id=current_user.id, game_id=game_in_db.id)
    if existing_entry:
        raise HTTPException(status_code=409, detail="Game already in your wishlist.")

    return crud.add_game_to_wishlist(
        db=db, user_id=current_user.id, game_id=game_in_db.id,
        priority=wishlist_data.priority, notes=wishlist_data.notes
    )

@router.put("/{entry_id}", response_model=schemas.WishlistInDB)
def update_wishlist_item(
    entry_id: int,
    wishlist_update: schemas.WishlistUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates a wishlist item."""
    db_entry = db.query(models.Wishlist).filter(models.Wishlist.id == entry_id, models.Wishlist.user_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Wishlist entry not found.")
    
    updated_entry = crud.update_wishlist_entry(db, wishlist_entry_id=entry_id, wishlist_update=wishlist_update)
    db.refresh(updated_entry)
    return updated_entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_from_user_wishlist(
    entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a game from the user's wishlist."""
    db_entry = db.query(models.Wishlist).filter(models.Wishlist.id == entry_id, models.Wishlist.user_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Wishlist entry not found")
    crud.delete_wishlist_entry(db, entry_id=entry_id)
    return
