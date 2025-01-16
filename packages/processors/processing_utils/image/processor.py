from abc import ABC, abstractmethod
import requests
import os


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