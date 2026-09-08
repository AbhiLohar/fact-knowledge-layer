# Fact Knowledge Layer – 3-Minute Demo Video Walkthrough Guide

This guide gives you a **second-by-second script**, **exact screen actions**, **click sequences**, and **verbal lines** to deliver a top-tier 3-minute video presentation for evaluators.

---

## 📋 Pre-Recording Checklist (Do This Before Pressing Record)

1. **Verify Backend is Running:**
   - URL: `http://127.0.0.1:8000`
   - Test by opening `http://127.0.0.1:8000/docs` in your browser.

2. **Verify Frontend is Running:**
   - URL: `http://localhost:5173`
   - Open Chrome or Edge in full screen (`F11` or maximized window).

3. **Have Starter PDF Ready on Desktop or Folder:**
   - PDF Path: `starter-datasets/delhivery/03-delhivery-q4-fy24-earnings-presentation.pdf`
   - Keep this folder open in a small side window for easy drag-and-drop.

4. **Screen and Audio Setup:**
   - Set resolution to **1080p (1920x1080)**.
   - Use **Loom**, **OBS Studio**, or **Windows Game Bar** (`Win + G`).
   - Test your microphone for clear audio with no background noise.
   - Keep the browser on **Showcase** or **Upload** page as your starting screen.

---

## ⏱️ Video Structure Overview (3 Minutes Total)

| Section | Time Window | Duration | Main Focus |
|---|---|---|---|
| **1. Hook & Architecture Overview** | `0:00 – 0:35` | 35 sec | Introduction, problem solved, high-level architecture |
| **2. Document Ingestion & Pipeline** | `0:35 – 1:15` | 40 sec | Live upload, 3-step pipeline, sub-10s extraction |
| **3. Fact Explorer & Grounding** | `1:15 – 1:45` | 30 sec | Verbatim quotes, metadata, page citations, search/filters |
| **4. The 4 Required Cases Showcase** | `1:45 – 2:40` | 55 sec | Corroboration, Contradiction, Reconcilable, Extraction Failure |
| **5. Technical Edge & Wrap-up** | `2:40 – 3:00` | 20 sec | Fast PyMuPDF, ChromaDB, Linear/Vercel UI, conclusion |

---

## 🎬 Second-by-Second Script & Screen Directions

---

### Part 1: Introduction & Architecture Overview (`0:00 – 0:35`)

**🖥️ On Screen:**
- Start on the **Showcase** page or **Upload** page of the web app (`http://localhost:5173`).
- Toggle between Light and Dark mode once using the sun/moon button in the top-right to showcase the B2B SaaS UI design.

**🗣️ What to Speak:**
> *"Hello everyone! Today I’m excited to present the **Fact Knowledge Layer** — a generalized enterprise system designed to extract, ground, and reconcile factual intelligence across multi-format PDF filings, annual reports, and economic surveys.*
>
> *When dealing with large corporate filings, numbers and corporate events often conflict or change across periods. Our engine transforms unstructured PDFs into structured, verifiable atomic facts and computes cross-document relationships: identifying what corroborates, what contradicts, and what can be reconciled through context."*

---

### Part 2: Live Ingestion & Extraction Pipeline (`0:35 – 1:15`)

**🖥️ On Screen:**
1. Click on **"Upload"** in the sidebar.
2. Point out the existing ingested documents in the list (Delhivery reports and India Macro datasets).
3. Drag and drop `03-delhivery-q4-fy24-earnings-presentation.pdf` into the upload dropzone.
4. Highlight the live status badge transition:
   - `Step 1/3: Extracting text & tabular data with PyMuPDF...`
   - `Step 2/3: Extracting and grounding atomic facts...`
   - `Step 3/3: Cross-document comparison & reconciliation...`
5. Show the document turning to a green **"COMPLETE"** badge with facts extracted in under 10 seconds.

**🗣️ What to Speak:**
> *"Let's see document ingestion in action. I'll navigate to the Document Ingestion page.*
>
> *Here, I'm uploading the Delhivery Q4 FY24 Earnings Presentation. Our ingestion pipeline runs a 3-step automated workflow:*
> 1. *First, high-speed layout and table extraction using native PyMuPDF, extracting tabular financial data directly to clean Markdown.*
> 2. *Second, schema-governed atomic fact extraction with strict temporal precision and verbatim grounding.*
> 3. *And third, semantic vectorization with ChromaDB followed by automated cross-document comparison.*
>
> *Notice how fast it finishes — in just a few seconds, the entire document is processed, grounded, and integrated into our knowledge base."*

---

### Part 3: Fact Explorer & Verbatim Grounding (`1:15 – 1:45`)

