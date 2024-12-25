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

        return text, images
    

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
                    
        pdf_path = temp_output_pdf
        output_dir = "/output"  # Directory to save extracted data
        os.makedirs(output_dir, exist_ok=True)

        # Save text
        text_file_path = os.path.join(output_dir, "extracted_text.txt")
        with open(text_file_path, "w", encoding="utf-8") as text_file:
            text_file.write(text)

        # Save images
        for idx, image_data in enumerate(images):
            image_file_path = os.path.join(output_dir, f"image_{idx + 1}.png")
            with open(image_file_path, "wb") as image_file:
                image_file.write(image_data)

        # Log saved files
        print(f"Text saved to: {text_file_path}")
        for idx in range(len(images)):
            print(f"Image {idx + 1} saved to: {os.path.join(output_dir, f'image_{idx + 1}.png')}")

        # Optional: Save the PDF itself for reference
        pdf_output_path = os.path.join(output_dir, os.path.basename(pdf_path))
        os.rename(pdf_path, pdf_output_path)
        print(f"PDF saved to: {pdf_output_path}")

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
