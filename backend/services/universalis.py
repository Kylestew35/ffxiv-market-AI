# backend/services/universalis.py

import urllib3
import json
from config import UNIVERSALIS_BASE_URL

http = urllib3.PoolManager()

CRYSTAL_WORLDS = [
    "Balmung",
    "Brynhildr",
    "Coeurl",
    "Diabolos",
    "Goblin",
    "Malboro",
    "Mateus",
    "Zalera",
]


def get_market_data(world: str, item_id: int):
    url = f"{UNIVERSALIS_BASE_URL}/{world}/{item_id}"
    resp = http.request("GET", url, timeout=5)

    if resp.status != 200:
        return {"error": f"Universalis returned {resp.status}"}

    return json.loads(resp.data.decode("utf-8"))


def get_world_market(world: str, item_id: int):
    return get_market_data(world, item_id)


def get_dc_worlds_market(dc_name: str, item_id: int):
    """We hardcode Crystal because Universalis no longer returns dcName."""
    if dc_name != "Crystal":
        return {}

    results = {}
    for world in CRYSTAL_WORLDS:
        data = get_world_market(world, item_id)
        if "error" not in data:
            results[world] = data

    return results
