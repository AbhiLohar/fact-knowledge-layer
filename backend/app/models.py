from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ProcessingStatus(str, Enum):
    PENDING = "PENDING"
    EXTRACTING = "EXTRACTING"
    ANALYZING = "ANALYZING"
    COMPARING = "COMPARING"
    COMPLETE = "COMPLETE"
    ERROR = "ERROR"

class RelationType(str, Enum):
    CORROBORATES = "CORROBORATES"
    CONTRADICTS = "CONTRADICTS"
    RECONCILABLE = "RECONCILABLE"
    RELATED = "RELATED"

class DocumentCreate(BaseModel):
    filename: str

class DocumentResponse(BaseModel):
    id: int
    filename: str
    upload_time: str
    page_count: int
    status: ProcessingStatus
    fact_count: int = 0
    error_message: Optional[str] = None

class FactBase(BaseModel):
    statement: str
    category: str = Field(description="financial, operational, corporate, market, regulatory, personnel, or legal")
    fact_type: str = Field(description="numerical, temporal, entity, claim, or relationship")
    value: Optional[str] = None
    unit: Optional[str] = None
    time_context: Optional[str] = None
    scope_context: Optional[str] = None
    source_quote: str
    page_number: Optional[int] = None
    confidence: str = Field(description="high, medium, low")
    qualifiers: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class FactResponse(FactBase):
    id: int
    document_id: int
    document_name: str

class RelationResponse(BaseModel):
    id: int
    fact_a: FactResponse
    fact_b: FactResponse
    relation_type: RelationType
    reasoning: str
    confidence: str
