from fastapi import FastAPI
from app.rabbitmq import start_rabbitmq_consumer
import weaviate
import os

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
    return {"message": "FastAPI RabbitMQ Consumer"}
