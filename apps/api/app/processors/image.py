import cv2
import numpy as np
import easyocr


def extract_image_text(buffer: bytes) -> tuple[str]:
    """
    Extract text from image files based on MIME type.

    Args:
        buffer (bytes): The file content.
        mimeType (str): The MIME type of the image.

    Returns:
        tuple[str, list[bytes]]: Extracted text (if applicable).
    """

    try:
        # Convert the buffer to a NumPy array
        np_image = np.frombuffer(buffer, np.uint8)
        # Decode the NumPy array into an image
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Failed to decode the image from buffer")

        # Preprocess the image
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale

        # Use EasyOCR to extract text
        reader = easyocr.Reader(["en"])  # Initialize the OCR reader
        results = reader.readtext(gray_image)

        # Combine all text detected
        extracted_text = "\n".join([result[1] for result in results])

        return extracted_text
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""
