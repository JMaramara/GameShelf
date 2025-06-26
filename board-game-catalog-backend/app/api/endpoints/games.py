# board-game-catalog-backend/app/api/endpoints/games.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query # Ensure Query is imported
from sqlalchemy.orm import Session # Ensure Session is imported

from app import crud, schemas, models
from app.database import get_db
from app.api.deps import get_current_user
from app.services import bgg_api

router = APIRouter(redirect_slashes=False)

@router.get("/search-bgg", response_model=List[schemas.GameInDB])
def search_games_on_bgg(query: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """
    Searches for games on BoardGameGeek and returns basic info.
    If a game is found on BGG, it is also saved/updated in our local database.
    """
    try:
        bgg_results = bgg_api.search_bgg_games(query)
        games_in_db = []
        for result in bgg_results:
            db_game = crud.get_game_by_bgg_id(db, bgg_id=result["bgg_id"])
            if not db_game:
                full_details = bgg_api.get_bgg_game_details(result["bgg_id"])
                if full_details:
                    game_schema = schemas.GameCreate(**full_details)
                    db_game = crud.create_game(db=db, game=game_schema)
            if db_game:
                games_in_db.append(db_game)
        return [schemas.GameInDB.from_orm(game) for game in games_in_db if game is not None]
    except bgg_api.BGGAPIError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

@router.get("/{bgg_id}", response_model=schemas.GameInDB)
def get_game_details(bgg_id: int, db: Session = Depends(get_db)):
    """
    Retrieves detailed information for a specific game, preferring local cache.
    If not in local cache, fetches from BGG and stores it.
    """
    db_game = crud.get_game_by_bgg_id(db, bgg_id=bgg_id)
    if db_game:
        return db_game

    try:
        bgg_details = bgg_api.get_bgg_game_details(bgg_id)
        if bgg_details:
            game_schema = schemas.GameCreate(**bgg_details)
            db_game = crud.create_game(db=db, game=game_schema)
            return db_game
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found on BoardGameGeek")
    except bgg_api.BGGAPIError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

@router.post("/collection/", response_model=schemas.UserCollectionInDB, status_code=status.HTTP_201_CREATED)
def add_game_to_user_collection(
    collection_data: schemas.UserCollectionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a game to the current user's collection."""
    # Ensure the game exists in our database by its BGG_ID, creating it if necessary.
    # We need the internal game_id (game_from_bgg_id.id) for the foreign key.
    game_from_bgg_id = crud.get_game_by_bgg_id(db, bgg_id=collection_data.game_id) # game_id in schema is BGG_ID
    if not game_from_bgg_id:
        try:
            bgg_details = bgg_api.get_bgg_game_details(collection_data.game_id)
            if not bgg_details:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found on BoardGameGeek.")
            game_from_bgg_id = crud.create_game(db=db, game=schemas.GameCreate(**bgg_details))
        except bgg_api.BGGAPIError as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Failed to retrieve game details from BGG: {e}")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

    # Now that we have the guaranteed correct internal game_in_db object:
    # Check if the game is already in the user's collection using the INTERNAL game_from_bgg_id.id
    existing_entry = crud.get_user_collection_entry(db, user_id=current_user.id, game_id=game_from_bgg_id.id)
    if existing_entry:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Game already in your collection.")

    # Finally, add to collection using the INTERNAL game_from_bgg_id.id
    collection_entry = crud.add_game_to_collection(
        db=db,
        user_id=current_user.id,
        game_id=game_from_bgg_id.id, # CRITICAL: Use the internal ID from the fetched/created Game object
        personal_notes=collection_data.personal_notes,
        custom_tags=collection_data.custom_tags
    )
    # SQLAlchemy's ORM should populate the 'game' relationship on this fresh object.
    return collection_entry

@router.get("/collection/", response_model=List[schemas.UserCollectionInDB])
def get_user_collection(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all games in the current user's collection."""
    collection_entries = crud.get_user_collections(db, user_id=current_user.id)
    # Note: crud.get_user_collections now uses joinedload to ensure 'game' relationship is loaded.
    return collection_entries

@router.put("/collection/{collection_entry_id}", response_model=schemas.UserCollectionInDB)
def update_game_in_user_collection(
    collection_entry_id: int,
    collection_update: schemas.UserCollectionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates notes or tags for a game in the user's collection."""
    # Fetch the entry to be updated, ensuring 'game' relationship is loaded.
    # crud.get_user_collection_entry uses joinedload, which is ideal here.
    db_entry_to_update = crud.get_user_collection_entry(db, user_id=current_user.id, game_id=db.query(models.UserCollection).filter(models.UserCollection.id == collection_entry_id).first().game_id)

    if not db_entry_to_update or db_entry_to_update.user_id != current_user.id:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection entry not found or not owned by user.")

    # Perform the update
    updated_entry_db_object = crud.update_user_collection_entry(db, collection_entry_id=collection_entry_id, collection_update=collection_update)

    # CRITICAL FIX: Re-fetch the updated entry with its 'game' relationship explicitly loaded
    # This guarantees the response model gets a fully hydrated object.
    reloaded_entry_for_response = crud.get_user_collection_entry(db, user_id=current_user.id, game_id=updated_entry_db_object.game_id)

    if not reloaded_entry_for_response: # Should not happen if update was successful
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reload updated entry for response.")

    return reloaded_entry_for_response

@router.delete("/collection/{collection_entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game_from_user_collection(
    collection_entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a game from the user's collection."""
    db_entry = db.query(models.UserCollection).filter(
        models.UserCollection.id == collection_entry_id,
        models.UserCollection.user_id == current_user.id
    ).first()

    if not db_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection entry not found or not owned by user.")

    crud.delete_user_collection_entry(db, collection_entry_id)
    # No return value needed for 204 No Content

# Barcode endpoints (if you ever re-enable them)
@router.post("/barcode-lookup", response_model=schemas.BarcodeLookupResult)
def lookup_barcode(barcode: str, db: Session = Depends(get_db)):
    """
    Attempts to lookup a game by barcode.
    If found in local database, returns game details.
    Otherwise, indicates it's not found and requires manual association.
    """
    db_mapping = crud.get_barcode_mapping(db, barcode=barcode)
    if db_mapping:
        game = crud.get_game_by_bgg_id(db, bgg_id=db_mapping.game_id)
        if game:
            return schemas.BarcodeLookupResult(game=game, message="Game found by barcode.", success=True)
    return schemas.BarcodeLookupResult(game=None, message="Barcode not found in our database. Please search and associate manually.", success=False)

@router.post("/barcode-associate", response_model=schemas.BarcodeMappingInDB, status_code=status.HTTP_201_CREATED)
def associate_barcode_with_game(
    barcode: str,
    bgg_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Associates a given barcode with a BGG Game ID in our database.
    This builds our custom barcode database over time.
    """
    db_game = crud.get_game_by_bgg_id(db, bgg_id=bgg_id)
    if not db_game:
        try:
            bgg_details = bgg_api.get_bgg_game_details(bgg_id)
            if bgg_details:
                db_game = crud.create_game(db=db, game=schemas.GameCreate(**bgg_details))
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BGG Game ID not found.")
        except bgg_api.BGGAPIError as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Failed to retrieve game details from BGG: {e}")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

    try:
        db_mapping = crud.create_barcode_mapping(db, barcode=barcode, game_id=db_game.id)
        return db_mapping
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not associate barcode: {e}")
