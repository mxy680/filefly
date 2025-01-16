# Base image
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Copy server-specific files
COPY apps/server/package.json apps/server/ ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/server ./apps/server
COPY packages/weaviate-ts ./packages/weaviate-ts
COPY packages/postgres-ts ./packages/postgres-ts
COPY packages/prisma ./packages/prisma

# Generate Prisma Client using the correct schema
RUN pnpx prisma generate --schema=./packages/prisma/prisma/schemajs.prisma

# Build the workspace
RUN pnpm --filter=weaviate-ts build
RUN pnpm --filter=postgres-ts build
RUN pnpm --filter=server build

# Runner stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy compiled server app and dependencies
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./

# Expose the application port
EXPOSE 4000

CMD ["node", "dist/main.js"]