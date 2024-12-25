import weaviate
from weaviate.classes.query import Filter
from utils.embedding import embed_text_chunks


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

        # Insert the data
        collection = client.collections.get(name)
        object_uuid = collection.data.insert(args)
        print(f"Inserted object into '{name}' with UUID: {object_uuid}")
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

        # Embed the text chunks
        embedding = embed_text_chunks(args["chunks"])

        # Insert the data
        collection = client.collections.get(name)
        object_uuid = collection.data.insert(args, vector=embedding)

        print(f"Inserted chunked object into '{name}' with UUID: {object_uuid}")
        return object_uuid

    except Exception as e:
        print(f"Failed to insert data into collection '{name}': {e}")
        return None


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
