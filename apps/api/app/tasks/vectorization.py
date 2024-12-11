from app.loaders.google import (
    load_drive as load_google_drive,
    load_file as load_google_file,
)
from app.db.insertion import insert
from app.processors.document import *
from app.processors.image import extract_image_text

import weaviate
import os
from dotenv import load_dotenv

load_dotenv()


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


def handle_vectorization_task(task: dict, buffer: bytes = None):
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
    
    print("MimeType: ", mimeType)

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
        client = weaviate.connect_to_local(
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

    match mimeType:
        case "text/plain":
            # Decode the buffer as plain text and insert
            text = extract_text_plain(buffer)
            args["content"] = text
            uuid = insert(client, "Document", args)

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            # Extract text and images from a DOCX file
            text, images = extract_from_word(buffer)
            args["content"] = text
            uuid = insert(client, "Document", args)

            # Process each image recursively
            for idx, image_buffer in enumerate(images):
                recursive_vectorization(task, image_buffer, idx)

        case "application/msword":
            # Extract text and images from a DOC file
            text, images = extract_from_legacy_word(buffer)
            args["content"] = text
            uuid = insert(client, "Document", args)

            for idx, image_buffer in enumerate(images):
                recursive_vectorization(task, image_buffer, idx)

        case "application/pdf":
            # Extract text and images from a PDF file
            text, images = extract_from_pdf(buffer)
            args["content"] = text
            uuid = insert(client, "Document", args)

            # Process each image recursively
            for idx, image_buffer in enumerate(images):
                recursive_vectorization(task, image_buffer, idx)

        case "application/rtf":
            # Extract text from an RTF file
            text, images = extract_from_rtf(buffer)
            args["content"] = text
            uuid = insert(client, "Document", args)

            for idx, image_buffer in enumerate(images):
                recursive_vectorization(task, image_buffer, idx)

        case "application/vnd.oasis.opendocument.text":
            # Extract text from an ODT file
            text, images = extract_from_odt(buffer)
            args["content"] = text
            uuid = insert(client, "Document", args)

            for idx, image_buffer in enumerate(images):
                recursive_vectorization(task, image_buffer, idx)

        case "text/markdown":
            # Extract text and images from a Markdown file
            text, images = extract_from_markdown(buffer)
            args["content"] = text
            uuid = insert(client, "Document", args)

            for idx, image_buffer in enumerate(images):
                recursive_vectorization(task, image_buffer, idx)

        case "image/png" | "image/jpeg" | "image/bmp" | "image/tiff":
            # Extract text from image
            text = extract_image_text(buffer)
            args["content"] = text
            uuid = insert(client, "Image", args)
            print(text)

        case _:
            raise ValueError("MIME type is not supported")

    client.close()
