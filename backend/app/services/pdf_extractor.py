import pymupdf
from dataclasses import dataclass
from typing import List
import logging

logger = logging.getLogger(__name__)

@dataclass
class PageContent:
    page_number: int
    text: str
    tables: List[str]

class PDFExtractorService:
    def extract_text(self, filepath: str) -> List[PageContent]:
        pages = []
        try:
            doc = pymupdf.open(filepath)
            for i, page in enumerate(doc):
                page_text = page.get_text("text").strip()
                
                tables_md = []
                try:
                    tabs = page.find_tables()
                    for tab in tabs:
                        md = tab.to_markdown()
                        if md and md.strip():
                            tables_md.append(md.strip())
                except Exception as te:
                    logger.debug(f"Table parsing skipped on page {i+1}: {te}")
                
                if page_text or tables_md:
                    pages.append(PageContent(
                        page_number=i + 1,
                        text=page_text,
                        tables=tables_md
                    ))
            doc.close()
            return pages
        except Exception as e:
            logger.error(f"Error extracting text from PDF {filepath}: {e}")
            return []

pdf_extractor = PDFExtractorService()
