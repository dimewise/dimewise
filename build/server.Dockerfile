# ── Stage 1: Build ──────────────────────────────────────────────
FROM golang:1.25 AS builder

WORKDIR /app

# Install goose for migrations (static binary for Alpine)
RUN CGO_ENABLED=0 go install github.com/pressly/goose/v3/cmd/goose@latest

# Cache dependencies
COPY server/go.mod server/go.sum ./
RUN go mod download

# Copy source and build
COPY server/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /dimewise ./cmd/server

# ── Stage 2: Runtime ───────────────────────────────────────────
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary
COPY --from=builder /dimewise /app/dimewise

# Copy goose binary for migrations
COPY --from=builder /go/bin/goose /usr/local/bin/goose

# Copy migration files
COPY server/migrations /app/migrations

# Copy entrypoint
COPY build/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
