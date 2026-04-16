# backend/services/profit.py

from typing import List, Dict, Any
from .universalis import get_market_data

# Hardcoded example list — safe to keep
PROFIT_ITEM_IDS = {
    "botanist": [
        12345,  # Spruce Log
        67890,  # Example item
    ]
}


def find_profitable_items(
    job: str,
    level: int,
    world: str,
    items_index: Dict[int, Dict[str, Any]],
) -> List[Dict[str, Any]]:
    ids = PROFIT_ITEM_IDS.get(job.lower(), [])
    results = []

    for item_id in ids:
        item = items_index.get(item_id)
        if not item:
            continue

        market = get_market_data(world, item_id)

        # Skip Universalis errors
        if not isinstance(market, dict) or "listings" not in market:
            continue

        listings = market.get("listings", [])
        if not listings:
            continue

        # Filter out invalid or zero-price listings
        valid_prices = [
            l["pricePerUnit"]
            for l in listings
            if isinstance(l.get("pricePerUnit"), (int, float)) and l["pricePerUnit"] > 0
        ]

        if not valid_prices:
            continue

        min_price = min(valid_prices)

        results.append({
            "itemId": item_id,
            "name": item.get("Name_en"),
            "minPrice": min_price,
            "numListings": len(listings),
        })

    # Sort by highest price (your original behavior)
    results.sort(key=lambda x: x["minPrice"], reverse=True)
    return results
