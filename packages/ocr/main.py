from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import numpy as np
import cv2


# Calculate centroids for each bounding box
def calculate_centroid(bbox):
    x_coords = [point[0] for point in bbox]
    y_coords = [point[1] for point in bbox]
    return np.mean(x_coords), np.mean(y_coords)


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR Reader (you can add more languages if needed)
reader = easyocr.Reader(["en"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the OCR Service!"}


@app.post("/ocr/")
async def perform_ocr(file: UploadFile = File(...)):
    # Read file contents into memory
    print(f"Received file: {file.filename}")
    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, detail="Uploaded file is not an image."
            )

        # Decode image bytes to a Numpy array
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Failed to decode image.")
        
        # Process the image directly from bytes
        results = reader.readtext(file_bytes)

        # Filter out unconfident results
        results = [(bbox, text, conf) for (bbox, text, conf) in results if conf > 0.6]

        # Add centroids to the results for sorting
        results_with_centroids = []
        for result in results:
            bbox, text, confidence = result
            centroid = calculate_centroid(bbox)
            results_with_centroids.append((centroid, text, confidence, bbox))

        # Sort by top-to-bottom and left-to-right
        sorted_results = sorted(
            results_with_centroids,
            key=lambda x: (
                x[0][1],
                x[0][0],
            ),  # First sort by y (top-to-bottom), then by x (left-to-right)
        )

        extracted_text = [result[1] for result in sorted_results]
        text = " ".join(extracted_text)
    except Exception as e:
        print(f"Error during OCR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during OCR: {str(e)}")

    # Parse OCR result
    return {"text": text}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9000)
