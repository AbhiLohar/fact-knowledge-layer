import fitz
import pdfplumber
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
            # Extract basic text with PyMuPDF
            doc = fitz.open(filepath)
            
            # Extract tables with pdfplumber
            with pdfplumber.open(filepath) as pdf:
                for i in range(len(doc)):
                    page_text = doc[i].get_text("text").strip()
                    
                    tables_md = []
                    if i < len(pdf.pages):
                        plumber_page = pdf.pages[i]
                        tables = plumber_page.extract_tables()
                        for table in tables:
                            if not table:
                                continue
                            # Convert to markdown
                            md_table = self._table_to_markdown(table)
                            if md_table:
                                tables_md.append(md_table)
                    
                    # Even if page text is empty, tables might exist
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
            
    def _table_to_markdown(self, table: List[List[str]]) -> str:
        # Clean table data
        clean_table = []
        for row in table:
            clean_row = [str(cell).replace('\n', ' ').strip() if cell is not None else "" for cell in row]
            if any(clean_row):
                clean_table.append(clean_row)
                
        if not clean_table:
            return ""
            
        header = clean_table[0]
        md = f"| {' | '.join(header)} |\n"
        md += f"| {' | '.join(['---'] * len(header))} |\n"
        
        for row in clean_table[1:]:
            # Pad row if necessary
            if len(row) < len(header):
                row.extend([""] * (len(header) - len(row)))
            md += f"| {' | '.join(row)} |\n"
            
        return md

pdf_extractor = PDFExtractorService()
