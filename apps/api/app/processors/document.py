import io
import base64
from abc import ABC, abstractmethod
from typing import Tuple, List
from docx import Document
from mammoth import convert_to_markdown
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
import striprtf
import re
from odf.opendocument import load
from odf.text import P
from odf.draw import Frame, Image

class FileExtractor(ABC):
    """
    Abstract base class for file extraction.
    """
    
    @property
    def file_type(self) -> str:
        return "Document"

    @abstractmethod
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        """
        Extracts text and images from a file.

        Args:
            buffer (bytes): The file content.

        Returns:
            Tuple[str, List[bytes]]: Extracted text and images.
        """
        pass


class PlainTextExtractor(FileExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        return buffer.decode("utf-8", errors="replace"), []


class WordExtractor(FileExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        doc = Document(io.BytesIO(buffer))
        text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
        images = [
            rel.target_part.blob
            for rel in doc.part.rels.values()
            if "image" in rel.target_ref
        ]
        return text, images


class LegacyWordExtractor(FileExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        result = convert_to_markdown(io.BytesIO(buffer))
        text = result.value
        return text, []


class PDFExtractor(FileExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        text = ""
        images = []

        # Extract text
        pdf_reader = PdfReader(io.BytesIO(buffer))
        for page in pdf_reader.pages:
            text += page.extract_text()

        # Extract images
        pdf_document = fitz.open("pdf", buffer)
        for page in pdf_document:
            for _, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = pdf_document.extract_image(xref)
                images.append(base_image["image"])

        return text, images


class RTFExtractor(FileExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        text = striprtf.rtf_to_text(buffer.decode("utf-8", errors="replace"))
        return text, []


class ODTExtractor(FileExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        try:
            odt_doc = load(io.BytesIO(buffer))
            paragraphs = odt_doc.getElementsByType(P)
            text = "\n".join(
                paragraph.firstChild.data
                for paragraph in paragraphs
                if paragraph.firstChild
            )

            images = []
            for frame in odt_doc.getElementsByType(Frame):
                for image in frame.getElementsByType(Image):
                    image_data = image.getAttribute("href")
                    if image_data.startswith("Pictures/"):
                        images.append(odt_doc.Pictures[image_data])

            encoded_images = [base64.b64encode(img).decode("utf-8") for img in images]
            return text, encoded_images
        except Exception as e:
            print(f"An error occurred while processing the ODT file: {e}")
            return "", []


class MarkdownExtractor(FileExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        try:
            markdown_text = buffer.decode("utf-8", errors="replace")
            image_references = re.findall(r"!\[.*?\]\((.*?)\)", markdown_text)
            return markdown_text, image_references
        except Exception as e:
            print(f"An error occurred while processing the markdown file: {e}")
            return "", []
