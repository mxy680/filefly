FROM python:3.12-slim

# Set up the working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir poetry \
    && poetry install --no-dev --no-interaction --no-ansi

# Set the command to run your script
CMD ["poetry", "run", "python", "src/init_schema.py"]
