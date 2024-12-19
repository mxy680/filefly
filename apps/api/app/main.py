from fastapi import FastAPI
from app.rabbitmq import start_rabbitmq_consumer
import weaviate
import os
from app.tasks.vectorization import handle_vectorization_task

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await start_rabbitmq_consumer()
