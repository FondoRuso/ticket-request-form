#!/usr/bin/env python3
import json
import os
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from urllib.request import urlopen, Request
from zoneinfo import ZoneInfo

MADRID_TZ = ZoneInfo("Europe/Madrid")

API_BASE = "https://publish.realmadrid.com/graphql/execute.json/realmadridmastersite"

TYPE_PREFIXES = [
    ("Fútbol · Primer Equipo · Femenino", "Primer Equipo · Femenino"),
    ("Fútbol · Primer Equipo", "Primer Equipo"),
    ("Fútbol · Cantera Femenina", "Cantera Femenina"),
    ("Fútbol · Cantera", "Cantera"),
]


def build_url():
    tomorrow = datetime.now(timezone.utc).date() + timedelta(days=1)
    # +2 months: same day, 2 months ahead
    month = tomorrow.month + 2
    year = tomorrow.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    day = min(tomorrow.day, [31,29 if year%4==0 and (year%100!=0 or year%400==0) else 28,31,30,31,30,31,31,30,31,30,31][month-1])
    to_date = tomorrow.replace(year=year, month=month, day=day)

    from_str = f"{tomorrow}T00:00:00.000Z"
    to_str = f"{to_date}T23:59:00.000Z"
    return (
        f"{API_BASE}/diaryV2"
        f"%3BfromDate={from_str}"
        f"%3BtoDate={to_str}"
        f"%3Balang=/content/dam/portals/realmadrid-com/es-es/sports/"
    )


def get_match_type(squad_label):
    for prefix, match_type in TYPE_PREFIXES:
        if squad_label.startswith(prefix):
            return match_type
    return None


def to_madrid_iso(dt_str):
    utc_dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    madrid_dt = utc_dt.astimezone(MADRID_TZ)
    return madrid_dt.isoformat()


HOME_VENUES = ("Bernabéu", "Alfredo Di Stéfano", "Ciudad Real Madrid")


def is_home_venue(venue_name):
    return any(v in venue_name for v in HOME_VENUES)


def parse_match(m):
    squad_label = m.get("squad", {}).get("squadLabel", "")
    if not squad_label.startswith("Fútbol"):
        return None
    if m.get("venue") is None:
        return None
    if m.get("hideMatchCalendar") is True:
        return None

    match_type = get_match_type(squad_label)
    if match_type is None:
        return None

    at_home = m["playAsHome"] or is_home_venue(m["venue"]["name"])
    return {
        "type": match_type,
        "team": m["homeTeam"]["name"],
        "vs": m["awayTeam"]["name"],
        "tournament": m["competition"]["name"],
        "stadium": m["venue"]["name"],
        "atHome": at_home,
        "isWomen": "Femenin" in match_type,
        "isCantera": "Cantera" in match_type,
        "date": to_madrid_iso(m["dateTime"]),
        "isDateConfirmed": m["isScheduled"],
    }


def main():
    url = build_url()
    try:
        with urlopen(Request(url), timeout=30) as resp:
            data = json.load(resp)
    except Exception as e:
        print(f"Error: Failed to fetch data from API: {e}", file=sys.stderr)
        sys.exit(1)

    items = data.get("data", {}).get("matchList", {}).get("items", [])
    matches = sorted(filter(None, map(parse_match, items)), key=lambda m: m["date"])

    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    output_file = os.path.join(public_dir, "data.json")

    fd, temp_path = tempfile.mkstemp(dir=public_dir, suffix=".json")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(matches, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(temp_path, output_file)
    except:
        os.unlink(temp_path)
        raise

    print(f"Saved {len(matches)} matches to {output_file}")


if __name__ == "__main__":
    main()
