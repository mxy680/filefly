from app.db.vector.client import get_client
from app.providers.google import load_file_args as load_google_file_args
from app.db.postgres.client import db
from app.processors.function_map import get_extractor
from weaviate.classes.query import Filter


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

    # Get the file information
    match provider:
        case "google":
            args = await load_google_file_args(fileId, userId)
        case _:
            raise ValueError("Provider is not supported")

    # Get the extractor from the MIME type
    mime_type = args.get("mimeType")
    extractor = get_extractor(mime_type)

    # Get the collection
    collection = client.collections.get(extractor.file_type)

    # Delete the object from Weaviate
    try:
        # Get the objects with the given args
        response = collection.query.fetch_objects(
            filters=(
                Filter.by_property("fileId").equal(fileId)
                & Filter.by_property("provider").equal(provider)
                & Filter.by_property("fileName").equal(args.get("fileName"))
                & Filter.by_property("hash").equal(args.get("hash"))
                & Filter.by_property("size").equal(args.get("size"))
            )
        )

        if len(response.objects) == 0:
            raise ValueError("Object not found in Weaviate")
        elif len(response.objects) > 1:
            raise ValueError("Multiple objects found in Weaviate")

        # Delete the object
        object = response.objects[0]
        collection.data.delete_by_id(object.uuid)
        
        # Delete the object from postgres
        await db.googledrivefile.delete(
            where={
                "userId": userId,
                "id": fileId,
            }
        )
        
        print(f"Object with ID {object.uuid} deleted successfully")

    except Exception as e:
        print(f"Failed to delete object: {e}")
