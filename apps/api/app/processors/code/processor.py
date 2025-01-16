import io
from abc import ABC, abstractmethod
from typing import Tuple

class CodeExtractor(ABC):
    """
    Abstract base class for code file extraction.
    Defines the interface for all code file extractors.
    """

    @property
    def file_type(self) -> str:
        """
        Returns the type of file being processed.
        """
        return "Code File"

    @abstractmethod
    def extract(self, buffer: bytes) -> str:
        """
        Abstract method to extract text from a code file.

        Args:
            buffer (bytes): The file content.

        Returns:
            str: Extracted text content.
        """
        pass


class GeneralCodeExtractor(CodeExtractor):
    """
    Handles text extraction from general code files.
    Reads and decodes the file as plain text.
    """

    def extract(self, buffer: bytes) -> str:
        try:
            # Decode the buffer as UTF-8, with fallback for errors
            return buffer.decode("utf-8", errors="replace")
        except Exception as e:
            raise ValueError(f"Failed to extract text from code file: {e}")
