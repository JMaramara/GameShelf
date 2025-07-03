# app/api/endpoints/games.py
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
    Checks for a game in the local DB by BGG ID.
    If found, it checks if the data is stale (missing thumbnail) and updates if necessary.
    If not found, fetches from BGG, creates it locally, and returns it.
    """
    db_game = crud.get_game_by_bgg_id(db, bgg_id=bgg_id)
    
    # --- NEW SELF-HEALING CACHE LOGIC ---
    if db_game and not db_game.thumbnail_url:
        # Cache hit, but the data is stale (missing image). Re-fetch and update.
        try:
            bgg_details = bgg_api.get_bgg_game_details(bgg_id)
            if bgg_details:
                game_update_schema = schemas.GameCreate(**bgg_details)
                db_game = crud.update_game_details(db, db_game=db_game, game_update=game_update_schema)
        except bgg_api.BGGAPIError as e:
            # If BGG fails, we can still return the stale data we have.
            print(f"Could not refresh stale cache for bgg_id {bgg_id}: {e}")

    elif not db_game:
        # Cache miss, fetch from BGG and create new entry
        try:
            bgg_details = bgg_api.get_bgg_game_details(bgg_id)
            if not bgg_details:
                raise HTTPException(status_code=404, detail=f"Game with BGG ID {bgg_id} not found.")
            game_to_create = schemas.GameCreate(**bgg_details)
            db_game = crud.create_game(db=db, game=game_to_create)
        except bgg_api.BGGAPIError as e:
            raise HTTPException(status_code=503, detail=str(e))

    return db_game


@router.get("/search-bgg", response_model=List[schemas.GameSearchResult])
def search_games_on_bgg(query: str):
    try:
        return bgg_api.search_bgg_games(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{bgg_id}", response_model=schemas.GameInDB)
def get_game_details(bgg_id: int, db: Session = Depends(get_db)):
    return get_or_create_game(db, bgg_id=bgg_id)


@router.get("/collection/", response_model=List[schemas.UserCollectionInDB])
def get_user_collection(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_user_collections(db, user_id=current_user.id)


@router.post("/collection/", response_model=schemas.UserCollectionInDB, status_code=status.HTTP_201_CREATED)
def add_game_to_user_collection(
    collection_data: schemas.UserCollectionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    game_in_db = get_or_create_game(db, bgg_id=collection_data.game_id)
    
    existing_entry = crud.get_user_collection_entry(db, user_id=current_user.id, game_id=game_in_db.id)
    if existing_entry:
        raise HTTPException(status_code=409, detail="Game already in your collection.")

    wishlist_entry = crud.get_wishlist_entry(db, user_id=current_user.id, game_id=game_in_db.id)
    if wishlist_entry:
        crud.delete_wishlist_entry(db, entry_id=wishlist_entry.id)

    collection_entry = crud.add_game_to_collection(
        db=db, user_id=current_user.id, game_id=game_in_db.id,
        personal_notes=collection_data.personal_notes, custom_tags=collection_data.custom_tags
    )
    return collection_entry


@router.delete("/collection/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_from_user_collection(
    entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_entry = db.query(models.UserCollection).filter(models.UserCollection.id == entry_id, models.UserCollection.user_id == current_user.id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Collection entry not found")
    crud.delete_user_collection_entry(db, entry_id=entry_id)
    return
