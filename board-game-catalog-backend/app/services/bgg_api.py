import requests
import xml.etree.ElementTree as ET
from typing import Optional, Dict, Any, List # Added List import

BGG_API_BASE_URL = "https://www.boardgamegeek.com/xmlapi2"

class BGGAPIError(Exception):
    pass

def search_bgg_games(query: str) -> List[Dict[str, Any]]:
    """
    Searches BoardGameGeek for games by title.
    Returns a list of dictionaries with basic game info (id, name, yearpublished).
    """
    params = {
        "query": query,
        "type": "boardgame",
        "exact": 0 # Non-exact search
    }
    try:
        response = requests.get(f"{BGG_API_BASE_URL}/search", params=params, timeout=10)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        games = []
        for item in root.findall(".//item"):
            game_id = item.get("id")
            name_elem = item.find("name")
            year_elem = item.find("yearpublished")

            game_data = {
                "bgg_id": int(game_id),
                "title": name_elem.get("value") if name_elem is not None else "N/A",
                "year_published": int(year_elem.get("value")) if year_elem is not None else None
            }
            games.append(game_data)
        return games
    except requests.exceptions.RequestException as e:
        raise BGGAPIError(f"Error connecting to BGG API: {e}")
    except ET.ParseError as e:
        raise BGGAPIError(f"Error parsing BGG API response: {e}")

def get_bgg_game_details(bgg_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves detailed information for a specific game from BoardGameGeek.
    Returns a dictionary of game details.
    """
    params = {
        "id": bgg_id,
        "stats": 1, # Request statistics like rating, num voters
        "videos": 0,
        "marketplace": 0
    }
    try:
        response = requests.get(f"{BGG_API_BASE_URL}/thing", params=params, timeout=10)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        item = root.find(".//item")

        if item is None:
            return None

        # Attempt to find primary name first
        primary_name_elem = item.find("./name[@type='primary']")
        title = primary_name_elem.get("value") if primary_name_elem is not None else "N/A"

        # Fallback for publisher (BGG sometimes lists multiple or none with a specific type)
        publisher_elem = item.find("./link[@type='boardgamepublisher']")
        publisher_name = publisher_elem.get("value") if publisher_elem is not None else None

        game_data = {
            "bgg_id": int(item.get("id")),
            "title": title,
            "publisher": publisher_name,
            "year_published": int(item.find("yearpublished").get("value")) if item.find("yearpublished") is not None and item.find("yearpublished").get("value").isdigit() else None,
            "min_players": int(item.find("minplayers").get("value")) if item.find("minplayers") is not None and item.find("minplayers").get("value").isdigit() else None,
            "max_players": int(item.find("maxplayers").get("value")) if item.find("maxplayers") is not None and item.find("maxplayers").get("value").isdigit() else None,
            "playing_time_min": int(item.find("minplaytime").get("value")) if item.find("minplaytime") is not None and item.find("minplaytime").get("value").isdigit() else None,
            "playing_time_max": int(item.find("maxplaytime").get("value")) if item.find("maxplaytime") is not None and item.find("maxplaytime").get("value").isdigit() else None,
            "recommended_age": int(item.find("minage").get("value")) if item.find("minage") is not None and item.find("minage").get("value").isdigit() else None,
            "box_art_url": item.find("image").text if item.find("image") is not None else None,
            "thumbnail_url": item.find("thumbnail").text if item.find("thumbnail") is not None else None,
            "description": item.find("description").text if item.find("description") is not None else None,
            "bgg_link": f"https://boardgamegeek.com/boardgame/{item.get('id')}",
        }

        # Handle statistics
        statistics = item.find("statistics/ratings")
        if statistics is not None:
            game_data["bgg_rating"] = statistics.find("average").get("value") if statistics.find("average") is not None else "N/A"
            game_data["bgg_num_voters"] = int(statistics.find("usersrated").get("value")) if statistics.find("usersrated") is not None and statistics.find("usersrated").get("value").isdigit() else 0

        return game_data

    except requests.exceptions.RequestException as e:
        raise BGGAPIError(f"Error connecting to BGG API for details: {e}")
    except ET.ParseError as e:
        raise BGGAPIError(f"Error parsing BGG API details response: {e}")
    except Exception as e:
        # Print the BGG response content for better debugging if parsing fails
        print(f"DEBUG: Error processing BGG details for ID {bgg_id}: {e}")
        print(f"DEBUG: BGG API response content: {response.content.decode('utf-8') if 'response' in locals() else 'No response'}")
        raise BGGAPIError(f"Unexpected error processing BGG game details: {e}")
