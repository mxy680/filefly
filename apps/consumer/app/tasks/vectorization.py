from app.providers.google import load_file as load_google_file
from app.providers.api import load_file as load_api_file
from app.db.vector.client import get_client
from app.db.vector.insertion import insert

async def handle_vectorization_task(task: dict, buffer: bytes = None):
    """
    Handle the vectorization of content extracted from files.

    Args:
        task (dict): Task details including provider, fileId/fileName, and metadata.
        buffer (bytes): Optional image/document buffer for processing.
    """
    # Get the weaviate client
    client = get_client()

    # Load file buffer if not already provided
    if not buffer:
        match task.get("provider"):
            case "api":
                buffer, args = await load_api_file(task)
            case "google":
                buffer, args = await load_google_file(task)
            case _:
                raise ValueError("Provider is not supported")

    # Insert into weaviate
    return insert(client, buffer, args, task, handle_vectorization_task)
