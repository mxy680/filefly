# Use a slim Python image
FROM python:3.12-slim

# Suppress warnings globally for the container
ENV PYTHONWARNINGS=ignore
ENV PYTHONPATH=/app/apps/consumer
ENV PRISMA_PY_DEBUG_GENERATOR=1

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
COPY apps/consumer/pyproject.toml apps/consumer/poetry.lock ./

# Install Python dependencies
RUN poetry install --no-root --no-dev

# Copy application source code
COPY apps/consumer ./apps/consumer

# Copy Prisma schema and environment file
RUN mkdir -p ./apps/consumer/prisma
COPY packages/database/prisma ./apps/consumer/prisma
COPY packages/database/.env ./apps/consumer/prisma

# Install Node.js and Prisma CLI (specific version)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g prisma@5.17.0

# Validate the Prisma schema
RUN cd ./apps/consumer/prisma && prisma validate --schema=./schemapy.prisma

# Generate Prisma Client for Python
RUN cd ./apps/consumer/prisma && prisma generate --schema=./schemapy.prisma

# Expose the application port
EXPOSE 8000

# Run the RabbitMQ Consumer application
CMD ["sh", "-c", "poetry run python apps/consumer/bootstrap/init.py && poetry run uvicorn apps.consumer.app.main:app --host 0.0.0.0 --port 8000"]
