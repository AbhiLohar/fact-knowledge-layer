import asyncio
import json
import logging
from typing import List, Dict, Any, Set, Tuple
from app.database import db
from app.models import RelationType
from app.services.embedding import embedding_service
from app.services.llm import llm_service
from app.config import settings

logger = logging.getLogger(__name__)

COMPARISON_SYSTEM_PROMPT = """You are an expert Fact Reconciliation & Cross-Document Verification Engine.
You are given two facts extracted from separate official documents. Your task is to determine their logical and factual relationship with high rigor.

Possible Relationship Types:
1. "CORROBORATES"
   - Both facts assert the same truth or compatible measurements.
   - May use different words, slight rounding, or converted units (e.g., ₹81,415.38 Million vs ₹8,142 Crore; or 6.5% GDP reported by two independent agencies).
2. "CONTRADICTS"
   - Direct, mutually incompatible factual claims about the same entity, metric, and exact time period that cannot be reconciled by standard contextual differences.
3. "RECONCILABLE"
   - Apparent contradiction or discrepancy that is FULLY EXPLAINABLE by context, such as:
     * Data Vintage / Release Timing (e.g., MoSPI First Advance Estimates vs Second Advance Estimates vs Final Actuals)
     * Temporal scope (e.g., 9-month period vs full 12-month fiscal year; or unlisted company status before May 2022 vs listed company status after)
     * Entity or Metric Scope (e.g., core employees vs total workforce including delivery partners; standalone vs consolidated; services revenue vs total contract revenue)
     * Accounting or Reporting Standards (e.g., DGCI&S customs trade vs BoP merchandise trade; Ind AS 116 lease adjustments vs cash lease rentals)
     * Corporate governance evolution (e.g., auditor appointment for new term; nominee director resigning upon listing)
4. "RELATED"
   - Both facts discuss the same entity or subject but do not corroborate, contradict, or conflict.

Output a JSON object with schema:
{
  "relation_type": "CORROBORATES" | "CONTRADICTS" | "RECONCILABLE" | "RELATED",
  "reasoning": "A precise, 2-3 sentence explanation articulating WHY this classification was made, citing specific numbers, units, time frames, or contextual caveats.",
  "confidence": "high" | "medium" | "low"
}
"""

