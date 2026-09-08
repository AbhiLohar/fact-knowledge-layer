import asyncio
import json
import logging
import re
from typing import List, Dict, Any
from app.services.chunker import TextChunk
from app.services.llm import llm_service
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a rigorous Fact Extraction Engine specializing in complex corporate filings, financial disclosures, and macroeconomic policy reports.
Your mission is to extract meaningful, atomic, grounded facts from the provided text excerpt.

For each fact, output a JSON object adhering to this schema:
{
  "statement": "Clear, concise, self-contained factual statement",
  "category": "financial" | "operational" | "corporate" | "market" | "regulatory" | "personnel" | "legal",
  "fact_type": "numerical" | "temporal" | "entity" | "claim" | "relationship",
  "value": "Normalized numerical value or null if not numerical (e.g., '81415.38', '6.5', '18793')",
  "unit": "Exact unit (e.g., '₹ million', '₹ crore', 'USD billion', '%', 'PIN codes', 'tonnes', 'shipments', or null)",
  "time_context": "Explicit time horizon (e.g., 'FY2023-24', 'Q4 FY24', 'April-December 2024', 'as of March 31, 2024', 'since inception')",
  "scope_context": "Entity scope / coverage (e.g., 'Delhivery consolidated', 'excluding Spoton', 'India merchandise exports DGCI&S customs basis', 'Central Government')",
  "source_quote": "VERBATIM quote from text proving this fact without alteration",
  "page_number": <integer or null>,
  "confidence": "high" | "medium" | "low",
  "qualifiers": ["list of caveats, e.g., 'pro forma', 'restated', 'Second Advance Estimate', 'unaudited', 'diluted'"]
}

Guidelines:
1. Grounding: source_quote MUST be an exact phrase appearing in the input text.
2. Temporal precision: Never omit the period or vintage (e.g., distinguish FY21 from FY24; 9M period from full fiscal year).
3. Scope & Unit clarity: Keep units explicit (distinguish crore from million; percentage from basis points).
4. Coverage: Extract key operational figures, revenue/profit/loss figures, executive appointments/resignations, regulatory identifiers (CIN, DIN), and macro indicators.
5. Return JSON with key "facts": [...]
"""

class FactExtractionService:
    def __init__(self):
        self.semaphore = asyncio.Semaphore(5)

    async def extract_chunk_facts(self, chunk: TextChunk, document_name: str) -> List[Dict[str, Any]]:
        async with self.semaphore:
            prompt = f"""Document: {document_name}
Pages: {chunk.page_start} to {chunk.page_end}
Section: {chunk.section_title or 'General'}

Text:
\"\"\"
{chunk.text}
\"\"\"

Extract all distinct, material facts present in the text above following the specified JSON structure."""

            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]

            try:
                # Use mini model for extraction speed and efficiency
                result = await llm_service.chat_completion_json(messages, model=settings.LLM_MODEL_MINI)
                facts = result.get("facts", [])
                
                valid_facts = []
                for f in facts:
                    if not isinstance(f, dict):
                        continue
                    if not f.get("statement") or not f.get("source_quote"):
                        continue
                    
                    # Ensure page number defaults to chunk starting page if missing
                    if not f.get("page_number"):
                        f["page_number"] = chunk.page_start
                    
                    # Normalize category & type
                    f["category"] = f.get("category", "corporate").lower()
                    if f["category"] not in ["financial", "operational", "corporate", "market", "regulatory", "personnel", "legal"]:
                        f["category"] = "corporate"
                    
                    f["fact_type"] = f.get("fact_type", "claim").lower()
                    if f["fact_type"] not in ["numerical", "temporal", "entity", "claim", "relationship"]:
                        f["fact_type"] = "numerical" if f.get("value") else "claim"
                        
                    f["confidence"] = f.get("confidence", "high").lower()
                    if f["confidence"] not in ["high", "medium", "low"]:
                        f["confidence"] = "medium"

                    valid_facts.append(f)
                    
                return valid_facts
            except Exception as e:
                logger.error(f"Error extracting facts for chunk {chunk.chunk_index} in {document_name}: {e}")
                return []

    def _normalize_statement(self, statement: str) -> str:
        s = statement.lower()
        s = re.sub(r'[^a-z0-9\s]', '', s)
        return ' '.join(s.split())

    def deduplicate_facts(self, facts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen_statements = set()
        unique_facts = []
        for f in facts:
            norm = self._normalize_statement(f["statement"])
            if not norm or norm in seen_statements:
                continue
            seen_statements.add(norm)
            unique_facts.append(f)
        return unique_facts

    async def extract_facts(self, chunks: List[TextChunk], document_name: str) -> List[Dict[str, Any]]:
        tasks = [self.extract_chunk_facts(chunk, document_name) for chunk in chunks]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_facts = []
        for res in results:
            if isinstance(res, list):
                all_facts.extend(res)
            elif isinstance(res, Exception):
                logger.error(f"Extraction task generated exception: {res}")
                
        return self.deduplicate_facts(all_facts)

fact_extractor = FactExtractionService()
