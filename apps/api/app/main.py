from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.postgres.client import db

# Routing
from app.routes.index.route import router as index_router

# Test packages for docker
from postgres_utils import main as postgres_utils_main
from processing_utils import extractor
from weaviate_utils import main as weaviate_utils_main


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield

    # Shutdown logic here
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

# Include routers
app.include_router(index_router)
