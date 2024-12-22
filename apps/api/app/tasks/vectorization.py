from app.loaders.google import (
    load_drive as load_google_drive,
    load_file as load_google_file,
)
from app.db.insertion import insert, insert_chunks
from app.utils.chunking import chunkify_text
from app.processors.function_map import mime_processing_map

import weaviate
import os
import base64

def recursive_vectorization(task: dict, buffer: bytes, idx: int):
    """
    Recursive function to handle vectorization of extracted images.

    Args:
        task (dict): The task details.
        buffer (bytes): The image buffer.
        idx (int): Index of the image.
    """
    return handle_vectorization_task(
        {
            "fileName": f"{task.get('fileName')}_image_{idx + 1}",
            "mimeType": "image/png",  # Assuming PNG for extracted images
            "provider": task.get("provider"),
            "accessToken": task.get("accessToken"),
            "fileId": f"{task.get('fileId')}_image_{idx + 1}",
            "metadata": task.get("metadata"),
        },
        buffer,
    )


async def handle_vectorization_task(task: dict, buffer: bytes = None):
    """
    Handle the content extraction and vectorization.

    Args:
        task (dict): The task details.
        buffer (bytes): Optional buffer to pass for recursive image processing.
    """
    fileId = task.get("fileId")
    provider = task.get("provider")
    accessToken = task.get("accessToken")
    mimeType = task.get("mimeType")
    fileName = task.get("fileName")
    metadata = task.get("metaData")
        
    if metadata:
        metadata = " ".join([f"{k}: {v}" for k, v in metadata.items()])

    args = {
        "fileName": fileName,
        "metadata": metadata,
        "provider": provider,
        "fileId": fileId,
    }
    
    if not accessToken:  # Check if accessToken is empty or None
        raise ValueError("Access token is empty or invalid")

    try:
        # Establish the client connection to Weaviate
        client = weaviate.connect_to_local(
            host=os.getenv("WEAVIATE_HOST"),
            port=8080,
            grpc_port=50051,
            headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
        )
        
        
    except Exception as e:
        raise ValueError(f"Failed to connect to Weaviate: {e}")

    if not buffer:  # Load the buffer only if not already passed
        match provider:
            case "google":
                drive = load_google_drive(accessToken)
                buffer, mimeType = load_google_file(fileId, drive, mimeType)
            case _:
                raise ValueError("Provider is not supported")

    if not buffer:
        raise ValueError("Failed to load file")
 
 
    extractor = mime_processing_map.get(mimeType)
    if not extractor:
        raise ValueError("MIME type not supported")
    
    if extractor.file_type == "Document":
        # Extract text and images from document
        text, images = extractor.extract(buffer)
        args["content"] = text
        
        # Chunkify the text and insert each chunk if necessary
        chunks = chunkify_text(text)
        
        if len(chunks) > 1:
            args["chunks"] = chunks
            insert_chunks(client, extractor.file_type, args)
        else:
            insert(client, extractor.file_type, args)

        # Process each image recursively
        for idx, image_buffer in enumerate(images):
            recursive_vectorization(task, image_buffer, idx)
            
    elif extractor.file_type == "Image":
        text = extractor.extract(buffer)
        args["content"] = text
        args["imageData"] = base64.b64encode(buffer).decode("utf-8")
        insert(client, "Image", args)
    
    client.close()
    
    return extractor.extract(buffer)