from app.processors.document.document import *
from app.processors.image.image import *

mime_processing_map = {
    # --------------------------------- Document ---------------------------------
    "text/plain": PlainTextExtractor(),
    "application/plain": PlainTextExtractor(),
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
    
    # --------------------------------- Image -------------------------------------
    "image/png": GeneralImageExtractor(),
    "image/jpeg": GeneralImageExtractor(),
    "image/jpg": GeneralImageExtractor(),
    "image/vnd.microsoft.icon": AdvancedImageExtractor(),
    "image/x-icon": AdvancedImageExtractor(),
    "image/webp": AdvancedImageExtractor(),
    "image/tiff": AdvancedImageExtractor(),
    "image/x-tiff": AdvancedImageExtractor(),
    "image/bmp": AdvancedImageExtractor(),
    "image/x-bmp": AdvancedImageExtractor(),
    "image/gif": GraphicsInterchangeFormatExtractor(),
    "image/svg+xml": ScalableVectorGraphicsExtractor(),
}
