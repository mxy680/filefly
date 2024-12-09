from app.loaders.google import (
    load_drive as load_google_drive,
    load_file as load_google_file,
)
from app.processors.document import *
import time

import weaviate
import os
from dotenv import load_dotenv

load_dotenv()


def handle_vectorization_task(task: dict):
    """
    Handle the content extraction and vectorization.

    Args:
        task (dict): The task details.
    """
    fileId = task.get("fileId")
    provider = task.get("provider")
    accessToken = task.get("accessToken")
    mimeType = task.get("mimeType")

    if not accessToken:  # Check if accessToken is empty or None
        raise ValueError("Access token is empty or invalid")

    try:
        client = weaviate.connect_to_local(
            headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
        )
    except Exception as e:
        raise ValueError(f"Failed to connect to Weaviate: {e}")

    match provider:
        case "google":
            drive = load_google_drive(accessToken)
            buffer, mimeType = load_google_file(fileId, drive, mimeType)
        case _:
            raise ValueError("Provider is not supported")

    if not buffer:
        raise ValueError("Failed to load file")

    match mimeType:
        case "text/plain":
            # Decode the buffer as plain text
            text = extract_text_plain(buffer)

            # Create a document object in Weaviate
            collection = client.collections.get("Document")
            document_uuid = collection.data.insert(
                {
                    "fileName": task.get("fileName"),
                    "content": text,
                    "metadata": task.get("metadata"),
                    "provider": provider,
                    "fileId": fileId,
                }
            )
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            # Extract text and images from a DOCX file
            text, images = extract_from_word(buffer)
        case "application/msword":
            # Extract text and images from a DOC file
            text, images = extract_from_legacy_word(buffer)
        case "application/pdf":
            # Extract text and images from a PDF file
            text, images = extract_from_pdf(buffer)

            # Create a document object in Weaviate
            collection = client.collections.get("Document")
            document_uuid = collection.data.insert(
                {
                    "fileName": task.get("fileName"),
                    "content": text,
                    "metadata": task.get("metadata"),
                    "provider": provider,
                    "fileId": fileId,
                }
            )
            print(f"Document object created: {document_uuid}")

            # Create an image object in Weaviate for each image
            image_collection = client.collections.get("Image")
            for image in images:
                image_uuid = image_collection.data.insert(
                    {
                        "imageData": image,
                        "provider": provider,
                        "fileId": fileId,
                    }
                )
                print(f"Image object created: {image_uuid}")
        case "application/rtf":
            # Extract text from an RTF file
            text, images = extract_from_rtf(buffer)
        case "application/vnd.oasis.opendocument.text":
            # Extract text from an ODT file
            text, images = extract_from_odt(buffer)
        case "text/markdown":
            # Extract text and images from a Markdown file
            text, images = extract_from_markdown(buffer)
        case _:
            raise ValueError("MIME type is not supported")
        
    client.close()
