import weaviate
import os
from bootstrap.weaviate_db.schemas import schemas
from dotenv import load_dotenv

def initialize_weaviate():
    """
    Initialize schema in Weaviate from a JSON file.
    """
    headers = {"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")}

    # Check if any header is empty
    if not all(headers.values()):
        raise ValueError("One or more ENV variables are empty or invalid")

    # Establish the client connection to Weaviate
    client = weaviate.connect_to_local(
        host=os.getenv("WEAVIATE_HOST"),
        port=8080,
        grpc_port=50051,
        headers=headers,
    )

    # Create collections
    try:
        for schema in schemas:
            if not client.collections.exists(schema["name"]):
                client.collections.create(
                    name=schema["name"],
                    vectorizer_config=[schema["vectorizer"]],
                    properties=schema["properties"],
                )

        print("Schema initialized successfully")
    except Exception as e:
        print(f"Failed to create collection: {e}")

    client.close()