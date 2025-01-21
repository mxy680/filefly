# Use a slim Python image
FROM python:3.12

# Suppress warnings globally for the container
ENV PYTHONWARNINGS=ignore
ENV PYTHONPATH=/app/apps/api
ENV PRISMA_PY_DEBUG_GENERATOR=1

# Install system dependencies with space cleanup
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/*

# Install Poetry
RUN pip install --no-cache-dir poetry

# Configure Poetry to disable virtual environments
RUN poetry config virtualenvs.create false

# Set the working directory
WORKDIR /app

# Copy Poetry configuration files
COPY apps/api/pyproject.toml apps/api/poetry.lock ./

# Copy the processors package into the Docker image and build it and install it
COPY packages/processors /packages/processors
RUN cd /packages/processors && poetry build
RUN poetry add /packages/processors/dist/processors-0.1.0-py3-none-any.whl

# Copy the postgres-py package into the Docker image and build it and install it
COPY packages/postgres-py /packages/postgres-py
RUN cd /packages/postgres-py && poetry build
RUN poetry add /packages/postgres-py/dist/postgres_utils-0.1.0-py3-none-any.whl

# Copy the weaviate-py package into the Docker image and build it and install it
COPY packages/weaviate-py /packages/weaviate-py
RUN cd /packages/weaviate-py && poetry build
RUN poetry add /packages/weaviate-py/dist/weaviate_utils-0.1.0-py3-none-any.whl

# Copy the providers package into the Docker image and build it and install it
COPY packages/providers /packages/providers
RUN cd /packages/providers && poetry build
RUN poetry add /packages/providers/dist/providers-0.1.0-py3-none-any.whl

# Install Python dependencies
RUN poetry install --no-root

# Copy application source code
COPY apps/api ./apps/api

# Copy Prisma schema and environment file
RUN mkdir -p ./apps/api/prisma
COPY packages/prisma/prisma ./apps/api/prisma
COPY packages/prisma/.env ./apps/api/prisma

# Validate the Prisma schema
RUN cd ./apps/api/prisma && prisma validate --schema=./schemapy.prisma

# Generate Prisma Client for Python
RUN cd ./apps/api/prisma && prisma generate --schema=./schemapy.prisma

# Expose the application port
EXPOSE 10000

# Run the FastAPI application
CMD ["poetry", "run", "uvicorn", "apps.api.app.main:app", "--host", "0.0.0.0", "--port", "10000"]