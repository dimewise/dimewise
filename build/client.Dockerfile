# ── Stage 1: Build ──────────────────────────────────────────────
FROM oven/bun:1.3 AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY client/package.json client/bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY client/ ./
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN bun run build

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# SPA-friendly nginx config
COPY build/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
