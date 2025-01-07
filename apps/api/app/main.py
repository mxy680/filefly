from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.client import db

# Routing
from app.routes.index.route import router as index_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield

    # Shutdown logic here
    await db.disconnect()


app = FastAPI(lifespan=lifespan)

# Include routers
app.include_router(index_router)
