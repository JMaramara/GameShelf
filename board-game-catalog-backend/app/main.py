# board-game-catalog-backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.api.endpoints import users, games, wishlists

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Board Game Catalog API",
    description="API for managing board game collections and wishlists.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    # REMOVED: redirect_slashes=False from here. Will set on APIRouters.
)

# Configure CORS - Ensure this is correctly placed and origins are exhaustive
origins = [
    "http://localhost",
    "http://localhost:5173",        # Vite dev server
    "http://127.0.0.1:5173",        # Common alternative for localhost
    f"http://192.168.2.11:5173", # IMPORTANT: Replace with your actual current Mac IP and Vite port
    # Your phone's IP when acting as hotspot (e.g., if you opened browser on phone directly)
    f"http://192.168.2.11:8000", # This is the backend's address, primarily for debugging client on same device
    # When deployed: "https://your-frontend-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(games.router, prefix="/games", tags=["games"])
app.include_router(wishlists.router, prefix="/wishlists", tags=["wishlists"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Board Game Catalog API!"}

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(Base.metadata.tables['users'].select())
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database connection failed: {e}")
