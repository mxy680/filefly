from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.producer import send_task
from pydantic import BaseModel
import base64

router = APIRouter(prefix="/index", tags=["Indexing"])

# Models
class IndexFileResponse(BaseModel):
    fileId: str
    message: str


@router.get("/")
async def index() -> str:
    return "Indexing service is up"


@router.post("/", response_model=IndexFileResponse)
async def index_file(
    apiKey: str = Form(...), file: UploadFile = File(...)
) -> IndexFileResponse:
    try:
        if not file:
            raise HTTPException(status_code=400, detail="File not uploaded.")

        print(f"Received file: {file.filename}, type: {file.content_type}")

        file_content = await file.read()
        if not file_content:
            raise HTTPException(status_code=400, detail="File content is empty.")

        encoded_content = base64.b64encode(file_content).decode("utf-8")

        # Send the task to RabbitMQ
        res = await send_task(
            "vectorization-task",
            {
                "fileName": file.filename,
                "buffer": encoded_content,
                "mimeType": file.content_type,
                "provider": "api",
            },
        )

        print(res)

        return IndexFileResponse(
            fileId=file.filename, message="File indexed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index file: {e}")
