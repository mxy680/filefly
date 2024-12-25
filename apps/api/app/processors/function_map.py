from app.processors.document import *
from app.processors.image import *

mime_processing_map = {
    # Text-based formats
    "text/plain": PlainTextExtractor(),
    "application/msword": LegacyWordExtractor(),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": WordExtractor(),
    "application/pdf": PDFExtractor(),
    "application/rtf": RTFExtractor(),
    "text/rtf": RTFExtractor(),
    "application/vnd.oasis.opendocument.text": ODTExtractor(),
    "application/vnd.oasis.opendocument.text-template": ODTExtractor(),
    "text/markdown": MarkdownExtractor(),
    "text/x-markdown": MarkdownExtractor(),
    "text/html": HTMLExtractor(),
    "application/html": HTMLExtractor(),
    "application/xhtml+xml": HTMLExtractor(),
    "text/xml": XMLExtractor(),
    "application/xml": XMLExtractor(),
    
    # Image-based formats
    "image/png": GeneralImageExtractor(),
    "image/jpeg": GeneralImageExtractor(),
    "image/bmp": GeneralImageExtractor(),
    "image/tiff": GeneralImageExtractor(),
    "image/gif": GeneralImageExtractor(),
    "image/webp": GeneralImageExtractor(),
}