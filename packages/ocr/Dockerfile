# Use a lightweight Python image
FROM python:3.12-slim

# Install Poetry
RUN apt-get update && apt-get install -y curl libgl1-mesa-glx tesseract-ocr \
    && curl -sSL https://install.python-poetry.org | python3 - \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:$PATH"

# Set the working directory
WORKDIR /app

# Copy Poetry files first to cache dependencies
COPY pyproject.toml poetry.lock* /app/

# Install dependencies
RUN poetry config virtualenvs.create false && poetry install --no-root --only main

# Copy the application code
COPY . .

# Expose the FastAPI port
EXPOSE 9000

# Run the FastAPI server
CMD ["poetry", "run", "uvicorn", "app.service:app", "--host", "0.0.0.0", "--port", "9000"]