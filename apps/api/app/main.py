from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.rabbitmq import start_rabbitmq_consumer
from prisma import Prisma


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic here
    await db.connect()
    await start_rabbitmq_consumer()
    yield
    
    # Shutdown logic here
    await db.disconnect()
    

app = FastAPI(lifespan=lifespan)
db = Prisma()