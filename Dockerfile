# Multi-stage Dockerfile for Next.js application
# Optimized for both local development and production deployment

# Base stage with common dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache libc6-compat dumb-init

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile --prod=false

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create .env.local with placeholder values for build
# These will be overridden at runtime
RUN echo "NEXT_PUBLIC_SUPABASE_URL=placeholder" > .env.local && \
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder" >> .env.local && \
    echo "SUPABASE_SERVICE_ROLE_KEY=placeholder" >> .env.local && \
    echo "NEXT_PUBLIC_SITE_URL=placeholder" >> .env.local

# Build the application
RUN pnpm build

# Production runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create necessary directories with proper permissions
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
