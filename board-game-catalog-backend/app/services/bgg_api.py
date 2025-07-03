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
        title_element = item.find("name")
        year_element = item.find("yearpublished")
        if bgg_id and title_element is not None:
            title = title_element.get("value")
            year_published = year_element.get("value") if year_element is not None else None
            results.append({
                "bgg_id": int(bgg_id),
                "title": title,
                "year_published": int(year_published) if year_published and year_published.isdigit() else None
            })
    return results


def get_bgg_game_details(bgg_id):
    time.sleep(0.25)  # Rate-limiting to be polite to BGG

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

    def get_text(element):
        return element.text.strip() if element is not None and element.text else None

    def get_int_value(element, attribute='value'):
        val = get_value(element, attribute)
        try:
            return int(val) if val else None
        except (ValueError, TypeError):
            return None

    def sanitize_description(desc_text):
        if desc_text:
            return (desc_text
                    .replace('&#10;', '\n')
                    .replace('&nbsp;', ' ')
                    .replace('&quot;', '"')
                    .replace('&mdash;', '—'))
        return None

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
        "box_art_url": get_text(item.find("image")),
        "thumbnail_url": get_text(item.find("thumbnail")),
        "description": sanitize_description(get_text(item.find("description"))),
        "bgg_rating": get_value(stats.find("average")),
        "bgg_num_voters": get_int_value(stats.find("usersrated")),
        "bgg_link": f"https://boardgamegeek.com/boardgame/{bgg_id}"
    }

    return details

