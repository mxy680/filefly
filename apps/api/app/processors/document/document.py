import io
import base64
from abc import ABC, abstractmethod
from typing import Tuple, List
from docx import Document
from mammoth import convert_to_markdown
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
from striprtf.striprtf import rtf_to_text
import re
from odf.opendocument import load
from odf.text import P
from odf.draw import Frame, Image
from zipfile import ZipFile, BadZipFile
import subprocess
import tempfile
import os
import hashlib
from xml.etree import ElementTree as ET
import requests
from bs4 import BeautifulSoup


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
                    if file_name.startswith(
                        "word/media/"
                    ) and file_name.lower().endswith((".png", ".jpeg", ".jpg", ".gif")):
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
        """Extract text from an RTF file."""
        try:
            # Decode RTF content to plain text
            text = rtf_to_text(buffer.decode("utf-8"))
            images = []  # RTF does not embed images in a directly accessible way
            return text, images
        except Exception as e:
            raise RuntimeError(f"Failed to extract from RTF file: {e}")


class ODTExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        """Extract text and images from an ODT file."""
        try:
            # Load ODT content
            odt_document = load(io.BytesIO(buffer))

            # Extract text
            paragraphs = odt_document.getElementsByType(P)
            text = "\n".join(
                "".join(
                    child.data
                    for child in p.childNodes
                    if child.nodeType == child.TEXT_NODE
                )
                for p in paragraphs
            )

            # Extract images
            images = []
            for frame in odt_document.getElementsByType(Frame):
                for image in frame.getElementsByType(Image):
                    href = image.getAttribute("href")
                    if href:
                        images.append(
                            href
                        )  # href typically references the image file in the ODT package

            return text, images
        except Exception as e:
            raise RuntimeError(f"Failed to extract from ODT file: {e}")


class MarkdownExtractor:
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        """
        Extract text and images from a markdown file.

        Parameters:
        buffer (bytes): The input markdown file content in bytes.

        Returns:
        Tuple[str, List[bytes]]: A tuple containing the extracted text and a list of images as byte arrays.
        """
        markdown_content = buffer.decode("utf-8")

        # Extract all text content excluding image syntax
        text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", "", markdown_content)

        # Find all image URLs in markdown
        image_urls = re.findall(r"!\[[^\]]*\]\(([^\)]+)\)", markdown_content)

        images = []
        for url in image_urls:
            try:
                response = requests.get(url, stream=True)
                response.raise_for_status()
                images.append(response.content)
            except requests.RequestException as e:
                print(f"Failed to download image from {url}: {e}")

        return text.strip(), images


class XMLExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        # Parse the XML content
        root = ET.fromstring(buffer)

        # Extract all text content
        text_content = []
        for elem in root.iter():
            if elem.text:
                text_content.append(elem.text.strip())

        # Check for images (URLs or base64)
        images = []
        for elem in root.iter():
            if "image" in elem.tag.lower():  # Look for image-related tags
                # Handle URLs
                if elem.text and elem.text.startswith(("http://", "https://")):
                    try:
                        response = requests.get(elem.text)
                        response.raise_for_status()
                        images.append(response.content)
                    except Exception as e:
                        print(f"Failed to download image from {elem.text}: {e}")
                # Handle base64-encoded images
                elif elem.text:
                    try:
                        images.append(base64.b64decode(elem.text))
                    except Exception as e:
                        print(f"Failed to decode base64 image: {e}")

        # Join text content and return results
        return "\n".join(text_content), images


class HTMLExtractor(DocumentExtractor):
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(buffer, "html.parser")

        # Extract text content
        text_content = soup.get_text(separator="\n", strip=True)

        # Extract image data
        images = []
        for img_tag in soup.find_all("img"):
            img_src = img_tag.get("src")
            if img_src:
                if img_src.startswith("data:image"):  # Handle base64-encoded images
                    try:
                        # Extract base64 content and decode it
                        base64_data = img_src.split(",")[1]
                        images.append(base64.b64decode(base64_data))
                    except Exception as e:
                        print(f"Failed to decode base64 image.")
                elif img_src.startswith(("http://", "https://")):  # Handle regular image URLs
                    try:
                        response = requests.get(img_src)
                        response.raise_for_status()
                        images.append(response.content)
                    except Exception as e:
                        print(f"Failed to download image from {img_src}: {e}")

        return text_content, images
