# Ticket Request Form

A web application for [Fondo Ruso](https://fondoruso.ru) fan club members to request tickets for Real Madrid matches. Built with Vue 3 and Quasar, it uses NocoDB as the backend for member management and ticket request tracking.

## Key Features

- **Match schedule** fetched from the official Real Madrid API via an external service (next 2 months)
- **Member autocomplete** from NocoDB member database
- **Deadline warnings** for late submissions
- **Ticket category selection** for home first-team matches
- **Form persistence** via `localStorage` across sessions
- **Prerendered HTML** for fast initial load
- **Dark mode** with auto-detection
- **All times in Madrid timezone** (Europe/Madrid)

## Tech Stack

Vue 3, Quasar 2, Pinia, TypeScript, Vite, Puppeteer (prerender), NocoDB (backend)

## Environment Variables

Copy dotenv file example and fill in the values:

```bash
cp .env.example .env
nano .env
```

These variables are **baked into the JS bundle at build time**.

| Variable | Description |
|---|---|
| `NOCODB_API_URL` | NocoDB instance URL |
| `NOCODB_REQUESTS_FORM_PUBLIC_UUID` | Public UUID of the ticket request form |
| `NOCODB_REQUESTS_VIEW_URL` | URL to view submitted requests |
| `DATA_BASE_URL` | Base URL for `matches.json` and `members.json` (e.g. `https://example.workers.dev`) |

`matches.json` and `members.json` are fetched from `DATA_BASE_URL` at runtime and are maintained by a separate data service.

## Deployment with Docker

### Build and Run

```bash
# Make sure .env is configured
docker build -t ticket-form .
docker run -d -p 8080:80 --name ticket-form ticket-form
```

The app will be available at `http://localhost:8080`.

## Local Development

```bash
npm install
npm run dev # start dev server with hot reload
```

## Production Build (without Docker)

```bash
npm run build # builds SPA + prerenders index.html
```

Output is in `dist/spa/`. Serve with any web server that supports SPA history-mode fallback (e.g., nginx with `try_files $uri $uri/ /index.html`).
