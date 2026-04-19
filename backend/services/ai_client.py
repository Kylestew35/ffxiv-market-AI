# backend/services/ai_client.py

import json
import urllib3

http = urllib3.PoolManager()

AI_ENDPOINT = "https://u6c5u3omfh.execute-api.us-east-1.amazonaws.com/prod/chat-ai"


def generate_item_insight(payload: dict) -> str:
    item = payload.get("item", {})
    item_name = item.get("Name_en", "Unknown Item")
    current_world = payload.get("currentWorld", "Unknown")

    market_summary = payload.get("marketSummary", {})
    world_summaries = payload.get("worldSummaries", {})

    world_lines = []
    for world, summary in world_summaries.items():
        world_lines.append(
            f"- {world}: NQ {summary.get('minNQ')} gil, HQ {summary.get('minHQ')} gil, Listings {summary.get('numListings')}"
        )

    world_block = "\n".join(world_lines)

    prompt = f"""
You are an FFXIV marketboard expert.

Item: {item_name}
Current World: {current_world}

Current World Prices:
- NQ: {market_summary.get('minNQ')}
- HQ: {market_summary.get('minHQ')}
- Listings: {market_summary.get('numListings')}

All World Prices:
{world_block}

Using this data, provide:

1. Best world to buy from and why
2. Exact gil savings if traveling
3. Whether HQ matters for this item
4. Crafting and gathering tips
5. Market behavior and flipping potential
6. Profit strategies
7. A final recommendation
"""

    try:
        res = http.request(
            "POST",
            AI_ENDPOINT,
            headers={"Content-Type": "application/json"},
            body=json.dumps({"question": prompt}),
            timeout=10,
        )

        if res.status != 200:
            return f"AI service error ({res.status})."

        data = json.loads(res.data.decode("utf-8"))
        return data.get("answer", "No AI insight available.")

    except Exception as e:
        return f"AI request failed: {e}"
