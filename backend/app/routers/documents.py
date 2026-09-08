import asyncio
import shutil
import logging
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from app.config import settings
from app.models import DocumentResponse, ProcessingStatus
from app.database import db
from app.services.pdf_extractor import pdf_extractor
from app.services.chunker import chunker
from app.services.fact_extractor import fact_extractor
from app.services.embedding import embedding_service
from app.services.comparator import comparator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])

upload_dir = Path(settings.UPLOAD_DIR).resolve()
upload_dir.mkdir(parents=True, exist_ok=True)

async def process_document_pipeline(document_id: int, filepath: str, filename: str):
    try:
        # Step 1: Text extraction
        await db.update_document_status(document_id, ProcessingStatus.EXTRACTING)
        pages = pdf_extractor.extract_text(filepath)
        page_count = len(pages)
        if page_count == 0:
            await db.update_document_status(document_id, ProcessingStatus.ERROR, error_message="No readable text or tables extracted from PDF")
            return

        # Step 2: Chunking & Fact extraction
        await db.update_document_status(document_id, ProcessingStatus.ANALYZING, page_count=page_count)
        chunks = chunker.chunk_document(pages, chunk_size=settings.CHUNK_SIZE, overlap=settings.CHUNK_OVERLAP)
        
        extracted_facts = await fact_extractor.extract_facts(chunks, filename)
        
        # Step 3: Persistence and Vectorization
        saved_facts = []
        for fact in extracted_facts:
            fid = await db.create_fact(document_id, fact)
            fact_copy = dict(fact)
            fact_copy["id"] = fid
            saved_facts.append(fact_copy)

        await embedding_service.store_fact_embeddings(saved_facts, document_id)

        # Step 4: Cross-document comparison
        await db.update_document_status(document_id, ProcessingStatus.COMPARING, page_count=page_count)
        await comparator.compare_document_facts(document_id)

        # Step 5: Mark Complete
        await db.update_document_status(document_id, ProcessingStatus.COMPLETE, page_count=page_count)
        logger.info(f"Successfully processed document {filename} (id={document_id}) with {len(saved_facts)} facts.")

    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}", exc_info=True)
        await db.update_document_status(document_id, ProcessingStatus.ERROR, error_message=str(e))

@router.post("", response_model=DocumentResponse)
@router.post("/upload", response_model=DocumentResponse)
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_path = upload_dir / file.filename
    # Handle duplicates by timestamping if already exists
    if file_path.exists():
        stem = file_path.stem
        file_path = upload_dir / f"{stem}_{int(asyncio.get_event_loop().time())}.pdf"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc_id = await db.create_document(filename=file.filename, filepath=str(file_path))
    
    background_tasks.add_task(process_document_pipeline, doc_id, str(file_path), file.filename)
    
    doc = await db.get_document(doc_id)
    return DocumentResponse(**doc)

@router.get("", response_model=List[DocumentResponse])
async def list_documents():
    docs = await db.list_documents()
    return [DocumentResponse(**d) for d in docs]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int):
    doc = await db.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(**doc)

@router.delete("/{document_id}")
async def delete_document(document_id: int):
    doc = await db.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete physical file if exists
    if doc.get("filepath"):
        fp = Path(doc["filepath"])
        if fp.exists():
            try:
                fp.unlink()
            except Exception:
                pass

    await db.delete_document(document_id)
    return {"message": f"Document {document_id} and associated facts deleted successfully."}
