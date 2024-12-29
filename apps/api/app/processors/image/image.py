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
    """

    @property
    def file_type(self) -> str:
        return "Image"

    @abstractmethod
    def extract(self, buffer: bytes) -> str:
        pass


class GeneralImageExtractor(ImageExtractor):
    def extract(self, buffer: bytes) -> str:
        try:
            # Preprocess the image
            buffer = remove_iccp(buffer)

            # Use OCR service to extract text from image
            api_url = f"http://{os.getenv('OCR_HOST', 'localhost')}:9000/ocr"
            files = {"file": ("image", buffer, "image/png")}
            response = requests.post(api_url, files=files)
            response.raise_for_status()
            result = response.json()
            extracted_text = result.get("text", "")
            return extracted_text

        except Exception as e:
            raise ValueError(f"Failed to extract text from image: {e}")


class ScalableVectorGraphicsExtractor(ImageExtractor):
    def extract(self, buffer: bytes) -> str:
        try:
            # Convert SVG to PNG
            png_buffer = cairosvg.svg2png(bytestring=buffer)

            # Use GeneralImageExtractor to extract text from PNG
            general_extractor = GeneralImageExtractor()
            extracted_text = general_extractor.extract(png_buffer)
            return extracted_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from SVG: {e}")


class AdvancedImageExtractor(ImageExtractor):
    def extract(self, buffer: bytes) -> str:
        try:
            # Open ICO file using PIL
            ico_image = Image.open(io.BytesIO(buffer))

            # Convert to PNG in memory
            png_buffer = io.BytesIO()
            ico_image.save(png_buffer, format="PNG")
            png_buffer.seek(0)

            # Use GeneralImageExtractor to extract text from PNG
            general_extractor = GeneralImageExtractor()
            extracted_text = general_extractor.extract(png_buffer.getvalue())
            return extracted_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from ICO: {e}")


class GraphicsInterchangeFormatExtractor(ImageExtractor):
    def extract(self, buffer: bytes) -> str:
        try:
            # Open GIF file using PIL
            gif_image = Image.open(io.BytesIO(buffer))

            # Handle animated GIFs: get the first frame
            if getattr(gif_image, "is_animated", False):
                gif_image.seek(0)  # Go to the first frame

            # Convert to PNG in memory
            png_buffer = io.BytesIO()
            gif_image.save(png_buffer, format="PNG")
            png_buffer.seek(0)

            # Use GeneralImageExtractor to extract text from PNG
            general_extractor = GeneralImageExtractor()
            extracted_text = general_extractor.extract(png_buffer.getvalue())
            return extracted_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from GIF: {e}")
