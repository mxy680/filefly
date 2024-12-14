from fastapi import FastAPI
from app.rabbitmq import start_rabbitmq_consumer
import weaviate
import os
from app.tasks.vectorization import handle_vectorization_task

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    # Verify Weaviate connection
    client = weaviate.connect_to_local(
        port=8080,
        grpc_port=50051,
        headers={"X-OpenAI-Api-Key": os.getenv("OPENAI_API_KEY")},
    )
    
    if client.is_ready():
        # Start RabbitMQ consumers when the app starts and Weaviate is ready
        print("Weaviate is ready!")
        client.close()
        await start_rabbitmq_consumer()
    

@app.get("/")
async def read_root():
    # call the vectorization task
    task = {
        "fileName": "day1.pdf",
        "provider": "google",
        "accessToken": "ya29.a0ARW5m76kazeVcLjO4BhFWYNquKnskXPDBrrOcOlsPDKwyhvaYSiQhb6TALGmg97YRvxiN5Tq7Yq4VkwdJq1r6hHTx3DY0QlTiYWSxNq-I2hqDQXIBpAlueGnPDdzAVWKmdmdwNvU2cy0zr5w1ZPHPl8CfugcSiP5_fNO8UiAaCgYKAT4SARMSFQHGX2MikJfXmvduAXBugJowuoGWHA0175'",
        "fileId": "1D7lQLJjIYUQQEvoQ3IDDay2AnjfNlJ6F",
        "metadata": {'size': '712682', 'modifiedTime': '2024-10-08T01:38:46.000Z'},
        "mimeType": "application/pdf",
    }
    handle_vectorization_task(task)
    return {"message": "Hello World"}
