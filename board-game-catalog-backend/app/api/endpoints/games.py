# app/api/endpoints/games.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.api.deps import get_current_user
from app.database import get_db
from app.services import bgg_api

router = APIRouter()

@router.get("/search-bgg", response_model=List[schemas.GameInDB])
def search_games_on_bgg(query: str, db: Session = Depends(get_db)):
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
        return games_in_db
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/collection/", response_model=List[schemas.UserCollectionInDB])
def get_user_collection(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_user_collections(db, user_id=current_user.id)

@router.post("/collection/", response_model=schemas.UserCollectionInDB, status_code=status.HTTP_201_CREATED)
def add_game_to_user_collection(
    collection_data: schemas.UserCollectionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    game_in_db = crud.get_game_by_bgg_id(db, bgg_id=collection_data.game_id)
    if not game_in_db:
        bgg_details = bgg_api.get_bgg_game_details(collection_data.game_id)
        if not bgg_details:
            raise HTTPException(status_code=404, detail="Game not found on BoardGameGeek.")
        game_in_db = crud.create_game(db=db, game=schemas.GameCreate(**bgg_details))
    
    existing_entry = crud.get_user_collection_entry(db, user_id=current_user.id, game_id=game_in_db.id)
    if existing_entry:
        raise HTTPException(status_code=409, detail="Game already in your collection.")

    collection_entry = crud.add_game_to_collection(
        db=db, user_id=current_user.id, game_id=game_in_db.id,
        personal_notes=collection_data.personal_notes, custom_tags=collection_data.custom_tags
    )
    return collection_entry

@router.put("/collection/{entry_id}", response_model=schemas.UserCollectionInDB)
def update_game_in_user_collection(
    entry_id: int,
    collection_update: schemas.UserCollectionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_entry = crud.get_user_collection_entry(db, user_id=current_user.id, game_id=db.query(models.UserCollection).filter(models.UserCollection.id == entry_id).first().game_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Collection entry not found.")

    updated_entry = crud.update_user_collection_entry(db, collection_entry_id=entry_id, collection_update=collection_update)
    db.refresh(updated_entry)
    return updated_entry

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
