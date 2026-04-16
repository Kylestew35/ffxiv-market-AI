# backend/handler.py

import json
import traceback
from typing import Dict, Any

from services.s3_items import load_items, search_items
from services.universalis import get_market_data
from services.recommendations import build_recommendations
from services.profit import find_profitable_items

_items_index: Dict[int, Dict[str, Any]] | None = None


def _ensure_items_index():
    global _items_index
    if _items_index is not None:
        return _items_index

    try:
        items = load_items()
        _items_index = {int(item["ID"]): item for item in items}
        return _items_index
    except Exception as e:
        print("ERROR loading items:", e)
        traceback.print_exc()
        raise


def _response(status: int, body: Any) -> Dict[str, Any]:
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        "body": json.dumps(body),
    }


def handler(event, context):
    print("EVENT:", json.dumps(event))

    raw_path = event.get("rawPath", "")
    http_method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    qs = event.get("queryStringParameters") or {}

    try:
        if raw_path.endswith("/search") and http_method == "GET":
            return handle_search(qs)

        if raw_path.endswith("/market") and http_method == "GET":
            return handle_market(qs)

        if raw_path.endswith("/profit") and http_method == "GET":
            return handle_profit(qs)

        return _response(404, {"error": "Not found"})

    except Exception as e:
        print("ERROR in handler:", e)
        traceback.print_exc()
        return _response(500, {"error": str(e)})


def handle_search(qs):
    query = qs.get("q") or ""
    if not query:
        return _response(400, {"error": "Missing q"})

    try:
        results = search_items(query)
    except Exception as e:
        print("ERROR in search_items:", e)
        traceback.print_exc()
        return _response(500, {"error": "search_items failed"})

    payload = [
        {"id": int(item["ID"]), "name": item.get("Name_en")}
        for item in results
    ]

    return _response(200, {"items": payload})


def handle_market(qs):
    world = qs.get("world")
    item_id = qs.get("itemId")

    if not world or not item_id:
        return _response(400, {"error": "Missing world or itemId"})

    item_id_int = int(item_id)
    items_index = _ensure_items_index()
    item = items_index.get(item_id_int)

    if not item:
        return _response(404, {"error": "Item not found"})

    market = get_market_data(world, item_id_int)

    if "error" in market:
        return _response(502, {"error": market["error"]})

    rec = build_recommendations(world, item, market)

    return _response(200, rec)


def handle_profit(qs):
    world = qs.get("world")
    job = qs.get("job")
    level = qs.get("level")

    if not world or not job or not level:
        return _response(400, {"error": "Missing world, job, or level"})

    level_int = int(level)
    items_index = _ensure_items_index()

    results = find_profitable_items(job, level_int, world, items_index)
    return _response(200, {"results": results})
