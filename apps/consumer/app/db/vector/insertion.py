import weaviate
from app.db.vector.methods import embed_text_chunks, calculate_cost
from app.processors.function_map import get_extractor
from app.db.vector.methods import exists, chunkify_text, hash_buffer
import base64


def insert(
    client: weaviate.WeaviateClient, buffer: bytes, args: dict, task: dict, callback
) -> None:
    # Fetch the appropriate extractor for the MIME type
    mime_type = args.get("mimeType")
    extractor = get_extractor(mime_type)

    # Check if the file already exists in the database
    if exists(client, extractor.file_type, args.get("fileId"), args.get("hash")):
        client.close()
        return None

    # Process documents
    if extractor.file_type == "Document":
        # Extract text and images
        text, images = extractor.extract(buffer)
        args["content"] = text

        # Chunkify the text and insert into the database
        chunks = chunkify_text(text)
        if len(chunks) > 1:
            args["chunks"] = chunks
            insert_object_as_chunks(client, extractor.file_type, args)
        else:
            insert_object(client, extractor.file_type, args)

        # Process each extracted image recursively
        for _, image_buffer in enumerate(images):
            return callback(
                {
                    "fileId": task.get("fileId"),
                    "userId": task.get("userId"),
                    "provider": task.get("provider"),
                },
                image_buffer,
            )

    # Process images
    elif extractor.file_type == "Image":
        # Extract text from the image
        text = extractor.extract(buffer)
        args["content"] = text
        args["imageData"] = base64.b64encode(buffer).decode("utf-8")

        insert_object(client, "Image", args)

    # Close the Weaviate client connection
    client.close()


def insert_with_api(
    client: weaviate.WeaviateClient,
    buffer: bytes,
    mime_type: str,
    file_name: str,
    callback,
):
    # Fetch the appropriate extractor for the MIME type
    extractor = get_extractor(mime_type)

    # Get the hash of the bytes
    hash = hash_buffer(buffer)

    # Generate args
    args = {
        "fileName": file_name,
        "size": len(buffer),
        "hash": hash,
        "provider": "api",
        "fileId": hash,
    }

    # Process documents
    if extractor.file_type == "Document":
        # Extract text and images
        text, images = extractor.extract(buffer)
        args["content"] = text

        # Chunkify the text and insert into the database
        chunks = chunkify_text(text)
        if len(chunks) > 1:
            args["chunks"] = chunks
            insert_object_as_chunks(client, extractor.file_type, args)
        else:
            insert_object(client, extractor.file_type, args)

        # Process each extracted image recursively
        for _, image_buffer in enumerate(images):
            return callback(image_buffer)

    # Process images
    elif extractor.file_type == "Image":
        # Extract text from the image
        text = extractor.extract(buffer)
        args["content"] = text
        args["imageData"] = base64.b64encode(buffer).decode("utf-8")

        insert_object(client, "Image", args)

    # Close the Weaviate client connection
    client.close()


def insert_object(client: weaviate.WeaviateClient, name: str, args: dict) -> None:
    """
    Inserts an object into a Weaviate collection.

    Args:
        client (weaviate.Client): The Weaviate client instance.
        name (str): The name of the collection to insert the data into.
        args (dict): The data to insert, matching the collection's schema.
            - content (str): The text content to insert.
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

    except Exception as e:
        print(f"Failed to insert data into collection '{name}': {e}")
        return None


def insert_object_as_chunks(
    client: weaviate.WeaviateClient, name: str, args: dict
) -> None:
    """
    Inserts an object into a Weaviate collection.

    Args:
        client (weaviate.Client): The Weaviate client instance.
        name (str): The name of the collection to insert the data into.
        args (dict): The data to insert, matching the collection's schema.
            - content (list[str]): The list of text chunks to insert.
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

    except Exception as e:
        print(f"Failed to insert data into collection '{name}': {e}")
        return None
