from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import pytesseract

app = FastAPI()

# Configure Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"  # Ensure Tesseract is installed at this path

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

        # Perform OCR using Tesseract
        extracted_text = pytesseract.image_to_string(image)

        return {"text": extracted_text}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500}

@app.get("/health")
async def health():
    return {"status": "ok"}
