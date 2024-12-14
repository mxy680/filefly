from app.processors.document import *
from app.processors.image import *

mime_processing_map = {
    # Text-based formats
    "text/plain": PlainTextExtractor(),
    "application/msword": LegacyWordExtractor(),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": WordExtractor(),
    "application/pdf": PDFExtractor(),
    "application/rtf": RTFExtractor(),
    "application/vnd.oasis.opendocument.text": ODTExtractor(),
    "text/markdown": MarkdownExtractor(),
    
    # Image-based formats
    "image/png": GeneralImageExtractor(),
    "image/jpeg": GeneralImageExtractor(),
    "image/bmp": GeneralImageExtractor(),
    "image/tiff": GeneralImageExtractor(),
    "image/gif": GeneralImageExtractor(),
    "image/webp": GeneralImageExtractor(),
}