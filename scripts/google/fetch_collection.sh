#!/bin/bash

# Check if required arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./fetch_single_tenant_data.sh <weaviate_url> <api_key>"
  echo "Example: ./fetch_single_tenant_data.sh http://localhost:8080 YOUR_API_KEY"
  exit 1
fi

# Set variables
WEAVIATE_URL=$1
API_KEY=$2
TENANT_ID=1
CLASS_NAME=GoogleDrive
OUTPUT_DIR="./tmp"
OUTPUT_FILE="${OUTPUT_DIR}/${CLASS_NAME}_${TENANT_ID}_results.json"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# GraphQL query payload to fetch all objects for the specified tenant
QUERY_PAYLOAD='{"query": "{ Get { '$CLASS_NAME'(tenant: \"'$TENANT_ID'\") { content fileId userId mimeType } } }"}'

# Fetch data for the specified tenant
echo "Fetching data for tenant: $TENANT_ID"
curl -s -X POST "$WEAVIATE_URL/v1/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$QUERY_PAYLOAD" > "$OUTPUT_FILE"

# Check if data was fetched successfully
if [ $? -eq 0 ]; then
  echo "Data fetched successfully for tenant: $TENANT_ID and stored in $OUTPUT_FILE"
else
  echo "Failed to fetch data for tenant: $TENANT_ID"
fi
