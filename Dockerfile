# Use Node.js LTS version as the base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm in builder stage
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Set build-time environment variables required for Next.js to build
# RESEND_API_KEY is now provided securely at runtime, e.g.: docker run -e RESEND_API_KEY=your_key
# Add any other required public runtime envs for build as needed
ENV NEXT_PUBLIC_SITE_URL="https://www.nepalreforms.com"
ENV NEXT_PUBLIC_SUPABASE_URL="https://nokrhvgrfcletinhsalt.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5va3JodmdyZmNsZXRpbmhzYWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTI0NzMsImV4cCI6MjA3MzE2ODQ3M30.1TUEt1q-JTXHAHZINCavbnH_X0TxyDu49Q2QzdogZmE"

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for the port
ENV PORT 3000

# Start the application
CMD ["node", "server.js"]