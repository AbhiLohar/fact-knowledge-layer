import asyncio
import json
from pathlib import Path
import aiosqlite
from app.config import settings
from app.models import ProcessingStatus, RelationType

SAMPLE_DOCUMENTS = [
    {
        "id": 1,
        "filename": "01-delhivery-prospectus-2022-excerpt.pdf",
        "filepath": "starter-datasets/delhivery/01-delhivery-prospectus-2022-excerpt.pdf",
        "page_count": 100,
        "status": ProcessingStatus.COMPLETE.value
    },
    {
        "id": 2,
        "filename": "02-delhivery-annual-report-fy24-excerpt.pdf",
        "filepath": "starter-datasets/delhivery/02-delhivery-annual-report-fy24-excerpt.pdf",
        "page_count": 100,
        "status": ProcessingStatus.COMPLETE.value
    },
    {
        "id": 3,
        "filename": "03-delhivery-q4-fy24-earnings-presentation.pdf",
        "filepath": "starter-datasets/delhivery/03-delhivery-q4-fy24-earnings-presentation.pdf",
        "page_count": 27,
        "status": ProcessingStatus.COMPLETE.value
    },
    {
        "id": 4,
        "filename": "01-india-economic-survey-2024-25-excerpt.pdf",
        "filepath": "starter-datasets/india-macroeconomy/01-india-economic-survey-2024-25-excerpt.pdf",
        "page_count": 89,
        "status": ProcessingStatus.COMPLETE.value
    },
    {
        "id": 5,
        "filename": "02-rbi-annual-report-2024-25-excerpt.pdf",
        "filepath": "starter-datasets/india-macroeconomy/02-rbi-annual-report-2024-25-excerpt.pdf",
        "page_count": 100,
        "status": ProcessingStatus.COMPLETE.value
    },
    {
        "id": 6,
        "filename": "03-imf-india-2025-article-iv-excerpt.pdf",
        "filepath": "starter-datasets/india-macroeconomy/03-imf-india-2025-article-iv-excerpt.pdf",
        "page_count": 95,
        "status": ProcessingStatus.COMPLETE.value
    }
]

