# Stage 1: Build the SPA
FROM node:24-slim AS build

# Install Chromium dependencies for Puppeteer prerender
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# pnpm-workspace.yaml carries onlyBuiltDependencies, so it belongs in the
# install layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g "$(node -p 'require("./package.json").packageManager')"

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
