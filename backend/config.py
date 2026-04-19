# backend/config.py

# -----------------------------
# S3 CONFIG
# -----------------------------
S3_BUCKET = "ffxiv-data-bucket"

ITEMS_KEY = "items.json"
ACTIONS_KEY = "actions.json"
JOBS_KEY = "jobs.json"
QUESTS_KEY = "quests.json"
SEARCH_KEY = "search.json"

# -----------------------------
# UNIVERSALIS API CONFIG
# -----------------------------
UNIVERSALIS_BASE_URL = "https://universalis.app/api/v2"

# -----------------------------
# RECOMMENDATION ENGINE CONSTANTS
# -----------------------------
PRICE_DIFF_TRAVEL_THRESHOLD = 0.15   # 15%
MIN_SAVINGS_GIL = 500
MAX_LISTINGS_TO_CONSIDER = 20
DC_PRICE_WEIGHT = 0.6
WORLD_PRICE_WEIGHT = 0.4
