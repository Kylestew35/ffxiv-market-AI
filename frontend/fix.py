import json
from pathlib import Path

def extract_names_to_json(input_file: str = "items.json", output_file: str = "item_names.json"):
    """
    Reads a JSON file containing items with "Name_en" and saves only the names as a clean list.
    """
    input_path = Path(input_file)
    output_path = Path(output_file)

    if not input_path.exists():
        print(f"❌ Error: File '{input_file}' not found!")
        return

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Handle both single object and array of objects
        if isinstance(data, dict):
            data = [data]  # convert single object to list

        # Extract Name_en
        names = []
        for item in data:
            if isinstance(item, dict):
                name = item.get("Name_en") or item.get("name") or item.get("Name")
                if name:
                    names.append(name.strip())

        # Remove duplicates while preserving order
        unique_names = list(dict.fromkeys(names))

        # Save as clean JSON array
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(unique_names, f, indent=2, ensure_ascii=False)

        print(f"✅ Success! Extracted {len(unique_names)} item names")
        print(f"   Saved to: {output_path}")
        print(f"   Preview: {unique_names[:5]}...")

    except json.JSONDecodeError:
        print("❌ Error: Invalid JSON format in input file")
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    # You can change these filenames if needed
    extract_names_to_json("items.json", "item_names.json")
    
    # Optional: One-liner version for quick use
    # extract_names_to_json("your_input_file.json", "clean_names.json")