SAMPLE_FACTS = [
    # --- Delhivery Prospectus 2022 (Doc 1) ---
    {
        "id": 1,
        "document_id": 1,
        "statement": "Delhivery Limited was incorporated as SSN Logistics Private Limited on June 22, 2011.",
        "category": "corporate",
        "fact_type": "temporal",
        "value": "2011-06-22",
        "unit": "date",
        "time_context": "June 22, 2011",
        "scope_context": "Company Incorporation",
        "source_quote": "Our Company was incorporated as 'SSN Logistics Private Limited', a private limited company, under the Companies Act, 1956, pursuant to a certificate of incorporation issued by the RoC on June 22, 2011.",
        "page_number": 105,
        "confidence": "high",
        "qualifiers": ["Certificate of Incorporation"]
    },
    {
        "id": 2,
        "document_id": 1,
        "statement": "Delhivery pre-IPO Corporate Identity Number was U63090DL2011PLC221234 as an unlisted public entity.",
        "category": "corporate",
        "fact_type": "entity",
        "value": "U63090DL2011PLC221234",
        "unit": "CIN",
        "time_context": "As of May 14, 2022 (Prospectus date)",
        "scope_context": "Pre-IPO unlisted public entity",
        "source_quote": "Corporate Identity Number: U63090DL2011PLC221234",
        "page_number": 1,
        "confidence": "high",
        "qualifiers": ["Pre-listing"]
    },
    {
        "id": 3,
        "document_id": 1,
        "statement": "Delhivery had a team size of 86,184 including permanent employees, contractual manpower, and last-mile partner agents.",
        "category": "operational",
        "fact_type": "numerical",
        "value": "86184",
        "unit": "personnel",
        "time_context": "As of December 31, 2021",
        "scope_context": "Delhivery network excluding Spoton",
        "source_quote": "Team size: 86,184 as of December 31, 2021 (Includes permanent employees and contractual workers... as well as last mile delivery agents).",
        "page_number": 214,
        "confidence": "high",
        "qualifiers": ["Excluding Spoton", "Includes last-mile agents"]
    },
    {
        "id": 4,
        "document_id": 1,
        "statement": "Delhivery network serviced 17,488 PIN codes covering 90.61% of India's PIN codes.",
        "category": "operational",
        "fact_type": "numerical",
        "value": "17488",
        "unit": "PIN codes",
        "time_context": "Nine months period ended December 31, 2021",
        "scope_context": "Pan-India delivery network",
        "source_quote": "PIN code reach: 17,488 PIN codes during the nine months period ended December 31, 2021, or 90.61% of the 19,300 PIN codes in India.",
        "page_number": 220,
        "confidence": "high",
        "qualifiers": ["90.61% coverage"]
    },
    {
        "id": 5,
        "document_id": 1,
        "statement": "Delhivery reported revenue from contracts with customers of ₹36,465.27 million in FY2021.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "36465.27",
        "unit": "₹ million",
        "time_context": "Fiscal Year ended March 31, 2021",
        "scope_context": "Delhivery Restated Consolidated",
        "source_quote": "Revenue from contracts with customers: 36,465.27 million for the Financial Year ended March 31, 2021.",
        "page_number": 92,
        "confidence": "high",
        "qualifiers": ["Restated Consolidated"]
    },

    # --- Delhivery Annual Report FY24 (Doc 2) ---
    {
        "id": 6,
        "document_id": 2,
        "statement": "Delhivery post-IPO Corporate Identity Number is L63090DL2011PLC221234 reflecting listed status.",
        "category": "corporate",
        "fact_type": "entity",
        "value": "L63090DL2011PLC221234",
        "unit": "CIN",
        "time_context": "FY 2023-24 (post-listing)",
        "scope_context": "Listed entity on NSE and BSE",
        "source_quote": "CIN: L63090DL2011PLC221234 | Delhivery Limited Annual Report 2023-24",
        "page_number": 2,
        "confidence": "high",
        "qualifiers": ["Listed on BSE/NSE since May 2022"]
    },
    {
        "id": 7,
        "document_id": 2,
        "statement": "Delhivery consolidated Revenue from Services reached ₹81,415.38 million in FY2023-24.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "81415.38",
        "unit": "₹ million",
        "time_context": "FY 2023-24",
        "scope_context": "Delhivery Consolidated Services",
        "source_quote": "Revenue from contracts with customers: (a) Revenue from services: ₹ 81,415.38 million",
        "page_number": 105,
        "confidence": "high",
        "qualifiers": ["Consolidated", "Audited"]
    },
    {
        "id": 8,
        "document_id": 2,
        "statement": "Delhivery achieved positive full-year Reported EBITDA of ₹1,266.41 million in FY2023-24.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "1266.41",
        "unit": "₹ million",
        "time_context": "FY 2023-24",
        "scope_context": "Delhivery Consolidated Reported EBITDA",
        "source_quote": "Reported EBITDA: Positive ₹ 1,266.41 million (1.56% margin) for FY24 compared to ₹ (4,516.08) million in FY23.",
        "page_number": 32,
        "confidence": "high",
        "qualifiers": ["Reported EBITDA under Ind AS"]
    },
    {
        "id": 9,
        "document_id": 2,
        "statement": "Delhivery total workforce strength stood at 98,135 including permanent, contract, and last-mile partner agents.",
        "category": "operational",
        "fact_type": "numerical",
        "value": "98135",
        "unit": "personnel",
        "time_context": "As of March 31, 2024",
        "scope_context": "Total operational workforce",
        "source_quote": "Workforce strength: 98,135 (Includes permanent employees, contractual workers and last-mile delivery partner agents as on March 31, 2024).",
        "page_number": 2,
        "confidence": "high",
        "qualifiers": ["Includes partner agents"]
    },
    {
        "id": 10,
        "document_id": 2,
        "statement": "Delhivery nationwide PIN code coverage expanded to 18,793 PIN codes.",
        "category": "operational",
        "fact_type": "numerical",
        "value": "18793",
        "unit": "PIN codes",
        "time_context": "As of March 31, 2024",
        "scope_context": "Pan-India physical network",
        "source_quote": "PIN codes covered: 18,793, covering over 99.5% of Indian population.",
        "page_number": 2,
        "confidence": "high",
        "qualifiers": [">99.5% population coverage"]
    },

    # --- Delhivery Q4 FY24 Earnings Presentation (Doc 3) ---
    {
        "id": 11,
        "document_id": 3,
        "statement": "Delhivery full-year FY24 Revenue from Services was ₹8,142 crore.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "8142",
        "unit": "₹ crore",
        "time_context": "FY24",
        "scope_context": "Delhivery Services Revenue",
        "source_quote": "Revenue from services grew by 12.7% YoY to ₹8,142 Cr in FY24 from ₹7,224 Cr in FY23",
        "page_number": 4,
        "confidence": "high",
        "qualifiers": ["₹ Crore unit"]
    },
    {
        "id": 12,
        "document_id": 3,
        "statement": "Delhivery Reported EBITDA for FY24 was ₹127 crore.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "127",
        "unit": "₹ crore",
        "time_context": "FY24",
        "scope_context": "Consolidated Reported EBITDA",
        "source_quote": "Reported EBITDA: ₹127 Cr (1.6% margin) in FY24 vs ₹(452) Cr in FY23",
        "page_number": 14,
        "confidence": "high",
        "qualifiers": ["Rounded to ₹ Cr"]
    },
    {
        "id": 13,
        "document_id": 3,
        "statement": "Delhivery team size was reported as 63,713 permanent employees and contractual workers, plus 34,422 partner agents.",
        "category": "operational",
        "fact_type": "numerical",
        "value": "63713",
        "unit": "personnel",
        "time_context": "Q4 FY24 (as of March 31, 2024)",
        "scope_context": "Team size excluding partner agents",
        "source_quote": "Team size (Permanent + Contract): 63,713 | Partner Agents: 34,422 as of Q4 FY24.",
        "page_number": 8,
        "confidence": "high",
        "qualifiers": ["Permanent + Contract only"]
    },
    {
        "id": 14,
        "document_id": 3,
        "statement": "Delhivery PIN code reach reached 18,793 in Q4 FY24.",
        "category": "operational",
        "fact_type": "numerical",
        "value": "18793",
        "unit": "PIN codes",
        "time_context": "Q4 FY24",
        "scope_context": "Express delivery footprint",
        "source_quote": "PIN Code Reach: 18,793 in Q4 FY24 compared to 18,540 in Q4 FY23",
        "page_number": 8,
        "confidence": "high",
        "qualifiers": ["Q4 FY24 snapshot"]
    },

    # --- Economic Survey 2024-25 (Doc 4) ---
    {
        "id": 15,
        "document_id": 4,
        "statement": "Indian real GDP is estimated to grow at 6.4 percent in FY25 based on First Advance Estimates.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "6.4",
        "unit": "%",
        "time_context": "FY25 (Full Year Estimate)",
        "scope_context": "National Accounts - MoSPI First Advance Estimates",
        "source_quote": "Real GDP is estimated to grow at 6.4 per cent in FY25 as per the First Advance Estimates of National Income.",
        "page_number": 46,
        "confidence": "high",
        "qualifiers": ["MoSPI First Advance Estimates (FAE)"]
    },
    {
        "id": 16,
        "document_id": 4,
        "statement": "Headline CPI inflation averaged 4.9 percent in April-December 2024 driven by vegetable price spikes.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "4.9",
        "unit": "%",
        "time_context": "April-December 2024 (9 months)",
        "scope_context": "All-India Consumer Price Index",
        "source_quote": "Headline CPI inflation moderated to 4.9 per cent during April-December 2024 from 5.4 per cent in FY24.",
        "page_number": 124,
        "confidence": "high",
        "qualifiers": ["9-month period Apr-Dec"]
    },
    {
        "id": 17,
        "document_id": 4,
        "statement": "Foreign exchange reserves stood at USD 640.3 billion at end-December 2024.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "640.3",
        "unit": "USD billion",
        "time_context": "End-December 2024",
        "scope_context": "Reserve Bank of India FX Reserves",
        "source_quote": "Forex reserves stood at USD 640.3 billion at end-December 2024, providing an import cover of 10.9 months.",
        "page_number": 75,
        "confidence": "high",
        "qualifiers": ["December 2024 position"]
    },

    # --- RBI Annual Report 2024-25 (Doc 5) ---
    {
        "id": 18,
        "document_id": 5,
        "statement": "India real GDP growth for 2024-25 is estimated at 6.5 percent according to the Second Advance Estimates.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "6.5",
        "unit": "%",
        "time_context": "FY 2024-25",
        "scope_context": "National Accounts - MoSPI Second Advance Estimates",
        "source_quote": "Real gross domestic product (GDP) growth for 2024-25 is placed at 6.5 per cent in the second advance estimates (SAE)",
        "page_number": 28,
        "confidence": "high",
        "qualifiers": ["MoSPI Second Advance Estimates (SAE)"]
    },
    {
        "id": 19,
        "document_id": 5,
        "statement": "Headline CPI inflation averaged 4.6 percent for the full year 2024-25 after steep winter food disinflation.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "4.6",
        "unit": "%",
        "time_context": "Full Year 2024-25 (April 2024 - March 2025)",
        "scope_context": "Headline All-India CPI",
        "source_quote": "Headline CPI inflation averaged 4.6 per cent in 2024-25, moderating from 5.4 per cent in the previous year.",
        "page_number": 52,
        "confidence": "high",
        "qualifiers": ["Full 12-month average"]
    },
    {
        "id": 20,
        "document_id": 5,
        "statement": "India Foreign Exchange Reserves stood at USD 668.3 billion as of end-March 2025.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "668.3",
        "unit": "USD billion",
        "time_context": "End-March 2025",
        "scope_context": "RBI Foreign Exchange Reserves",
        "source_quote": "India's foreign exchange reserves stood at US$ 668.3 billion as on March 31, 2025.",
        "page_number": 88,
        "confidence": "high",
        "qualifiers": ["March 31, 2025"]
    },
    {
        "id": 21,
        "document_id": 5,
        "statement": "Net FDI flows into India stood at USD 0.4 billion in FY2024-25.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "0.4",
        "unit": "USD billion",
        "time_context": "FY 2024-25",
        "scope_context": "Balance of Payments - Net FDI Inflows",
        "source_quote": "Net FDI flows moderated to US$ 0.4 billion in 2024-25 from US$ 10.1 billion a year ago, mainly reflecting higher repatriation.",
        "page_number": 310,
        "confidence": "high",
        "qualifiers": ["Reflects repatriation"]
    },

    # --- IMF India 2025 Article IV (Doc 6) ---
    {
        "id": 22,
        "document_id": 6,
        "statement": "IMF staff report recorded India FY2024/25 real GDP growth at 6.5 percent.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "6.5",
        "unit": "%",
        "time_context": "FY2024/25",
        "scope_context": "IMF Country Report Staff Assessment",
        "source_quote": "Real GDP growth is estimated at 6.5 percent in FY2024/25, supported by resilient domestic demand.",
        "page_number": 1,
        "confidence": "high",
        "qualifiers": ["IMF Staff Estimate"]
    },
    {
        "id": 23,
        "document_id": 6,
        "statement": "IMF recorded India Foreign Exchange Reserves at USD 668.3 billion at end-March 2025.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "668.3",
        "unit": "USD billion",
        "time_context": "End-March 2025",
        "scope_context": "Gross International Reserves",
        "source_quote": "Gross international reserves stood at USD 668.3 billion at end-March 2025, covering 109 percent of the IMF reserve adequacy metric.",
        "page_number": 44,
        "confidence": "high",
        "qualifiers": ["109% of IMF metric"]
    },
    {
        "id": 24,
        "document_id": 6,
        "statement": "India experienced negative Net Foreign Direct Investment of USD -1.0 billion in FY2024/25.",
        "category": "financial",
        "fact_type": "numerical",
        "value": "-1.0",
        "unit": "USD billion",
        "time_context": "FY2024/25",
        "scope_context": "Balance of Payments Financial Account",
        "source_quote": "Foreign direct investment, net: -1.0 billion U.S. dollars in 2024/25",
        "page_number": 42,
        "confidence": "high",
        "qualifiers": ["Net outflow"]
    }
]

