# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import users, games, wishlists, plays # ADD 'plays' here

app = FastAPI(
    title="Board Game Catalog API",
    description="API for managing board game collections and wishlists.",
    version="0.2.0-alpha", # Bumped version for new feature
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(games.router, prefix="/games", tags=["games"])
app.include_router(wishlists.router, prefix="/wishlists", tags=["wishlists"])
app.include_router(plays.router, prefix="/plays", tags=["plays"]) # ADD THIS LINE

@app.get("/")
def root():
    return {"message": "Welcome to the Board Game Catalog API!"}
