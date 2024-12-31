import weaviate
import os
from app.db.postgres.client import db

async def handle_deletion_task(task: dict) -> None:
    """
    Handle the deletion of content in Weaviate.

    Args:
        task (dict): Task details including provider, fileId, and metadata.
    """
    # Extract task details
    fileId = task.get("fileId")

    # Initialize Weaviate client
    try:
        client = weaviate.connect_to_local(
            host=os.getenv("WEAVIATE_HOST"),
            port=8080,
            grpc_port=50051,
            headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
        )
    except Exception as e:
        raise ValueError(f"Failed to connect to Weaviate: {e}")

    # Delete the content
    try:
       
        print(f"Deleted {fileId} from Weaviate")
    except weaviate.exceptions.WeaviateException as exc:
        print(f"Failed to delete {fileId} from Weaviate: {exc}")
