#!/usr/bin/env python3
import json
import os
import shutil
import sys
import tempfile
from urllib.parse import urlencode, quote
from urllib.request import urlopen, Request


def load_env(path=".env"):
    """Load .env file into os.environ (simple key=value parser)."""
    if not os.path.isfile(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())


def fetch_all_records(base_url, token, table_id, view_id):
    field_name = "Фамилия Имя"
    page_size = 200
    records = []
    offset = 0

    while True:
        params = {
            "viewId": view_id,
            "fields": f"Id,{field_name}",
            "limit": str(page_size),
            "offset": str(offset),
        }

        url = f"{base_url}/api/v2/tables/{table_id}/records?{urlencode(params, quote_via=quote)}"
        req = Request(url, headers={"xc-token": token})

        try:
            with urlopen(req, timeout=30) as resp:
                data = json.load(resp)
        except Exception as e:
            print(f"Error: Failed to fetch data from NocoDB: {e}", file=sys.stderr)
            sys.exit(1)

        for row in data.get("list", []):
            name = row.get(field_name, "").strip()
            row_id = row.get("Id")
            if name and row_id is not None:
                records.append({"id": row_id, "name": name})

        page_info = data.get("pageInfo", {})
        if page_info.get("isLastPage", True):
            break
        offset += page_size

    return records


def main():
    load_env()

    base_url = os.environ.get("NOCODB_API_URL", "").rstrip("/")
    token = os.environ.get("NOCODB_API_TOKEN", "")
    table_id = os.environ.get("NOCODB_MEMBERS_TABLE_ID", "")
    view_id = os.environ.get("NOCODB_MEMBERS_VIEW_ID", "")

    if not all([base_url, token, table_id, view_id]):
        print(
            "Error: Missing env variables. Need NOCODB_API_URL, NOCODB_API_TOKEN, "
            "NOCODB_MEMBERS_TABLE_ID, NOCODB_MEMBERS_VIEW_ID",
            file=sys.stderr,
        )
        sys.exit(1)

    members = fetch_all_records(base_url, token, table_id, view_id)
    members.sort(key=lambda m: m["name"])

    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    output_file = os.path.join(public_dir, "members.json")

    fd, temp_path = tempfile.mkstemp(dir=public_dir, suffix=".json")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(members, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(temp_path, output_file)
        os.chmod(output_file, 0o644)
    except:
        os.unlink(temp_path)
        raise

    dist_file = os.path.join(script_dir, "dist", "spa", "members.json")
    if os.path.isdir(os.path.dirname(dist_file)):
        shutil.copy2(output_file, dist_file)

    print(f"Saved {len(members)} members to {output_file}")


if __name__ == "__main__":
    main()
