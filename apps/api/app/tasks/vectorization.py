from apps.api.app.loaders.google import (
    load_drive as load_google_drive,
    load_file as load_google_file,
)
from apps.api.app.db.vector.insertion import insert, insert_chunks, exists
from utils.chunking import chunkify_text
from app.processors.function_map import get_extractor
from app.db.vector.client import get_client

import weaviate
import os
import base64


def recursive_vectorization(task: dict, buffer: bytes, idx: int) -> None:
    """
    Recursively vectorize extracted images.

    Args:
        task (dict): The task details, such as file name and metadata.
        buffer (bytes): The image buffer.
        idx (int): Index of the image.
    """
    return handle_vectorization_task(
        {
            "fileName": f"{task.get('fileName')}_image_{idx + 1}",
            "mimeType": "image/png",  # Default to PNG for extracted images
            "provider": task.get("provider"),
            "accessToken": task.get("accessToken"),
            "fileId": f"{task.get('fileId')}_image_{idx + 1}",
            "metadata": task.get("metadata"),
            "hash": task.get("hash"),
        },
        buffer,
    )


async def handle_vectorization_task(task: dict, buffer: bytes = None) -> None:
    """
    Handle the vectorization of content extracted from files.

    Args:
        task (dict): Task details including provider, fileId, and metadata.
        buffer (bytes): Optional image/document buffer for processing.
    """
    # Extract task details
    fileId = task.get("fileId")
    userId = task.get("userId")
    provider = task.get("provider")

    # Get the weaviate client
    weaviate_client = get_client()

    # Load file buffer if not already provided
    if not buffer:
        match provider:
            case "google-drive":
                buffer, args = await load_google_file(fileId, userId)
            case _:
                raise ValueError("Provider is not supported")

    # Fetch the appropriate extractor for the MIME type
    mime_type = args.get("mimeType")
    extractor = get_extractor(mime_type)

    # Check if the file already exists in the database
    if exists(weaviate_client, extractor.file_type, fileId, args.get("hash")):
        weaviate_client.close()
        return None

    # Process documents
    if extractor.file_type == "Document":
        # Extract text and images
        text, images = extractor.extract(buffer)
        args["content"] = text

        print(f"Text Length: {len(text)}")
        print(f"Images Extracted: {len(images)}")

        # Chunkify the text and insert into the database
        chunks = chunkify_text(text)
        if len(chunks) > 1:
            args["chunks"] = chunks
            insert_chunks(weaviate_client, extractor.file_type, args)
        else:
            insert(weaviate_client, extractor.file_type, args)

        # Process each extracted image recursively
        for idx, image_buffer in enumerate(images):
            recursive_vectorization(task, image_buffer, idx)

    # Process images
    elif extractor.file_type == "Image":
        # Extract text from the image
        text = extractor.extract(buffer)
        args["content"] = text
        args["imageData"] = base64.b64encode(buffer).decode("utf-8")

        print(f"Extracted Text: {text}")
        insert(weaviate_client, "Image", args)

    # Close the Weaviate client connection
    weaviate_client.close()

    return None
