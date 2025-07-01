# app/services/bgg_api.py
import requests
import xml.etree.ElementTree as ET
import time

BGG_API_URL = "https://www.boardgamegeek.com/xmlapi2"

class BGGAPIError(Exception):
    pass

def search_bgg_games(query):
    try:
        response = requests.get(f"{BGG_API_URL}/search", params={"query": query, "type": "boardgame"})
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise BGGAPIError(f"BGG API search request failed: {e}")

    root = ET.fromstring(response.content)
    results = []
    for item in root.findall(".//item"):
        bgg_id = item.get("id")
        title = item.find("name").get("value")
        year = item.find("yearpublished")
        year_published = int(year.get("value")) if year is not None and year.get("value") else None
        results.append({"bgg_id": int(bgg_id), "title": title, "year_published": year_published})
    return results

def get_bgg_game_details(bgg_id):
    time.sleep(0.2) # Add delay to respect BGG API rate limit
    try:
        response = requests.get(f"{BGG_API_URL}/thing", params={"id": bgg_id, "stats": 1})
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise BGGAPIError(f"BGG API thing request failed for ID {bgg_id}: {e}")

    root = ET.fromstring(response.content)
    item = root.find("item")
    if not item:
        return None

    def get_value(element, attribute='value'):
        return element.get(attribute) if element is not None else None
    def get_int_value(element, attribute='value'):
        val = get_value(element, attribute)
        return int(val) if val and val.isdigit() else None

    stats = item.find("statistics/ratings")
    details = {
        "bgg_id": bgg_id,
        "title": get_value(item.find("name[@type='primary']")),
        "publisher": get_value(item.find("link[@type='boardgamepublisher']")),
        "year_published": get_int_value(item.find("yearpublished")),
        "min_players": get_int_value(item.find("minplayers")),
        "max_players": get_int_value(item.find("maxplayers")),
        "playing_time_min": get_int_value(item.find("minplaytime")),
        "playing_time_max": get_int_value(item.find("maxplaytime")),
        "recommended_age": get_int_value(item.find("minage")),
        "box_art_url": get_value(item.find("image")),
        "thumbnail_url": get_value(item.find("thumbnail")),
        "description": item.find("description").text.replace('&nbsp;', ' ') if item.find("description") is not None else None,
        "bgg_rating": get_value(stats.find("average")),
        "bgg_num_voters": get_int_value(stats.find("usersrated")),
        "bgg_link": f"https://boardgamegeek.com/boardgame/{bgg_id}"
    }
    return details
