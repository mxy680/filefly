import io
from abc import ABC, abstractmethod
from typing import Tuple, List
from PIL import Image
import requests
import os
import cairosvg
from app.processors.image.preprocessing import *


class ImageExtractor(ABC):
    """
    Abstract base class for image extraction.
    Defines the interface for all image extractors.
    """

    @property
    def file_type(self) -> str:
        """
        Returns the type of file being processed.
        """
        return "Image"

    @abstractmethod
    def extract(self, buffer: bytes) -> str:
        """
        Abstract method to extract text from an image buffer.
        Subclasses must implement this method.
        """
        pass


class GeneralImageExtractor(ImageExtractor):
    """
    Handles text extraction from general image formats (e.g., PNG, JPEG).
    """

    def extract(self, buffer: bytes) -> str:
        try:
            # Preprocess the image to remove invalid color profiles
            buffer = remove_iccp(buffer)

            # Send the image to an OCR service to extract text
            api_url = f"http://{os.getenv('OCR_HOST', 'localhost')}:9000/ocr"
            files = {"file": ("image", buffer, "image/png")}
            response = requests.post(api_url, files=files)
            response.raise_for_status()

            # Parse the response to extract text
            result = response.json()
            extracted_text = result.get("text", "")
            return extracted_text

        except Exception as e:
            raise ValueError(f"Failed to extract text from image: {e}")


class ScalableVectorGraphicsExtractor(ImageExtractor):
    """
    Handles text extraction from SVG files by converting them to PNG.
    """

    def extract(self, buffer: bytes) -> str:
        try:
            # Convert the SVG to a PNG format for OCR
            png_buffer = cairosvg.svg2png(bytestring=buffer)

            # Use GeneralImageExtractor to extract text from the converted PNG
            general_extractor = GeneralImageExtractor()
            extracted_text = general_extractor.extract(png_buffer)
            return extracted_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from SVG: {e}")


class AdvancedImageExtractor(ImageExtractor):
    """
    Handles text extraction from advanced image formats like ICO.
    """

    def extract(self, buffer: bytes) -> str:
        try:
            # Open the ICO image using PIL
            ico_image = Image.open(io.BytesIO(buffer))

            # Convert the ICO image to PNG in memory
            png_buffer = io.BytesIO()
            ico_image.save(png_buffer, format="PNG")
            png_buffer.seek(0)

            # Use GeneralImageExtractor to extract text from the PNG
            general_extractor = GeneralImageExtractor()
            extracted_text = general_extractor.extract(png_buffer.getvalue())
            return extracted_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from ICO: {e}")


class GraphicsInterchangeFormatExtractor(ImageExtractor):
    """
    Handles text extraction from GIF files, including animated GIFs.
    Processes only the first frame for animated GIFs.
    """

    def extract(self, buffer: bytes) -> str:
        try:
            # Open the GIF file using PIL
            gif_image = Image.open(io.BytesIO(buffer))

            # If the GIF is animated, select the first frame
            if getattr(gif_image, "is_animated", False):
                gif_image.seek(0)

            # Convert the first frame to PNG in memory
            png_buffer = io.BytesIO()
            gif_image.save(png_buffer, format="PNG")
            png_buffer.seek(0)

            # Use GeneralImageExtractor to extract text from the PNG
            general_extractor = GeneralImageExtractor()
            extracted_text = general_extractor.extract(png_buffer.getvalue())
            return extracted_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from GIF: {e}")
