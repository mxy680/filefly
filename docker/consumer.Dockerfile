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

# Add NodeSource GPG keys
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg

# Add NodeSource to apt sources
RUN echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" > /etc/apt/sources.list.d/nodesource.list

# Install Node.js and Prisma CLI (specific version)
RUN apt-get update && apt-get install -y --no-install-recommends nodejs \
    && npm install -g prisma@5.17.0 \
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
RUN poetry install --no-root

# Copy application source code
COPY apps/consumer ./apps/consumer

# Copy additional directory for processor
COPY packages/processors/python ./apps/consumer/app/processors/

# Copy Prisma schema and environment file
RUN mkdir -p ./apps/consumer/prisma
COPY packages/prisma/prisma ./apps/consumer/prisma
COPY packages/prisma/.env ./apps/consumer/prisma

# Validate the Prisma schema
RUN cd ./apps/consumer/prisma && prisma validate --schema=./schemapy.prisma

# Generate Prisma Client for Python
RUN cd ./apps/consumer/prisma && prisma generate --schema=./schemapy.prisma

# Expose the application port
EXPOSE 8000

# Run the RabbitMQ Consumer application
CMD ["sh", "-c", "poetry run python apps/consumer/app/db/vector/bootstrap.py && poetry run uvicorn apps.consumer.app.main:app --host 0.0.0.0 --port 8000"]