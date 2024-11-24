def handle_extraction_task(task):
    fileId = task.get("fileId")
    provider = task.get("provider")
    accessToken = task.get("accessToken")
    
    # Add extraction logic here
    return {
        "fileId": fileId,
        "provider": provider,
        "accessToken": accessToken,
        "status": "success"
    }
