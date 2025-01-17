from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import base64

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
    if not file:
        raise HTTPException(status_code=400, detail="File not uploaded.")

    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="File content is empty.")