**🖥️ On Screen:**
1. Click on **"Facts"** in the sidebar.
2. Show the top filter bar (Categories: Financial, Operational, Corporate, etc., and Search bar).
3. Type `"revenue"` in the search bar or select the `"Financial"` category filter.
4. Expand one of the fact cards (e.g., Delhivery Revenue FY24: ₹81,415.38 Million).
5. Highlight:
   - **Normalized Value & Unit** (`₹81,415.38` `₹ million`)
   - **Time Context** (`FY2023-24`)
   - **Verbatim Source Quote** (italicized proof directly from the PDF)
   - **Page Number** citation

**🗣️ What to Speak:**
> *"Now let's head to the Fact Explorer. Here, every single fact is decomposed into an atomic, typed record.*
>
> *Notice our grounding guarantees: every fact preserves its explicit time horizon, entity scope, normalized numerical value, and most importantly, an exact verbatim source quote with the exact page citation.*
>
> *This eliminates hallucination and gives financial analysts instant auditability back to the original source document."*

---

### Part 4: The 4 Required Evaluation Cases (`1:45 – 2:40`)

**🖥️ On Screen:**
1. Click on **"Showcase"** in the sidebar (or navigate via **Relations** tabs).
2. Scroll through each of the four highlighted case cards one by one:

#### Case 1: Corroboration (Green Card)
- **Show:** Delhivery Revenue FY24 reported in the Annual Report vs. Earnings Presentation.
- **Explain:** Both documents confirm revenue of ₹81,415.38 Million (or ₹8,142 Crore). The system automatically detects numerical equivalence despite different document sources.

#### Case 2: Direct Contradiction (Red Card)
- **Show:** The conflicting figures or projections across documents for the exact same reporting period.
- **Explain:** The engine flags direct incompatibilities where facts claim conflicting numbers without temporal justification.

#### Case 3: Reconcilable Discrepancy (Amber Card)
- **Show:** Delhivery incorporation date vs. name change date, OR FY21 revenue vs FY24 revenue.
- **Explain:** Point to the **Reasoning Box**:
  > *"Fact A states incorporation on June 22, 2011 as SSN Logistics; Fact B states Delhivery Limited incorporation in 2022. The engine correctly reconciles this: it was not a contradiction, but a legal corporate name change upon conversion to a public company."*

#### Case 4: Known Extraction Failure & Mitigation (Purple/Gray Card)
- **Show:** Complex multi-column graphic table / merged headers failure mode.
- **Explain:** Explain how complex visual PDF layouts can merge adjacent columns, and how our system mitigates this with PyMuPDF table detection and fallback heuristic grounding.

**🗣️ What to Speak:**
> *"Next, let's explore the core requirement: The Four Evaluation Cases on our Showcase page.*
>
> *Case 1 is **Corroboration**: Here, Delhivery's FY24 revenue of ₹81,415.38 million is independently corroborated between the Annual Report and the Q4 Presentation with high confidence.*
>
> *Case 2 is a **Direct Contradiction**: The system flags conflicting metrics for the identical period where figures cannot logically co-exist.*
>
> *Case 3 is the most powerful: **Reconcilable Differences**. Delhivery’s incorporation is reported as June 22, 2011 in one filing and 2022 in another. Rather than naively flagging a conflict, our LLM reconciliation engine explains in the reasoning box that the company was originally SSN Logistics and converted to Delhivery Limited prior to its IPO.*
>
> *Finally, Case 4 demonstrates **Extraction Failure & Boundary Handling**: Handling dense multi-column tabular graphics where OCR or table borders break, and how our two-layer fallback architecture prevents system crashes."*

---

### Part 5: Technical Architecture & Conclusion (`2:40 – 3:00`)

**🖥️ On Screen:**
1. Switch to **"Relations"** page, click between `All`, `Corroborations`, `Contradictions`, and `Reconcilable` tabs to show the reactive filtering.
2. Toggle theme once more (Light / Dark) to demonstrate modern B2B SaaS aesthetics.
3. Bring mouse to rest on the header logo.

**🗣️ What to Speak:**
> *"Under the hood, the system is built with FastAPI, PyMuPDF, ChromaDB vector indexing, and React with Tailwind CSS following modern Linear-style design principles.*
>
> *The entire repository, sample datasets, pre-computed benchmark outputs, and full test suite are publicly available on GitHub.*
>
> *Thank you for watching!"*

---

## 🎯 Pro Tips for a Winning Demo

1. **Keep Pacing Energetic:** Don't pause awkwardly while waiting for anything — all data loads instantaneously and the upload test completes in under 10 seconds.
2. **Emphasize the Reasoning Box:** Evaluators care most about **why** the system made a decision. Spend an extra 5 seconds highlighting the explanation in the Reconcilable case.
3. **Show Responsive Filtering:** Clicking the `Corroborations`, `Contradictions`, and `Reconcilable` tabs on `RelationsPage` shows that the state management is clean and responsive.
4. **Pronunciation Guide:**
   - *PyMuPDF:* "Pie-Mew-P-D-F"
   - *ChromaDB:* "Kroh-muh-D-B"
   - *Corroborate:* "kuh-ROB-uh-rate"
   - *Reconcilable:* "rek-un-SYE-luh-bull"
