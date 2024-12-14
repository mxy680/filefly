import io
from abc import ABC, abstractmethod
from typing import Tuple, List
from PIL import Image
import requests

class ImageExtractor(ABC):
    """
    Abstract base class for image extraction.
    """

    @property
    def file_type(self) -> str:
        return "Image"

    @abstractmethod
    def extract(self, buffer: bytes) -> Tuple[str, List[bytes]]:
        """
        Extracts text from an image and returns the image itself.

        Args:
            buffer (bytes): The image content.

        Returns:
            Tuple[str, List[bytes]]: Extracted text and the image buffer.
        """
        pass


class GeneralImageExtractor(ImageExtractor):
    """
    Handles common image types with the same logic for text extraction.
    """

    def extract(self, buffer: bytes) -> str:
        # Call my ocr package (api) to extract text from image
        try:
            # Send the buffer to the OCR API
            api_url = "http://localhost:8000/ocr"  # Replace with the actual API URL
            files = {"file": ("image.png", io.BytesIO(buffer), "image/png")}
            response = requests.post(api_url, files=files)

            # Check for successful response
            response.raise_for_status()

            # Parse and return the extracted text
            result = response.json()
            extracted_text = "\n".join(result.get("text", []))
            print(f"Extracted text from image: {extracted_text}")
            return extracted_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from image: {e}")
