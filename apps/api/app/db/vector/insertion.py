import weaviate
from app.db.vector.methods import embed_text_chunks, calculate_cost

def insert(client: weaviate.WeaviateClient, name: str, args: dict):
    """
    Inserts an object into a Weaviate collection.

    Args:
        client (weaviate.Client): The Weaviate client instance.
        name (str): The name of the collection to insert the data into.
        args (dict): The data to insert, matching the collection's schema.
            - content (str): The text content to insert.

    Returns:
        str: The UUID of the inserted object, or None if the collection doesn't exist.
    """
    try:
        # Get the collection
        if not client.collections.exists(name):
            raise ValueError(f"Collection '{name}' does not exist.")
        
        # Get the token count and cost
        token_count = len(args["content"].split())
        cost = calculate_cost(token_count)

        # Insert the data
        collection = client.collections.get(name)
        object_uuid = collection.data.insert(args)
        print(f"Inserted object into '{name}' with UUID: {object_uuid}")
        print(f"Cost for embedding: ${cost}")
        return object_uuid

    except Exception as e:
        print(f"Failed to insert data into collection '{name}': {e}")
        return None


def insert_chunks(client: weaviate.WeaviateClient, name: str, args: dict):
    """
    Inserts an object into a Weaviate collection.

    Args:
        client (weaviate.Client): The Weaviate client instance.
        name (str): The name of the collection to insert the data into.
        args (dict): The data to insert, matching the collection's schema.
            - content (list[str]): The list of text chunks to insert.

    Returns:
        str: The UUID of the inserted object, or None if the collection doesn't exist.
    """
    try:
        # Get the collection
        if not client.collections.exists(name):
            raise ValueError(f"Collection '{name}' does not exist.")
        
        # Calculate the cost
        token_count = sum(len(chunk.split()) for chunk in args["chunks"])
        cost = calculate_cost(token_count)

        # Embed the text chunks
        embedding = embed_text_chunks(args["chunks"])

        # Insert the data
        collection = client.collections.get(name)
        object_uuid = collection.data.insert(args, vector=embedding)

        print(f"Inserted chunked object into '{name}' with UUID: {object_uuid}")
        print(f"Cost for embedding: ${cost}")
        return object_uuid

    except Exception as e:
        print(f"Failed to insert data into collection '{name}': {e}")
        return None


