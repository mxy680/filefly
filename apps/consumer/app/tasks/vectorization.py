from app.providers.google import load_file as load_google_file
from app.db.vector.client import get_client
from app.db.vector.insertion import insert

async def handle_vectorization_task(task: dict, buffer: bytes = None) -> None:
    """
    Handle the vectorization of content extracted from files.

    Args:
        task (dict): Task details including provider, fileId, and metadata.
        buffer (bytes): Optional image/document buffer for processing.
    """
    # Extract task details
    fileId: str = task.get("fileId")
    userId: int = task.get("userId")
    provider: str = task.get("provider")

    # Get the weaviate client
    client = get_client()

    # Load file buffer if not already provided
    if not buffer:
        match provider:
            case "google":
                buffer, args = await load_google_file(fileId, userId)
            case _:
                raise ValueError("Provider is not supported")

    # Insert into weaviate
    insert(client, buffer, args, task, handle_vectorization_task)
