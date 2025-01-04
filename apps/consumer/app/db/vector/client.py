import os
import weaviate


def get_client() -> weaviate.WeaviateClient:
    # Connect to the Weaviate instance
    try:
        return weaviate.connect_to_local(
            host=os.getenv("WEAVIATE_HOST"),
            port=8080,
            grpc_port=50051,
            headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
        )
    except Exception as e:
        raise ValueError(f"Failed to connect to Weaviate: {e}")
