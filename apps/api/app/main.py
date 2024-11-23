from fastapi import FastAPI
from app.rabbitmq import start_rabbitmq_consumer

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    # Start RabbitMQ consumers when the app starts
    await start_rabbitmq_consumer()

@app.get("/")
async def read_root():
    return {"message": "FastAPI RabbitMQ Consumer"}
