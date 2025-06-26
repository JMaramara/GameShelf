# board-game-catalog-backend/app/api/endpoints/wishlists.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.database import get_db
from app.api.deps import get_current_user
from app.services import bgg_api

router = APIRouter(redirect_slashes=False)

@router.post("/", response_model=schemas.WishlistInDB, status_code=status.HTTP_201_CREATED)
def add_game_to_user_wishlist(
    wishlist_data: schemas.WishlistCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a game to the current user's wishlist."""
    game_in_db = crud.get_game_by_bgg_id(db, bgg_id=wishlist_data.game_id)
    if not game_in_db:
        try:
            bgg_details = bgg_api.get_bgg_game_details(wishlist_data.game_id)
            if bgg_details:
                game_in_db = crud.create_game(db=db, game=schemas.GameCreate(**bgg_details))
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found on BoardGameGeek and cannot be added to wishlist.")
        except bgg_api.BGGAPIError as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Failed to retrieve game details from BGG: {e}")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

    existing_entry = crud.get_wishlist_entry(db, user_id=current_user.id, game_id=game_in_db.id)
    if existing_entry:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Game already in your wishlist.")

    wishlist_entry = crud.add_game_to_wishlist(
        db=db,
        user_id=current_user.id,
        game_id=game_in_db.id, # CRITICAL: Use internal Game.id
        priority=wishlist_data.priority,
        notes=wishlist_data.notes
    )
    return wishlist_entry

@router.get("/", response_model=List[schemas.WishlistInDB])
def get_user_wishlist(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all games in the current user's wishlist."""
    wishlist_entries = crud.get_user_wishlist(db, user_id=current_user.id)
    for entry in wishlist_entries:
        if not hasattr(entry, 'game') or entry.game is None:
            entry.game = crud.get_game_by_bgg_id(db, entry.game_id)
    return wishlist_entries

@router.put("/{wishlist_entry_id}", response_model=schemas.WishlistInDB)
def update_game_in_user_wishlist(
    wishlist_entry_id: int,
    wishlist_update: schemas.WishlistUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates priority or notes for a game in the user's wishlist."""
    db_entry = db.query(models.Wishlist).filter(
        models.Wishlist.id == wishlist_entry_id,
        models.Wishlist.user_id == current_user.id
    ).first()

    if not db_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist entry not found or not owned by user.")

    updated_entry = crud.update_wishlist_entry(db, wishlist_entry_id=wishlist_entry_id, wishlist_update=wishlist_update)
    db.refresh(updated_entry)
    updated_entry.game = crud.get_game_by_bgg_id(db, updated_entry.game_id)
    return updated_entry

@router.delete("/{wishlist_entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_from_user_wishlist(
    wishlist_entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a game from the user's wishlist."""
    db_entry = db.query(models.Wishlist).filter(
        models.Wishlist.id == wishlist_entry_id,
        models.Wishlist.user_id == current_user.id
    ).first()

    if not db_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist entry not found or not owned by user.")

    crud.delete_wishlist_entry(db, wishlist_entry_id)
