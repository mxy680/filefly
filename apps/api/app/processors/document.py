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
from zipfile import ZipFile, BadZipFile
import subprocess
import tempfile 
import os
import hashlib

class DocumentExtractor(ABC):
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


class PDFExtractor(DocumentExtractor):
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
                
        # Remove images with duplicate hashes
        unique_images = self._remove_duplicate_images(images)

        return text, unique_images
    
    
    def _remove_duplicate_images(self, images: List[bytes]) -> List[bytes]:
        """
        Remove duplicate images based on their hash values.

        Args:
            images (List[bytes]): List of image data in bytes.

        Returns:
            List[bytes]: List of unique image data.
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
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        return buffer.decode("utf-8", errors="replace"), []


class WordExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        """Extract text and images from a DOCX file."""
        try:
            # Extract text
            text = ""
            doc = Document(io.BytesIO(buffer))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])

            # Extract images
            images = []
            with ZipFile(io.BytesIO(buffer)) as docx_zip:
                for file_name in docx_zip.namelist():
                    if file_name.startswith("word/media/") and file_name.lower().endswith((".png", ".jpeg", ".jpg", ".gif")):
                        images.append(docx_zip.read(file_name))

            return text, images
        except BadZipFile:
            raise ValueError("The provided file is not a valid Word file (DOCX).")
        except Exception as e:
            raise RuntimeError(f"An error occurred while processing the Word file: {e}")


class LegacyWordExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        """Extract text and images from a legacy Word file (DOC)."""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".doc") as temp_input:
            temp_input.write(buffer)
            temp_input.flush()

            # Convert DOC to PDF using unoconv
            temp_output_pdf = temp_input.name.replace(".doc", ".pdf")
            try:
                subprocess.run(
                    ["unoconv", "-f", "pdf", temp_input.name],
                    check=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
            except subprocess.CalledProcessError as e:
                raise RuntimeError(f"unoconv failed: {e.stderr.decode()}")
            finally:
                # Always clean up the input file
                os.unlink(temp_input.name)

            # Use the existing PDFExtractor to extract text and images
            try:
                with open(temp_output_pdf, "rb") as pdf_file:
                    pdf_buffer = pdf_file.read()
                    pdf_extractor = PDFExtractor()
                    text, images = pdf_extractor.extract(pdf_buffer)
            finally:
                # Clean up the temporary output PDF
                if os.path.exists(temp_output_pdf):
                    os.unlink(temp_output_pdf)

        return text, images


class RTFExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        pdf_buffer = self.convert_to_pdf(buffer, "rtf")
        return PDFExtractor().extract(pdf_buffer)


class ODTExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        pdf_buffer = self.convert_to_pdf(buffer, "odt")
        return PDFExtractor().extract(pdf_buffer)


class MarkdownExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        pdf_buffer = self.convert_to_pdf(buffer, "md")
        return PDFExtractor().extract(pdf_buffer)
