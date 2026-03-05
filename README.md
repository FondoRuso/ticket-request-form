# Ticket Request Form

A web application for [Fondo Ruso](https://fondoruso.ru) fan club members to request tickets for Real Madrid matches. Built with Vue 3 and Quasar, it uses NocoDB as the backend for member management and ticket request tracking.

## Key Features

- **Match schedule** fetched from the official Real Madrid API (next 2 months)
- **Member autocomplete** from NocoDB member database
- **Deadline warnings** for late submissions
- **Ticket category selection** for home first-team matches
- **Form persistence** via `localStorage` across sessions
- **Prerendered HTML** for fast initial load
- **Dark mode** with auto-detection
- **All times in Madrid timezone** (Europe/Madrid)

## Tech Stack

Vue 3, Quasar 2, Pinia, TypeScript, Vite, Puppeteer (prerender), Python 3 (data fetching), NocoDB (backend)

## Environment Variables

Copy dotenv file example and fill in the values:

```bash
cp .env.example .env
nano .env
```

These variables are **baked into the JS bundle at build time** (used by the frontend to submit forms and link to the requests view).
They are also used at **runtime** by `fetch-members.py` to pull member data from NocoDB.

## Deployment with Docker

### Build and Run

```bash
# Make sure .env is configured
docker build -t ticket-form .
docker run -d -p 8080:80 --name ticket-form ticket-form
```

The app will be available at `http://localhost:8080`.

### What Happens at Startup

1. `fetch-all.py` runs to pull fresh match and member data
2. Cron daemon starts (updates data daily at 23:00 UTC / midnight CET)
3. Nginx serves the prerendered SPA

### Data Updates

The container includes a built-in cron job — no extra setup needed. It runs `fetch-all.py` daily at midnight CET, which:

- Fetches upcoming matches from the Real Madrid API (`fetch-matches.py`)
- Fetches the member list from NocoDB (`fetch-members.py`)
- Writes `matches.json` and `members.json` to the served directory

Logs are written to `/var/log/fetch-all.log` inside the container.

To trigger a manual update:

```bash
docker exec ticket-form python3 /app/fetch-all.py
```

## Local Development

```bash
npm install
python3 fetch-all.py   # fetch initial data
npm run dev             # start dev server with hot reload
```

## Production Build (without Docker)

```bash
npm run build           # builds SPA + prerenders index.html
```

Output is in `dist/spa/`. Serve with any web server that supports SPA history-mode fallback (e.g., nginx with `try_files $uri $uri/ /index.html`).

You will need to set up a cron job manually to keep data fresh:

```cron
0 23 * * * cd /path/to/ticket-request-form && python3 fetch-all.py >> /var/log/fetch-all.log 2>&1
```
