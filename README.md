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
- **Privacy-preserving analytics** via a self-hosted OpenPanel instance

## Tech Stack

Vue 3, Quasar 2, Pinia, TypeScript, Vite, Puppeteer (prerender), NocoDB (backend)

## Environment Variables

Copy dotenv file example and fill in the values:

```bash
cp .env.example .env
nano .env
```

These variables are **baked into the JS bundle at build time**.

| Variable                           | Description                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `NOCODB_API_URL`                   | NocoDB instance URL                                                                 |
| `NOCODB_REQUESTS_FORM_PUBLIC_UUID` | Public UUID of the ticket request form                                              |
| `NOCODB_REQUESTS_VIEW_URL`         | URL to view submitted requests                                                      |
| `DATA_BASE_URL`                    | Base URL for `matches.json` and `members.json` (e.g. `https://example.workers.dev`) |
| `OPENPANEL_API_URL`                | OpenPanel **API** origin                                                            |
| `OPENPANEL_CLIENT_ID`              | OpenPanel client ID. Leave empty to disable analytics                               |

`matches.json` and `members.json` are fetched from `DATA_BASE_URL` at runtime and are maintained by a separate data service.

## Analytics

Usage is tracked with [OpenPanel](https://openpanel.dev) on a self-hosted instance. The event catalogue lives in [`src/utils/analytics.ts`](src/utils/analytics.ts) as a typed map — adding an event means adding it there first.

**No personal data is ever sent.** Events carry only choices and outcomes: which match was picked, whether the deadline warning appeared, which required fields were left empty (names only, never values). Names, phone numbers, emails, birth dates and document numbers stay between the browser and NocoDB.

The guarantees that keep it that way:

- **No `identify()`** — visitors stay anonymous. OpenPanel's device id is a server-side hash that rotates daily, so cross-day retention charts are not meaningful here. Everything worth measuring is within a session.
- **No session replay** — it records the DOM, and this form has passport numbers in it.
- **Manual screen views** — automatic ones report `window.location.href`, and OpenPanel explodes every query parameter into a stored property. The router sends `to.path` instead.
- **No client secret in the bundle** — the browser authenticates with the client id plus an origin allowlist. A secret shipped to the browser is world-readable, and OpenPanel also treats its presence as proof of server-side traffic and switches off bot filtering.
- **Nothing during prerender** — `prerender.js` sets `window.__PRERENDER__`, and the SDK is not constructed when it is set (with `navigator.webdriver` as a fallback).

## Production Deployment

The production site is hosted on Yandex Object Storage (static website hosting). A GitHub Actions workflow (`.github/workflows/deploy-yandex.yml`) deploys on every push to `dev`. Manual runs are available via the **Run workflow** button in the Actions tab.

### Required GitHub Secrets

Add the [environment variables](#environment-variables) above as GitHub Secrets with identical names, plus Yandex Cloud credentials — an S3-compatible static key of a service account with the `storage.editor` role on the bucket:

| Secret                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `YC_ACCESS_KEY_ID`     | Key ID from IAM → service account → access keys |
| `YC_SECRET_ACCESS_KEY` | Secret part, shown only once at creation        |
| `YC_BUCKET_NAME`       | Bucket name; **must match the public domain**   |

### Cache strategy

The workflow uploads files in three passes with different `Cache-Control` headers:

- `assets/*` (Vite-hashed JS/CSS/fonts) — `public, max-age=31536000, immutable`
- Other static files (`favicon.ico`, `icons/`, `logo.svg`) — `public, max-age=3600`
- `index.html` — `no-cache, must-revalidate` (so new deploys land immediately)

## Deployment with Docker

### Build and Run

```bash
# Make sure .env is configured
docker build -t ticket-form .
docker run -d -p 8080:80 --name ticket-form ticket-form
```

The app will be available at `http://localhost:8080`.

## Local Development

Requires Node >= 22.18 and [pnpm](https://pnpm.io) 10 (`corepack enable pnpm`
picks up the version pinned in `package.json`). Do not use npm here — it would
write a second lock file next to `pnpm-lock.yaml`.

```bash
pnpm install
pnpm run dev # start dev server with hot reload
```

Code style, linting, and formatting come from
[`@govnotech/conventions`](https://www.npmjs.com/package/@govnotech/conventions):

```bash
pnpm run check # Oxfmt, Oxlint and ESLint
pnpm run fix   # apply what they can fix on their own
```

## Production Build (without Docker)

```bash
pnpm run build # builds SPA + prerenders index.html
```

The prerender step drives Chromium, which arrives through Puppeteer's
postinstall — allowed for that one package in `pnpm-workspace.yaml`. pnpm caches
build side effects globally, so an install can come back green having skipped
that postinstall and left no browser behind. If the build fails with
`Could not find Chrome`, install it directly:

```bash
pnpm exec puppeteer browsers install chrome
```

Output is in `dist/spa/`. Serve with any web server that supports SPA history-mode fallback (e.g., nginx with `try_files $uri $uri/ /index.html`).
