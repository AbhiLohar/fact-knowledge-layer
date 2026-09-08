from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.database import db
from app.models import FactResponse
from app.services.embedding import embedding_service

router = APIRouter(prefix="/facts", tags=["facts"])

@router.get("", response_model=List[FactResponse])
async def get_facts(
    document_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    fact_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    if document_id:
        facts = await db.get_facts_by_document(document_id)
    else:
        facts = await db.get_all_facts()

    filtered = facts

    if category:
        cat_lower = category.lower()
        filtered = [f for f in filtered if f.get("category", "").lower() == cat_lower]

    if fact_type:
        type_lower = fact_type.lower()
        filtered = [f for f in filtered if f.get("fact_type", "").lower() == type_lower]

    if search:
        s_lower = search.lower()
        filtered = [
            f for f in filtered 
            if s_lower in f.get("statement", "").lower() 
            or s_lower in f.get("source_quote", "").lower()
            or s_lower in (f.get("value") or "").lower()
        ]

    paginated = filtered[offset:offset + limit]
    return [FactResponse(**f) for f in paginated]

@router.get("/search", response_model=List[FactResponse])
async def search_facts_semantic(q: str = Query(..., min_length=2)):
    matching_ids = await embedding_service.search_facts(q, top_k=25)
    if not matching_ids:
        return []

    facts = []
    for fid in matching_ids:
        fact = await db.get_fact(fid)
        if fact:
            facts.append(FactResponse(**fact))
    return facts

@router.get("/{fact_id}", response_model=FactResponse)
async def get_fact(fact_id: int):
    fact = await db.get_fact(fact_id)
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    return FactResponse(**fact)
