# Use a slim Python image
FROM python:3.12-slim

# Suppress warnings globally for the container
ENV PYTHONWARNINGS=ignore
ENV PYTHONPATH=/app/apps/api
ENV PRISMA_PY_DEBUG_GENERATOR=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    gnupg \
    curl \
    libreoffice \
    libreoffice-common \
    python3-uno \
    ghostscript \
    poppler-utils \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g prisma@5.17.0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry

# Configure Poetry to disable virtual environments
RUN poetry config virtualenvs.create false

# Set the working directory
WORKDIR /app

# Copy Poetry configuration files
COPY apps/api/pyproject.toml apps/api/poetry.lock ./

# Install Python dependencies
RUN poetry install --no-root

# Copy application source code
COPY apps/api ./apps/api

# Copy additional directory for processors
COPY packages/processors/python ./apps/api/app/processors/

# Copy Prisma schema and environment file
RUN mkdir -p ./apps/api/prisma
COPY packages/prisma/prisma ./apps/api/prisma
COPY packages/prisma/.env ./apps/api/prisma

# Print the dir tree of prisma
RUN ls -R ./apps/api/prisma

# Validate the Prisma schema
RUN cd ./apps/api/prisma && prisma validate --schema=./schemapy.prisma

# Generate Prisma Client for Python
RUN cd ./apps/api/prisma && prisma generate --schema=./schemapy.prisma

# Expose the application port
EXPOSE 10000

# Run the FastAPI application
CMD ["poetry", "run", "uvicorn", "apps.api.app.main:app", "--host", "0.0.0.0", "--port", "10000"]