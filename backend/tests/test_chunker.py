from app.services.chunker import chunker
from app.services.pdf_extractor import PageContent

def test_chunker_basic_splitting():
    pages = [
        PageContent(page_number=1, text="Paragraph one content about company history.\n\nParagraph two with financial highlights.", tables=[]),
        PageContent(page_number=2, text="Paragraph three details the operations and PIN code reach.", tables=[])
    ]
    chunks = chunker.chunk_document(pages, chunk_size=500, overlap=50)
    assert len(chunks) >= 1
    assert chunks[0].page_start == 1
    assert "company history" in chunks[0].text

def test_chunker_table_preservation():
    table_md = "| Metric | FY23 | FY24 |\n| --- | --- | --- |\n| Revenue | 7224 | 8142 |\n"
    pages = [
        PageContent(page_number=5, text="Operational overview below:", tables=[table_md])
    ]
    chunks = chunker.chunk_document(pages, chunk_size=1000, overlap=50)
    assert len(chunks) == 1
    assert "| Revenue | 7224 | 8142 |" in chunks[0].text
