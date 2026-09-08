import pytest
from app.models import FactBase, FactResponse, RelationType, RelationResponse, ProcessingStatus

def test_processing_status_enum():
    assert ProcessingStatus.PENDING == "PENDING"
    assert ProcessingStatus.COMPLETE == "COMPLETE"
    assert ProcessingStatus.ERROR == "ERROR"

def test_relation_type_enum():
    assert RelationType.CORROBORATES == "CORROBORATES"
    assert RelationType.CONTRADICTS == "CONTRADICTS"
    assert RelationType.RECONCILABLE == "RECONCILABLE"
    assert RelationType.RELATED == "RELATED"

def test_fact_model_validation():
    fact = FactBase(
        statement="Delhivery consolidated revenue for FY24 reached ₹81,415.38 million.",
        category="financial",
        fact_type="numerical",
        value="81415.38",
        unit="₹ million",
        time_context="FY2023-24",
        scope_context="Delhivery Consolidated",
        source_quote="Revenue from contracts with customers: (a) Revenue from services: ₹ 81,415.38 million",
        page_number=105,
        confidence="high",
        qualifiers=["audited", "consolidated"]
    )
    assert fact.value == "81415.38"
    assert fact.category == "financial"
    assert len(fact.qualifiers) == 2

def test_relation_model_validation():
    fact_a = FactResponse(
        id=1,
        document_id=1,
        document_name="doc_a.pdf",
        statement="GDP growth in FY25 is 6.4%.",
        category="financial",
        fact_type="numerical",
        value="6.4",
        unit="%",
        source_quote="GDP is estimated at 6.4 percent",
        confidence="high"
    )
    fact_b = FactResponse(
        id=2,
        document_id=2,
        document_name="doc_b.pdf",
        statement="GDP growth in FY25 is 6.5%.",
        category="financial",
        fact_type="numerical",
        value="6.5",
        unit="%",
        source_quote="GDP is placed at 6.5 per cent",
        confidence="high"
    )
    rel = RelationResponse(
        id=10,
        fact_a=fact_a,
        fact_b=fact_b,
        relation_type=RelationType.RECONCILABLE,
        reasoning="Different data vintages (First Advance Estimate vs Second Advance Estimate).",
        confidence="high"
    )
    assert rel.relation_type == RelationType.RECONCILABLE
    assert rel.id == 10
