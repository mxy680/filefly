from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import easyocr

app = FastAPI()

# Load EasyOCR model
reader = easyocr.Reader(["en"])  # Load English OCR model once

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    try:
        # Read the uploaded file into memory
        content = await file.read()

        # Convert file content to a NumPy array
        np_image = np.frombuffer(content, np.uint8)
        # Decode the image
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        if image is None:
            return JSONResponse({"error": "Invalid image format"}, status_code=400)

        # Perform OCR
        results = reader.readtext(image)

        # Extract and return the text
        extracted_text = [result[1] for result in results]
        return {"text": extracted_text}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
