from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import base64
from app.tasks.vectorization import handle_vectorization_task

router = APIRouter(prefix="/index", tags=["Indexing"])


# Models
class IndexFileResponse(BaseModel):
    fileId: str
    cost: float
    message: str


@router.post("/", response_model=IndexFileResponse)
async def index_file(
    apiKey: str = Form(...), file: UploadFile = File(...)
) -> IndexFileResponse:
    try:
        if not file:
            raise HTTPException(status_code=400, detail="File not uploaded.")

        file_content = await file.read()
        if not file_content:
            raise HTTPException(status_code=400, detail="File content is empty.")

        encoded_content = base64.b64encode(file_content).decode("utf-8")

        uuid, cost, message = await handle_vectorization_task(
            {
                "fileName": file.filename,
                "buffer": encoded_content,
                "mimeType": file.content_type,
                "provider": "api",
            }
        )

        return IndexFileResponse(
            fileId=uuid,
            cost=cost,
            message=message,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index file: {e}")
