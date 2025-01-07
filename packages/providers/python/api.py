import base64
from app.db.vector.methods import hash_buffer
import uuid


def get_random_id() -> str:
    """
    Generate a random ID for the file.

    Returns:
        str: The random ID.
    """
    return str(uuid.uuid4())


async def load_file(task: dict) -> tuple[bytes, dict]:
    """
    Load the file from the API request.

    Args:
        task (dict): Task details including file.

    Returns:
        tuple[bytes, dict]: File buffer and metadata.
    """
    # Decode the Base64-encoded buffer
    buffer = base64.b64decode(task.get("buffer"))

    # Prepare metadata
    args = {
        "mimeType": task.get("mimeType"),
        "fileName": task.get("fileName"),
        "provider": task.get("provider"),
        "hash": hash_buffer(buffer),  # Hash the decoded bytes
        "fileId": get_random_id(),
    }

    return buffer, args
