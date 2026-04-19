import asyncio
import aiohttp
import json
import os
from typing import Dict, Tuple, Optional, List

BASE = "https://www.garlandtools.org/db/doc"
OUT_DIR = "garland_dump"

# Max ID to ever try
MAX_ID = 44000

# How many invalid IDs in a row before we assume the category is done
STOP_AFTER_N_INVALID = 500

# How many concurrent requests per category
CONCURRENCY = 32

CATEGORIES: Dict[str, str] = {
    "items": "item",
    "nodes": "node",
    "quests": "quest",
    "npcs": "npc",
    "fates": "fate",
    "maps": "map",
    "fishing": "fishing",
    "leves": "leve",
    "mobs": "mob",
    "achievements": "achievement",
    "actions": "action",
    "statuses": "status",
    "weather": "weather",
    "jobs": "job",
}


def ensure_dirs():
    os.makedirs(OUT_DIR, exist_ok=True)
    for folder in CATEGORIES.keys():
        os.makedirs(os.path.join(OUT_DIR, folder), exist_ok=True)


def get_resume_start_id(cat_name: str) -> int:
    out_path = os.path.join(OUT_DIR, cat_name)
    existing_ids = [
        int(f.split(".")[0])
        for f in os.listdir(out_path)
        if f.endswith(".json") and f.split(".")[0].isdigit()
    ]
    if not existing_ids:
        return 1
    return max(existing_ids) + 1


async def fetch_one(
    session: aiohttp.ClientSession,
    cat_key: str,
    id: int,
) -> Tuple[int, Optional[Dict]]:
    url = f"{BASE}/{cat_key}/en/3/{id}.json"
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
            if resp.status != 200:
                return id, None
            text = await resp.text()
            data = json.loads(text)
            if data == 0:
                return id, None
            return id, data
    except Exception:
        return id, None


async def worker(
    name: str,
    cat_key: str,
    session: aiohttp.ClientSession,
    queue: "asyncio.Queue[int]",
    out_path: str,
    state: Dict[str, int],
):
    """
    Worker:
      - pulls IDs from queue
      - fetches
      - writes valid JSON
      - updates state: valid_count, invalid_streak
    """
    while True:
        try:
            id = await queue.get()
        except asyncio.CancelledError:
            return

        if id is None:
            queue.task_done()
            return

        id, data = await fetch_one(session, cat_key, id)

        if data:
            state["invalid_streak"] = 0
            state["valid_count"] += 1
            out_file = os.path.join(out_path, f"{id}.json")
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✔ {name} {id}")
        else:
            state["invalid_streak"] += 1
            print(f"✖ {name} {id}")

        queue.task_done()


async def ingest_category(name: str, cat_key: str):
    print(f"\n=== Ingesting {name} ===")
    out_path = os.path.join(OUT_DIR, name)
    os.makedirs(out_path, exist_ok=True)

    start_id = get_resume_start_id(name)
    print(f"Resuming {name} at ID {start_id}")

    queue: asyncio.Queue[int] = asyncio.Queue()
    state = {
        "invalid_streak": 0,
        "valid_count": len(
            [
                f
                for f in os.listdir(out_path)
                if f.endswith(".json") and f.split(".")[0].isdigit()
            ]
        ),
    }

    async with aiohttp.ClientSession() as session:
        # Start workers
        workers: List[asyncio.Task] = []
        for _ in range(CONCURRENCY):
            task = asyncio.create_task(
                worker(name, cat_key, session, queue, out_path, state)
            )
            workers.append(task)

        # Feed IDs
        for id in range(start_id, MAX_ID + 1):
            # Auto-stop if too many invalid in a row
            if state["invalid_streak"] >= STOP_AFTER_N_INVALID:
                print(
                    f"\nStopping {name}: {state['invalid_streak']} invalid IDs in a row."
                )
                break

            await queue.put(id)

        # Signal workers to exit
        for _ in workers:
            await queue.put(None)

        await queue.join()

        for w in workers:
            w.cancel()
        await asyncio.gather(*workers, return_exceptions=True)

    print(f"Finished {name}: {state['valid_count']} valid entries")


async def main_async():
    ensure_dirs()
    for folder, key in CATEGORIES.items():
        await ingest_category(folder, key)
    print("\n=== COMPLETE: All Garland doc endpoints ingested ===")


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