class ComparisonService:
    def __init__(self):
        self.semaphore = asyncio.Semaphore(5)

    def _heuristic_classify_pair(self, fact_a: Dict[str, Any], fact_b: Dict[str, Any]) -> Dict[str, Any]:
        val_a = str(fact_a.get("value") or "").strip()
        val_b = str(fact_b.get("value") or "").strip()
        time_a = str(fact_a.get("time_context") or "").strip()
        time_b = str(fact_b.get("time_context") or "").strip()
        unit_a = str(fact_a.get("unit") or "").strip()
        unit_b = str(fact_b.get("unit") or "").strip()
        scope_a = str(fact_a.get("scope_context") or "").strip()
        scope_b = str(fact_b.get("scope_context") or "").strip()

        if val_a and val_b:
            if val_a == val_b:
                return {
                    "relation_type": "CORROBORATES",
                    "reasoning": f"Both documents corroborate the exact same metric value ({val_a} {unit_a}) for {time_a or 'the reported period'}.",
                    "confidence": "high"
                }
            elif time_a and time_b and time_a.lower() == time_b.lower():
                return {
                    "relation_type": "CONTRADICTS",
                    "reasoning": f"Discrepancy identified for same time period {time_a}: Fact A reports {val_a} {unit_a} whereas Fact B reports {val_b} {unit_b}.",
                    "confidence": "high"
                }
            else:
                return {
                    "relation_type": "RECONCILABLE",
                    "reasoning": f"Variance ({val_a} vs {val_b}) is reconcilable by distinct time frames or scope: '{time_a}' vs '{time_b}' and '{scope_a}' vs '{scope_b}'.",
                    "confidence": "medium"
                }

        return {
            "relation_type": "RELATED",
            "reasoning": f"Related factual context across documents regarding {scope_a or 'entity'}.",
            "confidence": "medium"
        }

    async def classify_pair(self, fact_a: Dict[str, Any], fact_b: Dict[str, Any]) -> Dict[str, Any]:
        if not llm_service.is_api_configured():
            return self._heuristic_classify_pair(fact_a, fact_b)

        async with self.semaphore:
            user_prompt = f"""Compare Fact A and Fact B:

Fact A (from "{fact_a.get('document_name', 'Doc A')}", Page {fact_a.get('page_number', 'N/A')}):
- Statement: {fact_a.get('statement')}
- Category: {fact_a.get('category')} | Type: {fact_a.get('fact_type')}
- Value: {fact_a.get('value')} {fact_a.get('unit')}
- Time Horizon: {fact_a.get('time_context', 'Unspecified')}
- Scope: {fact_a.get('scope_context', 'Unspecified')}
- Qualifiers: {fact_a.get('qualifiers', [])}
- Verbatim Evidence: "{fact_a.get('source_quote')}"

Fact B (from "{fact_b.get('document_name', 'Doc B')}", Page {fact_b.get('page_number', 'N/A')}):
- Statement: {fact_b.get('statement')}
- Category: {fact_b.get('category')} | Type: {fact_b.get('fact_type')}
- Value: {fact_b.get('value')} {fact_b.get('unit')}
- Time Horizon: {fact_b.get('time_context', 'Unspecified')}
- Scope: {fact_b.get('scope_context', 'Unspecified')}
- Qualifiers: {fact_b.get('qualifiers', [])}
- Verbatim Evidence: "{fact_b.get('source_quote')}"

Classify their relationship according to the system instructions.
"""
            messages = [
                {"role": "system", "content": COMPARISON_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ]

            try:
                result = await llm_service.chat_completion_json(messages, model=settings.LLM_MODEL)
                rel_type = result.get("relation_type", "RELATED").upper()
                if rel_type not in [r.value for r in RelationType]:
                    rel_type = "RELATED"

                return {
                    "relation_type": rel_type,
                    "reasoning": result.get("reasoning", "Semantic relation identified between facts across documents."),
                    "confidence": result.get("confidence", "medium")
                }
            except Exception as e:
                logger.error(f"Error classifying pair ({fact_a['id']}, {fact_b['id']}): {e}")
                return self._heuristic_classify_pair(fact_a, fact_b)

    async def compare_document_facts(self, document_id: int) -> List[Dict[str, Any]]:
        """
        Incrementally compares all facts from `document_id` against all facts from all other existing documents.
        """
        facts = await db.get_facts_by_document(document_id)
        if not facts:
            return []

        # Find existing relations to avoid duplicate evaluation
        existing_relations = await db.get_relations()
        evaluated_pairs: Set[Tuple[int, int]] = set()
        for r in existing_relations:
            a, b = r["fact_id_a"], r["fact_id_b"]
            evaluated_pairs.add((min(a, b), max(a, b)))

        tasks = []
        pair_metadata = []

        for fact_a in facts:
            similar_candidates = await embedding_service.find_similar_facts(
                fact=fact_a,
                exclude_document_id=document_id,
                top_k=8,
                threshold=settings.SIMILARITY_THRESHOLD
            )

            for fact_b_id, similarity_score in similar_candidates:
                pair_key = (min(fact_a["id"], fact_b_id), max(fact_a["id"], fact_b_id))
                if pair_key in evaluated_pairs:
                    continue
                evaluated_pairs.add(pair_key)

                # Fetch full fact_b record
                fact_b = await db.get_fact(fact_b_id)
                if not fact_b:
                    continue

                tasks.append(self.classify_pair(fact_a, fact_b))
                pair_metadata.append((fact_a["id"], fact_b["id"]))

        if not tasks:
            return []

        classifications = await asyncio.gather(*tasks, return_exceptions=True)
        created_relations = []

        for (fact_id_a, fact_id_b), res in zip(pair_metadata, classifications):
            if isinstance(res, dict):
                # We record all non-trivial relations or meaningful RELATED facts
                rel_id = await db.create_relation(
                    fact_id_a=fact_id_a,
                    fact_id_b=fact_id_b,
                    relation_type=res["relation_type"],
                    reasoning=res["reasoning"],
                    confidence=res["confidence"]
                )
                created_relations.append({
                    "id": rel_id,
                    "fact_id_a": fact_id_a,
                    "fact_id_b": fact_id_b,
                    "relation_type": res["relation_type"],
                    "reasoning": res["reasoning"],
                    "confidence": res["confidence"]
                })

        return created_relations

comparator = ComparisonService()
