# Use a lightweight Python image
FROM python:3.12-slim

# Install dependencies and Tesseract OCR
RUN apt-get update && apt-get install -y curl libgl1-mesa-glx tesseract-ocr \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy dependencies
COPY pyproject.toml poetry.lock* /app/

# Install Python dependencies
RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-root --only main

# Copy the application code
COPY . .

# Expose the FastAPI port
EXPOSE 9000

# Run the FastAPI server
CMD ["poetry", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9000"]
