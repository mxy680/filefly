def handle_extraction_task(task):
    file = task.get("file")
    mime_type = task.get("mimeType")
    # Process the file and extract data
    print(f"Processing extraction task with file: {file}, mime type: {mime_type}")
    # Add extraction logic here
