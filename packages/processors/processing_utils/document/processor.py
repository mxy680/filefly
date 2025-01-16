import io
from abc import ABC, abstractmethod
from typing import Tuple, List
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
import hashlib  


class DocumentExtractor(ABC):
    """
    Abstract base class for document extraction.
    Defines the interface for all document extractors.
    """

    @property
    def file_type(self) -> str:
        """
        Returns the type of file being processed.
        """
        return "Document"

    @abstractmethod
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        """
        Abstract method to extract text and images from a document.

        Args:
            buffer (bytes): The file content.

        Returns:
            Tuple[str, List[bytes]]: Extracted text and a list of images.
        """
        pass


class PDFExtractor(DocumentExtractor):
    """
    Extracts text and images from PDF files.
    """

    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        text = ""
        images = []

        # Extract text from PDF pages using PyPDF2
        pdf_reader = PdfReader(io.BytesIO(buffer))
        for page in pdf_reader.pages:
            text += page.extract_text()

        # Extract images from PDF pages using PyMuPDF
        pdf_document = fitz.open("pdf", buffer)
        for page in pdf_document:
            for _, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = pdf_document.extract_image(xref)
                images.append(base_image["image"])

        # Remove duplicate images based on hash
        unique_images = self._remove_duplicate_images(images)

        return text, unique_images

    def _remove_duplicate_images(self, images: List[bytes]) -> List[bytes]:
        """
        Remove duplicate images based on hash values.

        Args:
            images (List[bytes]): List of image data.

        Returns:
            List[bytes]: Unique images.
        """
        seen_hashes = set()
        unique_images = []

        for img in images:
            img_hash = hashlib.sha256(img).hexdigest()
            if img_hash not in seen_hashes:
                seen_hashes.add(img_hash)
                unique_images.append(img)

        return unique_images


class PlainTextExtractor(DocumentExtractor):
    """
    Extracts text from plain text files.
    """

    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        # Decode text content and return an empty image list
        return buffer.decode("utf-8", errors="replace"), []