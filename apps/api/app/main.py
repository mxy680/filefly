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
        "fileName": "image.png",
        "provider": "google",
        "accessToken": "ya29.a0ARW5m74dgaHwFibFpkkQkXQ5oLDW-lwAOlnXboV1m6pmFVugIyzoEbaZ9e-Em0dcw2F0BqgthlVRg_uxc8gxXn5FHs9wykSFK0PJhtY9QcP1waGm4BFU84sICf26MYQN2qQ-xUjvNWHud4LEkOfCEOchv81MwlOcLKLVzom_aCgYKAVISARMSFQHGX2Mi1aoEd9dkvI5T1hBUI2QtJw0175",
        "fileId": "16SMNfcezNUtoldU2m7EhtxIuqCBhG9yZ",
        "metadata": {'size': '712682', 'modifiedTime': '2024-10-08T01:38:46.000Z'},
        "mimeType": "image/png",
    }
            
    try:
        await handle_vectorization_task(task)
        print("Task submitted for vectorization")
        return {"message": "Task submitted for vectorization"}
    except Exception as e:
        print(f"Failed to submit task: {e}")
        return {"error": str(e)}
