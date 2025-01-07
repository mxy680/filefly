from app.db.vector.client import get_client
from app.db.postgres.delete import delete_google_file
from app.db.vector.deletion import delete

async def handle_deletion_task(task: dict) -> None:
    """
    Handle the deletion of content in Weaviate.

    Args:
        task (dict): Task details including provider, fileId, and metadata.
    """
    # Extract task details
    fileId: str = task.get("fileId")
    userId: int = task.get("userId")
    provider: str = task.get("provider")

    # Initialize Weaviate client
    client = get_client()

    # Delete the object from postgres
    match provider:
        case "google":
            args = await delete_google_file(fileId, userId)
        case _:
            raise ValueError("Provider is not supported")
        
    # Return if no args are returned (file does not exist in the database)
    if not args: return

    # Delete the object from Weaviate
    await delete(client, args)