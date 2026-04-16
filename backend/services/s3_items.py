# backend/services/s3_items.py

import json
import boto3
from typing import List, Dict
from config import S3_BUCKET, ITEMS_KEY

_s3 = boto3.client("s3")
_items_cache: List[Dict] | None = None


def load_items() -> List[Dict]:
    """
    Loads items.json from S3 once and caches it.
    Safe against malformed JSON or missing keys.
    """
    global _items_cache
    if _items_cache is not None:
        return _items_cache

    obj = _s3.get_object(Bucket=S3_BUCKET, Key=ITEMS_KEY)
    raw = obj["Body"].read().decode("utf-8")

    try:
        data = json.loads(raw)
        if not isinstance(data, list):
            raise ValueError("items.json must be a list of item objects")
        _items_cache = data
    except Exception as e:
        print("ERROR parsing items.json:", e)
        _items_cache = []

    return _items_cache


def search_items(query: str, limit: int = 50) -> List[Dict]:
    """
    Case-insensitive substring search across Name_en and Name.
    """
    items = load_items()
    q = query.lower().strip()

    if not q:
        return []

    results = []
    for item in items:
        name_en = (item.get("Name_en") or "").lower()
        name = (item.get("Name") or "").lower()

        if q in name_en or q in name:
            results.append(item)

        if len(results) >= limit:
            break

    return results
