import weaviate
from app.db.vector.methods import embed_text_chunks, calculate_cost
from app.processors.function_map import get_extractor
from app.db.vector.methods import exists, chunkify_text, hash_buffer
import base64
import uuid


def insert(
    client: weaviate.WeaviateClient, buffer: bytes, args: dict, task: dict, callback
):
    # Fetch the appropriate extractor for the MIME type
    mime_type = args.get("mimeType")
    provider = args.get("provider")
    extractor = get_extractor(mime_type)
    res: dict = {}

    if extractor is None:
        client.close()
        return None, None, f"Mime Type '{mime_type}' not supported."

    # Check if the file already exists in the database
    if provider != "api":
        if exists(client, extractor.file_type, args.get("fileId"), args.get("hash")):
            client.close()
            return None, None, "File already exists in the database."

    # Process documents
    if extractor.file_type == "Document":
        # Extract text and images
        text, images = extractor.extract(buffer)
        args["content"] = text

        # Chunkify the text and insert into the database
        chunks = chunkify_text(text)
        if len(chunks) > 1:
            args["chunks"] = chunks
            res = insert_document_as_chunks(client, extractor.file_type, args)
        else:
            res = insert_document(client, extractor.file_type, args)

        # Process each extracted image recursively
        task["uuid"] = res[0]
        for idx, image_buffer in enumerate(images):
            res[f"img_{idx}"] = callback(task, image_buffer)

    # Process images
    elif extractor.file_type == "Image":
        # Extract text from the image
        text = extractor.extract(buffer)
        args["content"] = text
        args["imageData"] = base64.b64encode(buffer).decode("utf-8")
        args["parent"] = task["uuid"]

        res = insert_image(client, "Image", args)

    # Process Slideshows
    elif extractor.file_type == "Slideshow":
        # Extract text and images
        text, images = extractor.extract(buffer)

        # Process each extracted image recursively
        task["uuid"] = str(uuid.uuid4())
        vectors = []
        for idx, image_buffer in enumerate(images):
            response = callback(task, image_buffer)
            res[f"img_{idx}"] = response
            vectors.append(response[2])

        aggregated_vector = []  # TODO
        args["content"] = text
        args["uuid"] = task["uuid"]

        res = insert_slideshow(client, args, aggregated_vector)

    # Close the Weaviate client connection and return the result
    client.close()
    return res
