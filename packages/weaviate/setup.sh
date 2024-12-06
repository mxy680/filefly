#!/bin/bash

# Start Weaviate using Docker Compose
docker-compose up -d

# Wait for Weaviate to be ready
echo "Waiting for Weaviate to be ready..."
until curl -s http://localhost:8080/v1/.well-known/ready > /dev/null; do
  sleep 2
done

echo "Weaviate is running at http://localhost:8080"
