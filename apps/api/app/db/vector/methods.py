import weaviate
from weaviate.classes.query import Filter
from openai import OpenAI
import os 
import numpy as np

def exists(client: weaviate.WeaviateClient, collection: str, fileId: str, hash: str):
    """
    Checks if an object with the given file ID and name exists in the Weaviate collection.

    Args:
        client (weaviate.Client): The Weaviate client instance.
        collection (str): The name of the collection to search
        fileId (str): The unique identifier of the file.
        hash (str): The hash of the content.
    Returns:
        bool: True if the object exists, False otherwise.
    """
    try:
        collection = client.collections.get(collection)
        response = collection.query.fetch_objects(
            filters=(
                Filter.by_property("fileId").equal(fileId)
                & Filter.by_property("hash").equal(hash)
            )
        )

        return len(response.objects) > 0

    except Exception as e:
        print(f"Failed to check if object exists: {e}")


def embed_text_chunks(chunks: list[str]) -> list:
    """
    Embeds a list of text chunks using the OpenAI Batch API and calculates the total cost.

    Args:
        chunks (list[str]): The list of text chunks to embed.

    Returns:
        list: The average embedding of the text chunks.
    """
    embeddings = []
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Process each chunk
    for chunk in chunks:
        try:
            embeddings.append(client.embeddings.create(
                input=chunk,
                model="text-embedding-3-small",
                dimensions=512
            ).data[0].embedding)
        except Exception as e:
            print(f"Failed to embed text chunk: {e}")

    # Average the embeddings
    average_embedding = np.mean(embeddings, axis=0).tolist()    
    
    return average_embedding


def calculate_cost(token_count: int) -> float:
    """
    Calculates the cost of embedding the given text using the OpenAI Batch API.

    Args:
        text (str): The text to embed.

    Returns:
        float: The cost of embedding the text.
    """
    cost_per_1m_tokens = 0.02
    cost = (token_count / 10**6) * cost_per_1m_tokens
    cost = "{:.10f}".format(cost)

    return cost