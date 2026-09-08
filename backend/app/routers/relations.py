from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from app.database import db
from app.models import RelationResponse, FactResponse, RelationType
from app.services.comparator import comparator

router = APIRouter(prefix="/relations", tags=["relations"])

async def _build_relation_response(rel_dict: dict) -> Optional[RelationResponse]:
    fact_a = await db.get_fact(rel_dict["fact_id_a"])
    fact_b = await db.get_fact(rel_dict["fact_id_b"])
    if not fact_a or not fact_b:
        return None
    return RelationResponse(
        id=rel_dict["id"],
        fact_a=FactResponse(**fact_a),
        fact_b=FactResponse(**fact_b),
        relation_type=RelationType(rel_dict["relation_type"]),
        reasoning=rel_dict["reasoning"],
        confidence=rel_dict.get("confidence", "medium")
    )

@router.get("", response_model=List[RelationResponse])
async def get_relations(
    relation_type: Optional[str] = Query(None),
    type: Optional[str] = Query(None)
):
    filter_val = relation_type or type
    if filter_val:
        type_upper = filter_val.upper()
        raw_relations = await db.get_relations_by_type(type_upper)
    else:
        raw_relations = await db.get_relations()

    results = []
    for r in raw_relations:
        resp = await _build_relation_response(r)
        if resp:
            results.append(resp)
    return results

@router.get("/{relation_id}", response_model=RelationResponse)
async def get_relation(relation_id: int):
    raw_relations = await db.get_relations()
    match = next((r for r in raw_relations if r["id"] == relation_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Relation not found")
    resp = await _build_relation_response(match)
    if not resp:
        raise HTTPException(status_code=404, detail="Associated facts missing")
    return resp

@router.post("/recompute")
async def recompute_relations(background_tasks: BackgroundTasks, document_id: Optional[int] = None):
    if document_id:
        background_tasks.add_task(comparator.compare_document_facts, document_id)
        return {"message": f"Queued relationship comparison for document {document_id}"}
    else:
        docs = await db.list_documents()
        for d in docs:
            background_tasks.add_task(comparator.compare_document_facts, d["id"])
        return {"message": f"Queued relationship comparison for all {len(docs)} documents"}
