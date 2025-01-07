# -------------------------
# 1) Builder Stage
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl && ln -s /usr/lib/libssl.so.1.1 /usr/lib/libssl.so || true

# Copy workspace and server-specific package files
COPY pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies for the server
RUN pnpm install --frozen-lockfile

# Copy server source code
COPY apps/server ./apps/server

# Copy additional directories for tasks, providers, and database
COPY packages/rabbitmq/producer ./apps/server/src/producer
COPY packages/database/ts/postgres ./apps/server/src/database
COPY packages/providers/ts ./apps/server/src/providers

# Copy Prisma schema
COPY packages/prisma/prisma ./packages/database/prisma

# Set working directory to the server context
WORKDIR /app/apps/server

# Validate the Prisma schema
RUN pnpx prisma validate --schema=../../packages/database/prisma/schemajs.prisma

# Generate Prisma Client
RUN pnpx prisma generate --schema=../../packages/database/prisma/schemajs.prisma

# Build the application
RUN pnpm run build

# -------------------------
# 2) Runner (Production) Stage
# -------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl && ln -s /usr/lib/libssl.so.1.1 /usr/lib/libssl.so || true

# Copy compiled dist, dependencies, and package.json
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./

# Expose application port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
