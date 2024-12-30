# Use a slim Python image
FROM python:3.12-slim

# Suppress warnings globally for the container
ENV PYTHONWARNINGS=ignore
ENV PYTHONPATH=/app/apps/api


# Install system dependencies for unoconv and LibreOffice
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libreoffice \
    libreoffice-common \
    python3-uno \
    ghostscript \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry

# Configure Poetry to disable virtual environments
RUN poetry config virtualenvs.create false

# Set the working directory
WORKDIR /app

# Copy Poetry configuration files
COPY apps/api/pyproject.toml apps/api/poetry.lock ./

# Install Python dependencies using Poetry
RUN poetry install --no-root --no-dev

# Copy the application source code
COPY apps/api ./apps/api

# Copy Prisma schema
COPY packages/database/prisma ./packages/database/prisma

# Install Node.js and Prisma CLI for Prisma Client generation
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm prisma

# Validate the schema path and generate Prisma Client
RUN pnpx prisma generate --schema=./packages/database/prisma/schema.prisma

# Expose the application port
EXPOSE 8000

# Run initialization script and FastAPI application
CMD ["sh", "-c", "poetry run python apps/api/bootstrap/init.py && poetry run uvicorn apps.api.app.main:app --host 0.0.0.0 --port 8000"]
