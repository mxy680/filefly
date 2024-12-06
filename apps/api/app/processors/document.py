import io
import base64
from docx import Document
from mammoth import convert_to_markdown
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
import striprtf
import re
from odf.opendocument import load
from odf.text import P
from odf.draw import Frame, Image

def extract_text_plain(buffer: bytes) -> str:
    """
    Extract text from a plain text file.

    Args:
        buffer (bytes): The file content.

    Returns:
        str: Extracted text.
    """
    return buffer.decode("utf-8", errors="replace")


def extract_from_word(buffer: bytes) -> tuple[str, list[bytes]]:
    """
    Extract text and images from Word documents (.docx).
    
    Args:
        buffer (bytes): The file content.
        
    Returns:
        tuple[str, list[bytes]]: Extracted text and images.
    """
    doc = Document(io.BytesIO(buffer))
    text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
    images = []
    
    for rel in doc.part.rels.values():
        if "image" in rel.target_ref:
            image_data = rel.target_part.blob
            images.append(image_data)
    
    return text, images


def extract_from_legacy_word(buffer: bytes) -> tuple[str, list[bytes]]:
    """
    Extract text from legacy Word documents (.doc).
    
    Args:
        buffer (bytes): The file content.
        
    Returns:
        tuple[str, list[bytes]]: Extracted text and images. Images will be empty.
    """
    try:
        result = convert_to_markdown(io.BytesIO(buffer))
        text = result.value
        return text, []
    except Exception as e:
        return {"type": "doc", "content": None, "images": [], "error": str(e)}
    
    
def extract_from_pdf(buffer: bytes) -> tuple[str, list[bytes]]:
    """
    Extract text and images from PDF files.
    
    Args:
        buffer (bytes): The file content.

    Returns:
        tuple[str, list[bytes]]: Extracted text and images.
    """
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


def extract_from_rtf(buffer: bytes) -> tuple[str, list[bytes]]:
    """
    Extract text from RTF files.
    
    Args:
        buffer (bytes): The file content.
        
    Returns:
        dict: Extracted text and images. Images will be empty.
    """
    try:
        text = striprtf.rtf_to_text(buffer.decode("utf-8", errors="replace"))
        return text, []
    except Exception as e:
        return {"type": "rtf", "content": None, "images": [], "error": str(e)}
    
    
def extract_from_odt(buffer: bytes) -> tuple[str, list[bytes]]:
    """
    Extract text and images from OpenDocument Text (.odt) files.
    
    Args:
        buffer (bytes): The ODT file content as a byte stream.
    
    Returns:
        dict: A dictionary containing text content and images as base64 strings.
    """
    try:
        # Load the ODT document
        odt_doc = load(io.BytesIO(buffer))

        # Extract text content
        paragraphs = odt_doc.getElementsByType(P)
        text = "\n".join(paragraph.firstChild.data for paragraph in paragraphs if paragraph.firstChild)

        # Extract images
        images = []
        for frame in odt_doc.getElementsByType(Frame):
            for image in frame.getElementsByType(Image):
                image_data = image.getAttribute("href")
                # Load the image (if embedded)
                if image_data.startswith("Pictures/"):
                    images.append(odt_doc.Pictures[image_data])

        # Encode images to base64 for portability
        encoded_images = [base64.b64encode(img).decode("utf-8") for img in images]

        return text, encoded_images
    except Exception as e:
        print(f"An error occurred while processing the ODT file: {e}")
        return None, None
    
    
def extract_from_markdown(buffer: bytes) -> tuple[str, list[bytes]]:
    """
    Extract text content and image references from a markdown file.
    
    Args:
        buffer (bytes): The markdown file content as a byte stream.
    
    Returns:
        dict: A dictionary containing the text content and a list of image references.
    """
    try:
        # Decode the buffer to a string
        markdown_text = buffer.decode("utf-8", errors="replace")
        
        # Extract all image references (Markdown syntax for images: ![alt_text](image_url))
        image_references = re.findall(r"!\[.*?\]\((.*?)\)", markdown_text)
        
        # TODO: Extract images from URLs or embedded images
        
        # Return the extracted content
        markdown_text, []
    except Exception as e:
        print(f"An error occurred while processing the markdown file: {e}")
        return None, None