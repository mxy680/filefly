#!/bin/bash

# Start Weaviate Docker container
echo "Starting Weaviate Docker container..."
docker-compose up -d

# Wait for Weaviate to be ready
echo "Waiting for Weaviate to be ready..."
until curl -s http://localhost:8080/v1/.well-known/ready > /dev/null; do
  sleep 2
done
echo "Weaviate is ready!"
