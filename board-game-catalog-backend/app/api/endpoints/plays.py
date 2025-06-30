# app/api/endpoints/plays.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.api.deps import get_current_user
from app.database import get_db
from app.services import bgg_api

router = APIRouter()

# THIS IS THE NEW ENDPOINT
@router.get("/", response_model=List[schemas.PlaySessionWithGame])
def read_all_user_plays(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve all play sessions for the current user.
    """
    return crud.get_all_user_plays(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/", response_model=schemas.PlaySession, status_code=status.HTTP_201_CREATED)
def log_play_session(
    *,
    db: Session = Depends(get_db),
    play_in: schemas.PlaySessionCreate,
    current_user: models.User = Depends(get_current_user)
):
    # This function is unchanged
    game = crud.get_game_by_bgg_id(db, bgg_id=play_in.bgg_id)
    if not game:
        bgg_details = bgg_api.get_bgg_game_details(bgg_id=play_in.bgg_id)
        if not bgg_details:
            raise HTTPException(status_code=404, detail=f"Game with BGG ID {play_in.bgg_id} not found.")
        game_to_create = schemas.GameCreate(**bgg_details)
        game = crud.create_game(db=db, game=game_to_create)

    collection_entry = db.query(models.UserCollection).filter(
        models.UserCollection.user_id == current_user.id,
        models.UserCollection.game_id == game.id
    ).first()

    if collection_entry:
        collection_entry.times_played += 1
        db.add(collection_entry)
    
    play_session = crud.create_play_session(
        db=db, user_id=current_user.id, game_id=game.id, play_data=play_in
    )
    return play_session

@router.get("/{game_id}", response_model=List[schemas.PlaySession])
def read_play_sessions(
    *,
    db: Session = Depends(get_db),
    game_id: int,
    current_user: models.User = Depends(get_current_user)
):
    # This function is unchanged
    return crud.get_play_sessions_for_game(db=db, user_id=current_user.id, game_id=game_id)
