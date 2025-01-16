from processing_utils.document.processor import *

map = {
    "text/plain": PlainTextExtractor(),
    "application/pdf": PDFExtractor(),
}
