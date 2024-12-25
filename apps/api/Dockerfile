# Use a slim Python image
FROM python:3.12-slim

# Suppress warnings globally for the container
ENV PYTHONWARNINGS=ignore

# Install system dependencies for unoconv and LibreOffice
RUN apt-get update && apt-get install -y --no-install-recommends \
    unoconv \
    libreoffice \
    libreoffice-common \
    python3-uno \
    ghostscript \
    poppler-utils \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for UNO_PATH
ENV UNO_PATH=/usr/lib/libreoffice/program
ENV PYTHONPATH=/usr/lib/python3/dist-packages

# Install Python dependencies
WORKDIR /app
COPY pyproject.toml poetry.lock /app/

RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-dev

# Copy the application code
COPY . /app/

# Expose the application port
EXPOSE 8000

# Default command to initialize schemas and start the server
CMD ["sh", "-c", "poetry run python bootstrap/init.py && poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
