import logging
from typing import List, Dict, Any, Tuple
from app.database import db
from app.services.llm import llm_service
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.collection = db.collection

    def _prepare_enriched_text(self, fact: Dict[str, Any]) -> str:
        parts = [fact.get("statement", "")]
        if fact.get("category"):
            parts.append(f"Category: {fact['category']}")
        if fact.get("time_context"):
            parts.append(f"Period: {fact['time_context']}")
        if fact.get("scope_context"):
            parts.append(f"Scope: {fact['scope_context']}")
        if fact.get("value") and fact.get("unit"):
            parts.append(f"Metric: {fact['value']} {fact['unit']}")
        return " | ".join(parts)

    async def store_fact_embeddings(self, facts: List[Dict[str, Any]], document_id: int) -> None:
        if not facts:
            return

        texts = [self._prepare_enriched_text(f) for f in facts]
        embeddings = await llm_service.get_embeddings_batch(texts)

        ids = []
        documents = []
        metadatas = []
        valid_embeddings = []

        for i, (fact, emb) in enumerate(zip(facts, embeddings)):
            if not emb:
                continue
            fact_id = str(fact["id"])
            ids.append(fact_id)
            documents.append(fact["statement"])
            metadatas.append({
                "fact_id": fact["id"],
                "document_id": document_id,
                "category": str(fact.get("category", "")),
                "fact_type": str(fact.get("fact_type", ""))
            })
            valid_embeddings.append(emb)

        if ids:
            try:
                self.collection.upsert(
                    ids=ids,
                    embeddings=valid_embeddings,
                    documents=documents,
                    metadatas=metadatas
                )
            except Exception as e:
                logger.error(f"Error upserting embeddings into Chroma: {e}")

    async def find_similar_facts(
        self,
        fact: Dict[str, Any],
        exclude_document_id: int,
        top_k: int = 10,
        threshold: float = None
    ) -> List[Tuple[int, float]]:
        threshold = threshold if threshold is not None else settings.SIMILARITY_THRESHOLD
        enriched_text = self._prepare_enriched_text(fact)
        query_embedding = await llm_service.get_embedding(enriched_text)
        
        if not query_embedding:
            return []

        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where={"document_id": {"$ne": exclude_document_id}}
            )

            similar_facts = []
            if results and results.get("ids") and results["ids"][0]:
                for fact_id_str, distance in zip(results["ids"][0], results["distances"][0]):
                    # Chroma returns L2 or cosine distance by default (cosine distance = 1 - cosine_similarity)
                    # For normalized embeddings: similarity = 1 - (distance / 2) or 1 - distance
                    # Let's map distance to similarity:
                    similarity = max(0.0, 1.0 - (distance / 2.0 if distance > 1.0 else distance))
                    if similarity >= threshold:
                        similar_facts.append((int(fact_id_str), similarity))

            return similar_facts
        except Exception as e:
            logger.error(f"Error querying ChromaDB: {e}")
            return []

    async def search_facts(self, query: str, top_k: int = 20) -> List[int]:
        query_embedding = await llm_service.get_embedding(query)
        if not query_embedding:
            return []

        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            if results and results.get("ids") and results["ids"][0]:
                return [int(fid) for fid in results["ids"][0]]
            return []
        except Exception as e:
            logger.error(f"Error searching ChromaDB: {e}")
            return []

embedding_service = EmbeddingService()
