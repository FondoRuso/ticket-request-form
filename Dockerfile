# Stage 1: Build the SPA
FROM node:24-slim AS build

# Install Chromium dependencies for Puppeteer prerender
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# PUPPETEER_SKIP_CHROMIUM_DOWNLOAD is dead in puppeteer 24 — the current name is
# PUPPETEER_SKIP_DOWNLOAD. The executable path alone already implies it.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Keep in sync with package.json#packageManager. Corepack would read that field
# on its own, but it is being unbundled from Node and trips on signature checks.
RUN npm install -g pnpm@10.28.2

WORKDIR /app

# pnpm-workspace.yaml carries onlyBuiltDependencies, so it belongs in the
# install layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# pnpm only implies --frozen-lockfile when CI=true, which Docker is not.
RUN pnpm install --frozen-lockfile

COPY . .

# .env must exist at build time — env vars are baked into the JS bundle
RUN pnpm run build

# Stage 2: Runtime (nginx)
FROM nginx:stable-bookworm

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built SPA
COPY --from=build /app/dist/spa /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
