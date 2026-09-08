import os
from pathlib import Path
from app.services.pdf_extractor import pdf_extractor

def test_pdf_extractor_earnings_presentation():
    pdf_path = Path("starter-datasets/delhivery/03-delhivery-q4-fy24-earnings-presentation.pdf").resolve()
    assert pdf_path.exists(), f"File {pdf_path} not found"

    pages = pdf_extractor.extract_text(str(pdf_path))
    assert len(pages) > 0
    # Page 1 or 2 should contain Delhivery
    all_text = " ".join([p.text for p in pages[:5]])
    assert "Delhivery" in all_text or "DELHIVERY" in all_text
