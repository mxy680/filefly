# Use a slim Python image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy pyproject.toml and poetry.lock into the container
COPY pyproject.toml poetry.lock /app/

# Install Poetry with retries and dependencies
RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-dev

# Copy the application code
COPY . /app/

# Expose the application port
EXPOSE 8000

# Default command to initialize schemas and start the server
CMD ["sh", "-c", "poetry run python bootstrap/init.py && poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
