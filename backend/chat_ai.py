# backend/services/chat_ai.py

import json
import boto3
from typing import Dict, Any, Optional

bedrock = boto3.client("bedrock-runtime")


def generate_item_insight(
    item: Dict[str, Any],
    current_world: str,
    market_summary: Dict[str, Any],
    world_summaries: Dict[str, Dict[str, Any]],
    options: list[Dict[str, Any]],
) -> str:
    """
    Calls Claude with full market data and asks for:
    - Best world to buy
    - Price comparisons
    - HQ/NQ analysis
    - Crafting tips
    - Gathering locations
    - Market behavior
    - Profit strategies
    - Travel recommendation
    """
    item_name = item.get("Name_en") or str(item.get("ID"))

    prompt = f"""
You are an FFXIV marketboard expert and crafter/gatherer theorycrafter.

You are given:
- A specific item
- The player's current world
- Market summary for the current world
- Per-world summaries for all worlds in the data center
- Simple recommendation options (stay, travel, craft)

Your job:
1. Analyze the prices across all worlds.
2. Identify the best world to buy from and why.
3. Comment on HQ vs NQ relevance for this item.
4. Give crafting and gathering tips for this item (where to get it, what jobs/levels, any notable uses).
5. Explain market behavior and profit strategies (when to buy, when to sell, flipping potential).
6. Give a clear travel recommendation if another world is meaningfully cheaper.
7. Keep the answer focused, practical, and in 2–4 short paragraphs plus a concise bullet list of tips.

Item:
- ID: {item.get("ID")}
- Name: {item_name}

Current world: {current_world}

Current world market summary (approx):
- Min NQ: {market_summary.get("minNQ")}
- Min HQ: {market_summary.get("minHQ")}
- Listings: {market_summary.get("numListings")}

Per-world summaries in DC (min NQ/HQ, listings):
{json.dumps(world_summaries, indent=2)}

Raw recommendation options (for context):
{json.dumps(options, indent=2)}

Now, write a single, cohesive explanation for the player. Do NOT restate the raw JSON.
Focus on what they should actually do and why.
"""

    ai_res = bedrock.invoke_model(
        modelId="anthropic.claude-3-haiku-20240307-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })
    )

    parsed = json.loads(ai_res["body"].read())
    text = parsed["content"][0]["text"]
    return text.strip()


# Existing chat handler (unchanged, still available if you use it elsewhere)
def handler(event, context):
    body = json.loads(event.get("body", "{}"))
    question = body.get("question", "")

    if not question:
        return _response(400, {"error": "Missing question"})

    prompt = f"""
You are an FFXIV marketboard expert. Answer the user's question clearly and concisely.

User question:
{question}
"""

    ai_res = bedrock.invoke_model(
        modelId="anthropic.claude-3-haiku-20240307-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })
    )

    ai_text = json.loads(ai_res["body"].read())["content"][0]["text"]

    return _response(200, {"answer": ai_text})


def _response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }
