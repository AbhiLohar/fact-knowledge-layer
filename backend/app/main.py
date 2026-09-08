import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import db
from app.routers import documents, facts, relations, showcase

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fact_layer")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Fact Knowledge Layer backend...")
    await db.init_db()
    logger.info("SQLite database and ChromaDB initialized successfully.")
    yield
    logger.info("Shutting down Fact Knowledge Layer backend.")

app = FastAPI(
    title="Fact Knowledge Layer API",
    description="A generalized system for extracting, grounding, and reconciling cross-document factual intelligence from multi-format PDFs.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api")
app.include_router(facts.router, prefix="/api")
app.include_router(relations.router, prefix="/api")
app.include_router(showcase.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "service": "Fact Knowledge Layer",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "documents": "/api/documents",
            "facts": "/api/facts",
            "relations": "/api/relations",
            "showcase": "/api/showcase",
            "docs": "/docs"
        }
    }
