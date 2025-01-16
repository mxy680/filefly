from app.db.postgres.client import db

async def delete_google_file(fileId: str, userId: int) -> dict:
    try:
        response = await db.googledrivefile.delete(
            where={
                "userId": userId,
                "id": fileId,
            }
        )
                
        if not response:
            # File does not exist in the database
            return None

        if response.mimeType.startswith("application/vnd.google-apps"):
            # File is a Google Workspace file (e.g., Docs, Sheets, Slides)
            # Export the file to a downloadable format
            pass
        else:
            args = {
                "mimeType": response.mimeType,
                "fileName": response.name,
                "provider": "google",
                "fileId": fileId,
                "hash": response.sha256,
                "size": response.size,
            }

            return args
    except Exception as e:
        raise ValueError(f"Failed to load file: {e}")