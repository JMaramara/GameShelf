# view_cache.py
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = "postgresql://{user}:{password}@{server}/{db}".format(
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    server=os.getenv("POSTGRES_SERVER"),
    db=os.getenv("POSTGRES_DB"),
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def view_cached_games():
    db = SessionLocal()
    try:
        query = text("SELECT id, bgg_id, title, year_published FROM games ORDER BY title")
        result = db.execute(query)
        games = result.fetchall()

        print("-" * 60)
        print(f"{'ID':<5} | {'BGG ID':<10} | {'Year':<6} | {'Title'}")
        print("-" * 60)
        if not games:
            print("No games found in the local cache.")
        else:
            for game in games:
                print(f"{game[0]:<5} | {game[1]:<10} | {game[3] or 'N/A':<6} | {game[2]}")
        print("-" * 60)
        print(f"Total games in cache: {len(games)}")
        print("-" * 60)
    finally:
        db.close()

if __name__ == "__main__":
    view_cached_games()
