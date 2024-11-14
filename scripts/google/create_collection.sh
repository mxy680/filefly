#!/bin/bash

# Check if required arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./create_gdrive_collection.sh <weaviate_url> <api_key>"
  echo "Example: ./create_gdrive_collection.sh http://localhost:8080 YOUR_API_KEY"
  exit 1
fi

# Set variables
WEAVIATE_URL=$1
API_KEY=$2
CLASS_NAME=GoogleDrive

# JSON payload to create schema (specifying properties and skipping certain ones)
read -r -d '' PAYLOAD <<EOF
{
  "class": "$CLASS_NAME",
  "vectorizer": "text2vec-openai",
  "moduleConfig": {
    "text2vec-openai": {
      "vectorizeClassName": true
    }
  },
  "properties": [
    {
      "name": "content",
      "dataType": ["text"]
    },
    {
      "name": "fileId",
      "dataType": ["string"],
      "moduleConfig": {                     
        "text2vec-openi": {
          "skip": true
        }
      }
    },
    {
      "name": "userId",
      "dataType": ["string"],
      "moduleConfig": {                     
        "text2vec-openi": {
          "skip": true
        }
      }
    },
    {
      "name": "mimeType",
      "dataType": ["string"],
      "moduleConfig": {                     
        "text2vec-openi": {
          "skip": true
        }
      }
    }
  ],
  "multiTenancyConfig": {"enabled": true}
}
EOF

# Send POST request to create the schema for the specified class
echo "Creating schema for class: $CLASS_NAME at $WEAVIATE_URL"
curl -X POST "$WEAVIATE_URL/v1/schema" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$PAYLOAD"

echo -e "\nSchema created successfully for class: $CLASS_NAME"
