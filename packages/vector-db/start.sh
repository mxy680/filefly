#!/bin/bash

# Start Weaviate Docker container
echo "Starting Weaviate Docker container..."
docker-compose up -d

# Timeout limit (in seconds)
TIMEOUT=300
START_TIME=$(date +%s)

# Wait for Weaviate to be ready
echo "Waiting for Weaviate to be ready..."
while ! curl -s http://localhost:8080/v1/.well-known/ready > /dev/null; do
  sleep 2
  CURRENT_TIME=$(date +%s)
  ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
  if [ "$ELAPSED_TIME" -ge "$TIMEOUT" ]; then
    echo "Weaviate did not become ready within $TIMEOUT seconds."
    docker logs weaviate-weaviate-1  # Show container logs for debugging
    exit 1
  fi
done

echo "Weaviate is ready!"

# Initialize schema with the Python script
echo "Initializing schema in Weaviate..."
python init_schema.py

# Check for errors in schema initialization
if [ $? -ne 0 ]; then
  echo "Failed to initialize schema in Weaviate."
  exit 1
fi

echo "Schema initialized successfully!"
