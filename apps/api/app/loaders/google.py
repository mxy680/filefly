from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from googleapiclient.http import MediaIoBaseDownload
import io

# function to load google drive
def load_drive(accessToken: str) -> build:
    credentials = Credentials(token=accessToken)
    return build("drive", "v3", credentials=credentials)


def load_file(fileId: str, drive: build, mimeType: str) -> tuple[bytes, str]:
    try:
        if mimeType.startswith("application/vnd.google-apps"):
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
                
            return file.getvalue(), mimeType
    except Exception as e:
        print(f"An error occurred: {e}")
        return None, None    
    
        
