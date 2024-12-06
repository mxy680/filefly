from app.loaders.google import load_drive as load_google_drive, load_file as load_google_file
from app.processors.document import *

def handle_extraction_task(task: dict) -> tuple[str, list[bytes]]:
    """
    Handle the content extraction task.
    
    Args:
        task (dict): The task details.
        
    Returns:
        tuple[str, list[bytes]]: The extracted text and images.
    """
    fileId = task.get("fileId")
    provider = task.get("provider")
    accessToken = task.get("accessToken")
    mimeType = task.get("mimeType")
    
    if not accessToken:  # Check if accessToken is empty or None
        raise ValueError("Access token is empty or invalid")
    
    match provider:
        case "google":
            drive = load_google_drive(accessToken)
            buffer, mimeType = load_google_file(fileId, drive, mimeType)
        case _:
            raise ValueError("Provider is not supported")
        
    if not buffer:
        raise ValueError("Failed to load file")
        
    images: list[bytes] = []
    text: str = ""
    match mimeType:
        case "text/plain":
            # Decode the buffer as plain text
            text = extract_text_plain(buffer)
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            # Extract text and images from a DOCX file
            text, images = extract_from_word(buffer)
        case "application/msword":
            # Extract text and images from a DOC file
            text, images = extract_from_legacy_word(buffer)
        case "application/pdf":
            # Extract text and images from a PDF file
            text, images = extract_from_pdf(buffer)
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
        
    return text, images