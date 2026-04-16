import requests
import json

all_items = []

for page in range(1, 445):  # XIVAPI has ~444 pages
    url = f"https://xivapi.com/Item?page={page}"
    print("Fetching", url)
    resp = requests.get(url).json()

    results = resp.get("Results", [])
    for item in results:
        all_items.append({
            "ID": item.get("ID"),
            "Name_en": item.get("Name"),
            "Icon": item.get("Icon"),
            "ItemUICategory": item.get("ItemUICategory"),
            "Level": item.get("LevelItem"),
        })

with open("items.json", "w") as f:
    json.dump(all_items, f, indent=2)

print("Done. Total items:", len(all_items))
