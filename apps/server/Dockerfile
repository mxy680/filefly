# -------------------------
# 1) Builder Stage
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies and OpenSSL
RUN apk add --no-cache openssl && ln -s /usr/lib/libssl.so.1.1 /usr/lib/libssl.so || true

# Copy package.json and pnpm-lock.yaml
COPY ./package.json ./pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the entire application code (including Prisma schema)
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN pnpm run build

# -------------------------
# 2) Runner (Production) Stage
# -------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl && ln -s /usr/lib/libssl.so.1.1 /usr/lib/libssl.so || true

# Copy the compiled application
COPY --from=builder /app/dist ./dist

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json for runtime dependencies
COPY --from=builder /app/package.json ./

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]
