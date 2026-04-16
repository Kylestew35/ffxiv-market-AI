# backend/services/recommendations.py

from typing import Dict, Any, List
from config import (
    PRICE_DIFF_TRAVEL_THRESHOLD,
    MIN_SAVINGS_GIL,
    MAX_LISTINGS_TO_CONSIDER,
)
from services.universalis import get_dc_worlds_market
from services.ai_client import generate_item_insight


def normalize_hq(value):
    return bool(value)


def summarize_world(market: Dict[str, Any]) -> Dict[str, Any]:
    listings = market.get("listings", []) or []
    listings = listings[:MAX_LISTINGS_TO_CONSIDER]

    nq = []
    hq = []

    for l in listings:
        price = l.get("pricePerUnit")
        if price is None:
            continue

        if normalize_hq(l.get("hq")):
            hq.append(price)
        else:
            nq.append(price)

    return {
        "minNQ": min(nq) if nq else None,
        "minHQ": min(hq) if hq else None,
        "numListings": len(listings),
    }


def build_recommendations(
    current_world: str,
    item: Dict[str, Any],
    market: Dict[str, Any],
) -> Dict[str, Any]:

    current_summary = summarize_world(market)

    # 🔥 FIX: Hardcode Crystal DC
    dc_name = "Crystal"

    # Fetch all worlds in the DC
    dc_worlds = get_dc_worlds_market(dc_name, int(item["ID"]))

    world_summaries = {
        world: summarize_world(data)
        for world, data in dc_worlds.items()
    }

    # Find best world
    best_world = None
    best_price = None

    for world, summary in world_summaries.items():
        if world == current_world:
            continue

        price = summary.get("minNQ")
        if price is None:
            continue

        if best_price is None or price < best_price:
            best_price = price
            best_world = world

    options: List[Dict[str, Any]] = []

    options.append({
        "id": "stay",
        "label": "Buy on your current world",
        "world": current_world,
        "minNQ": current_summary["minNQ"],
        "minHQ": current_summary["minHQ"],
        "reason": "Fastest and simplest option.",
    })

    if (
        best_world
        and best_price is not None
        and current_summary["minNQ"] is not None
    ):
        diff_ratio = (current_summary["minNQ"] - best_price) / current_summary["minNQ"]
        savings = current_summary["minNQ"] - best_price

        if diff_ratio >= PRICE_DIFF_TRAVEL_THRESHOLD and savings >= MIN_SAVINGS_GIL:
            options.append({
                "id": "travel",
                "label": f"Travel to {best_world}",
                "world": best_world,
                "minNQ": best_price,
                "reason": (
                    f"{best_world} is cheaper by {int(diff_ratio * 100)}% "
                    f"({savings} gil savings)."
                ),
            })

    options.append({
        "id": "craft",
        "label": "Craft or gather it yourself",
        "reason": "Market prices are elevated or volatile.",
    })

    ai_payload = {
        "item": item,
        "currentWorld": current_world,
        "marketSummary": current_summary,
        "worldSummaries": world_summaries,
        "options": options,
    }

    aiInsight = generate_item_insight(ai_payload)

    return {
        "item": {
            "id": item["ID"],
            "name": item.get("Name_en"),
        },
        "currentWorld": current_world,
        "marketSummary": current_summary,
        "worldSummaries": world_summaries,
        "options": options,
        "aiInsight": aiInsight,
    }