SAMPLE_RELATIONS = [
    # Case 1: Corroboration (Delhivery Revenue across Annual Report & Presentation)
    {
        "fact_id_a": 7,
        "fact_id_b": 11,
        "relation_type": RelationType.CORROBORATES.value,
        "reasoning": "Annual Report reports FY24 Services Revenue as ₹81,415.38 million while Earnings Presentation reports ₹8,142 crore. Dividing ₹81,415.38M by 10 gives ₹8,141.538 crore, which rounds to exactly ₹8,142 crore. Both documents corroborate perfectly across units.",
        "confidence": "high"
    },
    # Corroboration (EBITDA across Annual Report & Presentation)
    {
        "fact_id_a": 8,
        "fact_id_b": 12,
        "relation_type": RelationType.CORROBORATES.value,
        "reasoning": "Annual Report cites Reported EBITDA of ₹1,266.41 million (₹126.64 Cr), which rounds to ₹127 crore in the Earnings Presentation.",
        "confidence": "high"
    },
    # Corroboration (PIN Code reach across Annual Report & Presentation)
    {
        "fact_id_a": 10,
        "fact_id_b": 14,
        "relation_type": RelationType.CORROBORATES.value,
        "reasoning": "Both filings corroborate the exact identical network milestone of 18,793 PIN codes covered as of March 31, 2024.",
        "confidence": "high"
    },
    # Corroboration (GDP across RBI and IMF)
    {
        "fact_id_a": 18,
        "fact_id_b": 22,
        "relation_type": RelationType.CORROBORATES.value,
        "reasoning": "Both the Reserve Bank of India and the IMF report identical FY2024-25 Real GDP growth of 6.5%, corroborating national account assessments.",
        "confidence": "high"
    },
    # Corroboration (Forex Reserves across RBI and IMF)
    {
        "fact_id_a": 20,
        "fact_id_b": 23,
        "relation_type": RelationType.CORROBORATES.value,
        "reasoning": "Both RBI and IMF report identical foreign exchange reserves of USD 668.3 billion as of March 31, 2025.",
        "confidence": "high"
    },

    # Case 2: Genuine Contradiction (Net FDI between RBI and IMF)
    {
        "fact_id_a": 21,
        "fact_id_b": 24,
        "relation_type": RelationType.CONTRADICTS.value,
        "reasoning": "Direct conflict in directional flow: RBI reports positive net FDI inflows of +USD 0.4 billion in FY24-25, whereas the IMF reports negative net FDI (outflow) of -USD 1.0 billion for the same fiscal year.",
        "confidence": "high"
    },

    # Case 3: Reconcilable (GDP: Economic Survey 6.4% vs RBI 6.5%)
    {
        "fact_id_a": 15,
        "fact_id_b": 18,
        "relation_type": RelationType.RECONCILABLE.value,
        "reasoning": "Apparent discrepancy explained by data release vintage: Economic Survey relied on MoSPI First Advance Estimates (6.4%) published in January 2025, while RBI had access to Second Advance Estimates (6.5%) published Feb 28, 2025 reflecting stronger Q3 data.",
        "confidence": "high"
    },
    # Reconcilable (Inflation: Economic Survey 4.9% vs RBI 4.6%)
    {
        "fact_id_a": 16,
        "fact_id_b": 19,
        "relation_type": RelationType.RECONCILABLE.value,
        "reasoning": "Apparent discrepancy explained by time period: Economic Survey covers 9 months (Apr-Dec 2024) during which vegetable prices spiked, whereas RBI covers the full 12-month year, capturing the massive 38% winter vegetable disinflation in Q4.",
        "confidence": "high"
    },
    # Reconcilable (Team Size: 63,713 vs 98,135)
    {
        "fact_id_a": 9,
        "fact_id_b": 13,
        "relation_type": RelationType.RECONCILABLE.value,
        "reasoning": "Apparent conflict explained by metric scope: 63,713 in Doc 3 includes only permanent employees and contract staff. Adding the 34,422 partner agents explicitly disclosed in Doc 3 gives 63,713 + 34,422 = 98,135, which exactly equals the total workforce in Doc 2.",
        "confidence": "high"
    },
    # Reconcilable (CIN: U63090DL vs L63090DL)
    {
        "fact_id_a": 2,
        "fact_id_b": 6,
        "relation_type": RelationType.RECONCILABLE.value,
        "reasoning": "Apparent discrepancy explained by corporate lifecycle: 'U' prefix in 2022 denotes an unlisted public entity; 'L' prefix in 2024 denotes listed status following Delhivery's IPO on BSE/NSE in May 2022.",
        "confidence": "high"
    }
]

