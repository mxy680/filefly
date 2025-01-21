from fastapi import APIRouter, UploadFile, File, Form, HTTPException

router = APIRouter(prefix="/index", tags=["Indexing"])


@router.post("/")
async def index_file(apiKey: str = Form(...), file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="File not uploaded.")

    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="File content is empty.")

    return {"message": "File uploaded successfully"}
