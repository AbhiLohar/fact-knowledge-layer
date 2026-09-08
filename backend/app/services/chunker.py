from dataclasses import dataclass
from typing import List, Optional
import re
from app.services.pdf_extractor import PageContent

@dataclass
class TextChunk:
    text: str
    page_start: int
    page_end: int
    section_title: Optional[str]
    chunk_index: int

class ChunkerService:
    def chunk_document(self, pages: List[PageContent], chunk_size: int = 3000, overlap: int = 200) -> List[TextChunk]:
        chunks = []
        current_text = ""
        current_page_start = pages[0].page_number if pages else 1
        current_section = None
        chunk_index = 0
        
        # Very simple section detection based on ALL CAPS or numbers
        section_pattern = re.compile(r"^(?:[A-Z0-9][A-Z\s]+|\d+\.\s+[A-Z].+)$", re.MULTILINE)
        
        for page in pages:
            text = page.text
            
            # Extract tables if any (append to text)
            for table in page.tables:
                text += f"\n\n{table}\n\n"
                
            sections = list(section_pattern.finditer(text))
            if sections:
                # We could split by section, but for simplicity we append
                pass
                
            paragraphs = text.split('\n\n')
            for p in paragraphs:
                if len(current_text) + len(p) > chunk_size and current_text:
                    chunks.append(TextChunk(
                        text=current_text,
                        page_start=current_page_start,
                        page_end=page.page_number,
                        section_title=current_section,
                        chunk_index=chunk_index
                    ))
                    chunk_index += 1
                    # Keep overlap
                    current_text = current_text[-overlap:] + "\n\n" + p
                    current_page_start = page.page_number
                else:
                    if current_text:
                        current_text += "\n\n" + p
                    else:
                        current_text = p
                        
        if current_text.strip():
            chunks.append(TextChunk(
                text=current_text.strip(),
                page_start=current_page_start,
                page_end=pages[-1].page_number if pages else 1,
                section_title=current_section,
                chunk_index=chunk_index
            ))
            
        return chunks

chunker = ChunkerService()
