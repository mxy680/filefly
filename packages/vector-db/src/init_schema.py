import weaviate
import os
from schemas import schemas
from dotenv import load_dotenv
load_dotenv()

WEAVIATE_URL = os.getenv("WEAVIATE_URL", "http://localhost:8080")


def init_schema():
    """
    Initialize schema in Weaviate from a JSON file.
    """
    headers = {"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")}
    
    # Check if any header is empty
    if not all(headers.values()):
        raise ValueError("One or more ENV variables are empty or invalid")

    client = weaviate.connect_to_local(
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
    except Exception as e:
        print(f"Failed to create collection: {e}")

    client.close()


if __name__ == "__main__":
    init_schema()
