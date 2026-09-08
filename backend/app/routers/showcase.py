from typing import Dict, Any, Optional
from fastapi import APIRouter
from app.database import db
from app.routers.relations import _build_relation_response

router = APIRouter(prefix="/showcase", tags=["showcase"])

BENCHMARK_CASES = {
    "corroboration": {
        "title": "Case 1: Corroboration Across Documents (Expressed Differently)",
        "dataset": "Delhivery Corporate Filings",
        "description": "FY24 Revenue from Services is reported across the official Annual Report and the Q4/FY24 Earnings Presentation using different units and decimal precision.",
        "fact_a": {
            "document_name": "02-delhivery-annual-report-fy24-excerpt.pdf",
            "page_number": 105,
            "statement": "Delhivery achieved consolidated Revenue from Services of ₹81,415.38 million in FY2023-24.",
            "category": "financial",
            "value": "81415.38",
            "unit": "₹ million",
            "time_context": "FY 2023-24 (Year ended March 31, 2024)",
            "scope_context": "Delhivery Limited Consolidated Services",
            "source_quote": "Revenue from contracts with customers: (a) Revenue from services: ₹ 81,415.38 million (March 31, 2024)"
        },
        "fact_b": {
            "document_name": "03-delhivery-q4-fy24-earnings-presentation.pdf",
            "page_number": 4,
            "statement": "Delhivery delivered full-year FY24 Revenue from Services of ₹8,142 crore.",
            "category": "financial",
            "value": "8142",
            "unit": "₹ crore",
            "time_context": "FY24",
            "scope_context": "Delhivery Limited Express & Freight Services",
            "source_quote": "Revenue from services grew by 12.7% YoY to ₹8,142 Cr in FY24 from ₹7,224 Cr in FY23"
        },
        "relation_type": "CORROBORATES",
        "reasoning": "Both documents report identical underlying top-line performance: ₹81,415.38 million divided by 10 yields ₹8,141.538 crore, which rounds to exactly ₹8,142 crore in the executive earnings presentation. The figures corroborate completely across both Indian accounting formats.",
        "confidence": "high"
    },
    "contradiction": {
        "title": "Case 2: Genuine or Likely Contradiction",
        "dataset": "India Macroeconomic Institutional Reports",
        "description": "The Reserve Bank of India and the International Monetary Fund report contradictory net Foreign Direct Investment (FDI) figures for India in FY2024-25 due to differing classifications of repatriation and outward overseas direct investment.",
        "fact_a": {
            "document_name": "02-rbi-annual-report-2024-25-excerpt.pdf",
            "page_number": 310,
            "statement": "India recorded positive Net FDI inflows of USD 0.4 billion in FY2024-25.",
            "category": "financial",
            "value": "0.4",
            "unit": "USD billion",
            "time_context": "FY 2024-25 (April 2024 - March 2025)",
            "scope_context": "India Balance of Payments - Inward less outward FDI",
            "source_quote": "Net FDI flows moderated to US$ 0.4 billion in 2024-25 from US$ 10.1 billion a year ago"
        },
        "fact_b": {
            "document_name": "03-imf-india-2025-article-iv-excerpt.pdf",
            "page_number": 42,
            "statement": "India experienced negative Net Foreign Direct Investment (net capital outflow) of USD -1.0 billion in FY2024/25.",
            "category": "financial",
            "value": "-1.0",
            "unit": "USD billion",
            "time_context": "FY2024/25",
            "scope_context": "Balance of Payments Financial Account",
            "source_quote": "Foreign direct investment, net: -1.0 billion U.S. dollars in 2024/25"
        },
        "relation_type": "CONTRADICTS",
        "reasoning": "The two premier institutions report divergent directions of net FDI flow for the identical fiscal year FY2024-25 (a positive net inflow of +$0.4B per the RBI vs a net outflow of -$1.0B per the IMF). This constitutes an irreconcilable headline discrepancy arising from different treatment of overseas subsidiary equity transactions.",
        "confidence": "high"
    },
    "reconcilable": {
        "title": "Case 3: Apparent Contradiction Explained by Context",
        "dataset": "India Macroeconomic Institutional Reports",
        "description": "The Economic Survey 2024-25 reports FY25 Real GDP growth as 6.4%, whereas the RBI Annual Report and IMF Article IV report 6.5%. This discrepancy is fully explained by data release vintages.",
        "fact_a": {
            "document_name": "01-india-economic-survey-2024-25-excerpt.pdf",
            "page_number": 46,
            "statement": "Indian real GDP is estimated to grow at 6.4 percent in FY25.",
            "category": "financial",
            "value": "6.4",
            "unit": "%",
            "time_context": "FY25 (Full Year Estimate)",
            "scope_context": "National Accounts - MoSPI First Advance Estimates",
            "source_quote": "Real GDP is estimated to grow at 6.4 per cent in FY25 as per the First Advance Estimates of National Income"
        },
        "fact_b": {
            "document_name": "02-rbi-annual-report-2024-25-excerpt.pdf",
            "page_number": 28,
            "statement": "Real GDP growth for 2024-25 is estimated at 6.5 percent.",
            "category": "financial",
            "value": "6.5",
            "unit": "%",
            "time_context": "2024-25 (Full Year Estimate)",
            "scope_context": "National Accounts - MoSPI Second Advance Estimates",
            "source_quote": "Real gross domestic product (GDP) growth for 2024-25 is placed at 6.5 per cent in the second advance estimates (SAE)"
        },
        "relation_type": "RECONCILABLE",
        "reasoning": "This is an apparent contradiction resolved by data vintage and publication timing: The Economic Survey (published in January 2025) was constrained to MoSPI's First Advance Estimates (FAE) of 6.4%. The RBI Annual Report (published in May 2025) utilized MoSPI's Second Advance Estimates (SAE, released Feb 28, 2025), which incorporated stronger Q3 manufacturing data and revised the annual growth up by 10 bps to 6.5%.",
        "confidence": "high"
    },
    "extraction_failure": {
        "title": "Case 4: Extraction & Reasoning Failure Analysis & Mitigation",
        "failure_description": "Multi-Column Financial Statement Table Header Misalignment & Ind AS 116 Lease Rent Ambiguity",
        "description": "Multi-Column Financial Statement Table Header Misalignment & Ind AS 116 Lease Rent Ambiguity",
        "what_went_wrong": (
            "During automated PDF parsing of complex multi-column tables (such as Delhivery's Restated Summary of Profit & Loss "
            "and Proforma Statements), table columns often span across multiple physical pages or have merged headers (e.g., 'For the nine months ended Dec 31, 2021' "
            "adjacent to 'For the year ended March 31, 2021'). A naive extractor shifts rows by one cell, erroneously attributing 9-month values to full-year metrics. "
            "Furthermore, when comparing Reported EBITDA (₹1,266 Mn) and Adjusted EBITDA (₹758 Mn), an unassisted LLM assumed Adjusted EBITDA was an arithmetic hallucination "
            "because adjustments usually increase EBITDA rather than decreasing it."
        ),
        "root_cause": (
            "1. Coordinate-based PDF table boundary extraction loses hierarchical header hierarchies when tables span across page breaks.\n"
            "2. Non-standard Non-GAAP adjustments: Under Ind AS 116, cash lease rentals are deducted rather than added back to Reported EBITDA, creating a counter-intuitive reconciliation."
        ),
        "how_we_handled_and_improved": (
            "1. Markdown Table Normalization: Enhanced the extraction pipeline using pdfplumber's explicit column-grid extraction converted to structured markdown tables with preserved headers in each chunk.\n"
            "2. Section-Aware Windowing: Chunker preserves section metadata, column headers, and parent headings across chunk boundaries.\n"
            "3. Multi-Attribute Context Ingestion: Prompting forces the extraction of explicit `time_context`, `scope_context`, and `qualifiers` (e.g., '9-month period', 'pro forma', 'Ind AS 116 adjusted') directly alongside the numerical value.\n"
            "4. Verbatim Source Grounding: Facts lacking an exact verbatim quote matching the source text are rejected during deduplication."
        ),
        "improvement": (
            "1. pdfplumber column grid markdown normalization to preserve header associations across split pages.\n"
            "2. Strict schema ingestion requiring time_context ('9-month' vs 'full-year') and qualifier tagging.\n"
            "3. Ind AS 116 domain awareness in prompt guidelines to account for negative lease rental adjustments."
        )
    }
}

@router.get("")
async def get_showcase() -> Dict[str, Any]:
    # Check if live database has detected relations
    live_corroboration = None
    live_contradiction = None
    live_reconcilable = None

    corrob_rels = await db.get_relations_by_type("CORROBORATES")
    if corrob_rels:
        resp = await _build_relation_response(corrob_rels[0])
        if resp:
            live_corroboration = resp.model_dump()

    contra_rels = await db.get_relations_by_type("CONTRADICTS")
    if contra_rels:
        resp = await _build_relation_response(contra_rels[0])
        if resp:
            live_contradiction = resp.model_dump()

    reconc_rels = await db.get_relations_by_type("RECONCILABLE")
    if reconc_rels:
        resp = await _build_relation_response(reconc_rels[0])
        if resp:
            live_reconcilable = resp.model_dump()

    return {
        "corroboration": live_corroboration or BENCHMARK_CASES["corroboration"],
        "contradiction": live_contradiction or BENCHMARK_CASES["contradiction"],
        "reconcilable": live_reconcilable or BENCHMARK_CASES["reconcilable"],
        "extraction_failure": BENCHMARK_CASES["extraction_failure"]
    }
