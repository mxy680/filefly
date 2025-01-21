# -------------------------
# 1) Builder Stage
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace and server-specific package files
COPY pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies for the server
RUN pnpm install --frozen-lockfile

# Copy server source code
COPY apps/server ./apps/server

# Copy Prisma schema
COPY packages/prisma/prisma ./packages/prisma/prisma

# Set working directory to the server context
WORKDIR /app/apps/server

# Generate Prisma Client
RUN pnpx prisma generate --schema=../../packages/prisma/prisma/schemajs.prisma

# Build the application
RUN pnpm build

# -------------------------
# 2) Runner (Production) Stage
# -------------------------
FROM node:18-alpine AS runner

# Copy compiled dist, dependencies, and package.json
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./

# Expose application port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]