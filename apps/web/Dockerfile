# -------------------------
# 1) Builder Stage
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml for the web app
COPY ./package.json ./pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the web application source code
COPY . .

# Build the Next.js application
RUN pnpm run build

# -------------------------
# 2) Runner (Production) Stage
# -------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the built application and dependencies from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose the application port
EXPOSE 3000

# Start the Next.js server
CMD ["pnpm", "start"]
