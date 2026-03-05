# Stage 1: Build the SPA
FROM node:22-slim AS build

# Install Chromium dependencies for Puppeteer prerender
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# .env must exist at build time — NocoDB vars are baked into the JS bundle
RUN npm run build

# Stage 2: Runtime (nginx + Python for data fetches)
FROM nginx:stable-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    cron \
    && rm -rf /var/lib/apt/lists/*

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built SPA
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Copy Python fetch scripts and .env for runtime data updates
WORKDIR /app
COPY fetch-all.py fetch-matches.py fetch-members.py ./
COPY .env .env

# Scripts write to <script_dir>/dist/spa/ — symlink to nginx html dir
RUN mkdir -p /app/public /app/dist && ln -sf /usr/share/nginx/html /app/dist/spa

# Cron job: update data daily at midnight CET (23:00 UTC)
RUN echo "0 23 * * * cd /app && /usr/bin/python3 fetch-all.py >> /var/log/fetch-all.log 2>&1" \
    > /etc/cron.d/fetch-data \
    && chmod 0644 /etc/cron.d/fetch-data \
    && crontab /etc/cron.d/fetch-data

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
