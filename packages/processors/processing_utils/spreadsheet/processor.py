import csv
from io import StringIO
from abc import ABC, abstractmethod


class SpreadsheetExtractor(ABC):
    """
    Abstract base class for spreadsheet extractors.
    """

    @property
    def file_type(self) -> str:
        return "Spreadsheet"

    @abstractmethod
    def extract(self, buffer: bytes) -> str:
        """
        Abstract method to extract text from a spreadsheet.

        Args:
            buffer (bytes): The file content.

        Returns:
            str: Extracted spreadsheet content as text.
        """
        pass


class CSVExtractor(SpreadsheetExtractor):
    """
    Handles text extraction from CSV and TSV files.
    """

    def __init__(self, delimiter=","):
        """
        Initializes the extractor with the specified delimiter.

        Args:
            delimiter (str): Delimiter used in the file (e.g., ',' for CSV, '\t' for TSV).
        """
        self.delimiter = delimiter

    def extract(self, buffer: bytes) -> str:
        try:
            # Decode the file as text
            text = buffer.decode("utf-8", errors="replace")
            # Parse the CSV/TSV content using the specified delimiter
            reader = csv.reader(StringIO(text), delimiter=self.delimiter)
            return "\n".join([",".join(row) for row in reader])
        except Exception as e:
            raise ValueError(f"Failed to extract text from CSV/TSV: {e}")