import weaviate
import os
from schemas import document_schema

WEAVIATE_URL = os.getenv("WEAVIATE_URL", "http://localhost:8080")


def init_schema():
    """
    Initialize schema in Weaviate from a JSON file.
    """
    client = weaviate.connect_to_local()
    
    # Create collections
    client.collections.create(
        name=document_schema["name"],
        vectorizer_config=document_schema["vectorizer"],
        properties=document_schema["properties"]
    )
    
    client.close()


if __name__ == "__main__":
    print(f"Initializing schema from schema.json")
    init_schema()
