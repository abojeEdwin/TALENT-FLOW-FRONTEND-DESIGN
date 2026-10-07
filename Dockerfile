# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM node:20-alpine AS deps

# Install libc compatibility for native modules (e.g. sharp)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files and install with frozen lockfile
COPY package.json package-lock.json* ./
RUN npm ci

# =============================================================================
# Stage 2: Build the application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source
COPY . .

# Build-time env vars (NEXT_PUBLIC_* are baked into the bundle at build time).
# Pass real values via --build-arg or override with a .env file at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api
ARG NEXT_PUBLIC_API_VERSION=v1
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
ARG NEXT_PUBLIC_APP_NAME=TrailForge
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL=300000
ARG NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
ARG NEXT_PUBLIC_ENABLE_WEBSOCKET=true

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_VERSION=$NEXT_PUBLIC_API_VERSION \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL=$NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL \
    NEXT_PUBLIC_ENABLE_DEBUG_MODE=$NEXT_PUBLIC_ENABLE_DEBUG_MODE \
    NEXT_PUBLIC_ENABLE_WEBSOCKET=$NEXT_PUBLIC_ENABLE_WEBSOCKET \
    # Disable Next.js telemetry during build
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# =============================================================================
# Stage 3: Production runtime (minimal image)
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Create a non-root user to run the app
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what the standalone output needs
COPY --from=builder /app/public ./public

# Set correct ownership for the .next directory
RUN mkdir .next && chown nextjs:nodejs .next

# standalone output contains a self-contained server + required node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Runtime env vars (server-side only — NOT baked in at build time)
# Pass these at `docker run` time or via your orchestrator's secret/env injection:
#   NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL, JWT_SECRET, etc.

CMD ["node", "server.js"]
