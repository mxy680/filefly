# Dockerfile for the FastAPI application
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy pyproject.toml and poetry.lock into the container
COPY pyproject.toml poetry.lock /app/

# Install Poetry with retries
RUN pip install --no-cache-dir --default-timeout=100 poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-dev

# Copy the application code
COPY . /app/

# Expose the port
EXPOSE 8000

# Run the application
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
