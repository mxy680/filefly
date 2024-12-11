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

    client = weaviate.connect_to_local(
        headers=headers,
    )

    # Create collections
    for schema in schemas:
        if client.collections.get(schema["name"]) == None:
            client.collections.create(
                name=schema["name"],
                vectorizer_config=[schema["vectorizer"]],
                properties=schema["properties"],
            )
            

if __name__ == "__main__":
    print(f"Initializing schema from schema.json")
    init_schema()
