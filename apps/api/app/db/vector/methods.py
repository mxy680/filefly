import weaviate
from weaviate.classes.query import Filter

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
