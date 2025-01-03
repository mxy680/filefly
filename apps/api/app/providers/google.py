from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from googleapiclient.http import MediaIoBaseDownload
from app.db.postgres.client import db
import io


# function to load google drive
async def load_drive(userId: int) -> build:
    try:
        # Get the access token from database
        response = await db.provider.find_first(
            where={
                "userId": userId,
                "provider": "google",
            }
        )
        
        if not response or not response.accessToken:
            raise ValueError("No access token found for the given user and provider.")

        credentials = Credentials(token=response.accessToken)
        return build("drive", "v3", credentials=credentials)
    except Exception as e:
        raise ValueError(f"Failed to load Google Drive: {e}")


async def load_file(fileId: str, userId: int) -> tuple[bytes, dict]:
    try:
        drive = await load_drive(userId)
        response = await db.googledrivefile.find_first(
            where={
                "userId": userId,
                "id": fileId,
            }
        )
                
        if not response:
            raise ValueError("File not found in database")

        if response.mimeType.startswith("application/vnd.google-apps"):
            # File is a Google Workspace file (e.g., Docs, Sheets, Slides)
            # Export the file to a downloadable format
            pass
        else:
            # File is a standard file type, download directly
            request = drive.files().get_media(fileId=fileId)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            done = False
            while done is False:
                status, done = downloader.next_chunk()

            buffer = file.getvalue()

            if not buffer:
                raise ValueError("Failed to download file")

            args = {
                "mimeType": response.mimeType,
                "fileName": response.name,
                "provider": "google",
                "fileId": fileId,
                "hash": response.sha256,
                "size": response.size,
            }

            return buffer, args
    except Exception as e:
        raise ValueError(f"Failed to load file: {e}")