async def seed_data():
    db_path = Path(settings.DATABASE_PATH).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Connecting to database at {db_path}...")

    async with aiosqlite.connect(db_path) as db:
        # Create tables
        await db.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                filepath TEXT,
                upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                page_count INTEGER DEFAULT 0,
                status TEXT NOT NULL,
                error_message TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                statement TEXT NOT NULL,
                category TEXT,
                fact_type TEXT,
                value TEXT,
                unit TEXT,
                time_context TEXT,
                scope_context TEXT,
                source_quote TEXT,
                page_number INTEGER,
                confidence TEXT,
                qualifiers TEXT,
                metadata TEXT,
                embedding_id TEXT,
                FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS relations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fact_id_a INTEGER,
                fact_id_b INTEGER,
                relation_type TEXT NOT NULL,
                reasoning TEXT NOT NULL,
                confidence TEXT,
                FOREIGN KEY (fact_id_a) REFERENCES facts (id) ON DELETE CASCADE,
                FOREIGN KEY (fact_id_b) REFERENCES facts (id) ON DELETE CASCADE
            )
        """)
        await db.commit()

        # Clear existing to ensure clean seed
        await db.execute("DELETE FROM relations")
        await db.execute("DELETE FROM facts")
        await db.execute("DELETE FROM documents")
        await db.commit()

        # Insert documents
        for doc in SAMPLE_DOCUMENTS:
            await db.execute(
                "INSERT INTO documents (id, filename, filepath, page_count, status) VALUES (?, ?, ?, ?, ?)",
                (doc["id"], doc["filename"], doc["filepath"], doc["page_count"], doc["status"])
            )

        # Insert facts
        for fact in SAMPLE_FACTS:
            qualifiers = json.dumps(fact.get("qualifiers", []))
            metadata = json.dumps(fact.get("metadata", {}))
            await db.execute("""
                INSERT INTO facts (
                    id, document_id, statement, category, fact_type, value, unit,
                    time_context, scope_context, source_quote, page_number,
                    confidence, qualifiers, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                fact["id"], fact["document_id"], fact["statement"], fact["category"],
                fact["fact_type"], fact.get("value"), fact.get("unit"),
                fact.get("time_context"), fact.get("scope_context"),
                fact["source_quote"], fact.get("page_number"),
                fact["confidence"], qualifiers, metadata
            ))

        # Insert relations
        for rel in SAMPLE_RELATIONS:
            await db.execute("""
                INSERT INTO relations (fact_id_a, fact_id_b, relation_type, reasoning, confidence)
                VALUES (?, ?, ?, ?, ?)
            """, (
                rel["fact_id_a"], rel["fact_id_b"], rel["relation_type"],
                rel["reasoning"], rel["confidence"]
            ))

        await db.commit()

        # Export sample_output/sample_data.json for evaluators
        export_path = (Path(settings.DATABASE_PATH).parent.parent / "sample_output" / "sample_data.json").resolve()
        export_path.parent.mkdir(parents=True, exist_ok=True)
        with open(export_path, "w", encoding="utf-8") as f:
            json.dump({
                "documents": SAMPLE_DOCUMENTS,
                "facts": SAMPLE_FACTS,
                "relations": SAMPLE_RELATIONS
            }, f, indent=2)

        print(f"Successfully seeded {len(SAMPLE_DOCUMENTS)} documents, {len(SAMPLE_FACTS)} facts, and {len(SAMPLE_RELATIONS)} relations!")
        print(f"Exported sample data to {export_path}")

if __name__ == "__main__":
    asyncio.run(seed_data())
