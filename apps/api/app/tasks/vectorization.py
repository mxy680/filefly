from app.loaders.google import (
    load_drive as load_google_drive,
    load_file as load_google_file,
)
from app.db.insertion import insert, insert_chunks, exists
from utils.chunking import chunkify_text
from app.processors.function_map import mime_processing_map

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
    provider = task.get("provider")
    accessToken = task.get("accessToken")
    mimeType = task.get("mimeType")
    fileName = task.get("fileName")
    metadata = task.get("metaData")
    hash = task.get("hash")

    # Format metadata if provided
    if metadata:
        metadata = " ".join([f"{k}: {v}" for k, v in metadata.items()])

    args = {
        "fileName": fileName,
        "metadata": metadata,
        "provider": provider,
        "fileId": fileId,
        "hash": hash,
    }

    # Validate access token
    if not accessToken:
        raise ValueError("Access token is empty or invalid")
    
    # Connect to the Weaviate instance
    try:
        client = weaviate.connect_to_local(
            host=os.getenv("WEAVIATE_HOST"),
            port=8080,
            grpc_port=50051,
            headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
        )
    except Exception as e:
        raise ValueError(f"Failed to connect to Weaviate: {e}")

    # Load file buffer if not already provided
    if not buffer:
        match provider:
            case "google":
                drive = load_google_drive(accessToken)
                buffer, mimeType = load_google_file(fileId, drive, mimeType)
            case _:
                raise ValueError("Provider is not supported")

    # Ensure buffer is loaded
    if not buffer:
        raise ValueError("Failed to load file")

    # Fetch the appropriate extractor for the MIME type
    extractor = mime_processing_map.get(mimeType)
    if not extractor:
        raise ValueError("MIME type not supported")

    # Check if the file already exists in the database
    if exists(client, extractor.file_type, fileId, hash):
        print(f"Object with fileId '{fileId}' already exists.")
        client.close()
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
            insert_chunks(client, extractor.file_type, args)
        else:
            insert(client, extractor.file_type, args)

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
        insert(client, "Image", args)

    # Close the Weaviate client connection
    client.close()

    return None
