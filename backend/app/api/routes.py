from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.parser.sql_parser import SQLSchemaParser
from app.detectors.engine import SmellDetectionEngine
from app.refactor.fix_generator import RefactorGenerator
from app.samples.sample_schemas import SAMPLE_SCHEMAS, SampleSchemaItem
from app.parser.schema_models import SchemaAnalysisResult

router = APIRouter()

engine = SmellDetectionEngine()
refactorer = RefactorGenerator()

class AnalyzeRequest(BaseModel):
    sql: str
    dialect: Optional[str] = "postgres"

class RefactorRequest(BaseModel):
    sql: str
    dialect: Optional[str] = "postgres"

class RefactorResponse(BaseModel):
    migration_sql: str
    refactored_schema_sql: str

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "Database Schema Smell Detector API"}

@router.get("/samples", response_model=List[SampleSchemaItem])
def get_sample_schemas():
    return list(SAMPLE_SCHEMAS.values())

@router.get("/samples/{sample_id}", response_model=SampleSchemaItem)
def get_sample_schema(sample_id: str):
    if sample_id not in SAMPLE_SCHEMAS:
        raise HTTPException(status_code=404, detail=f"Sample schema '{sample_id}' not found")
    return SAMPLE_SCHEMAS[sample_id]

@router.post("/analyze", response_model=SchemaAnalysisResult)
def analyze_schema(req: AnalyzeRequest):
    if not req.sql or not req.sql.strip():
        raise HTTPException(status_code=400, detail="SQL schema script cannot be empty.")

    dialect = req.dialect or "postgres"
    parser = SQLSchemaParser(dialect=dialect)
    schema_info = parser.parse(req.sql)

    if not schema_info.tables:
        raise HTTPException(
            status_code=400,
            detail="No valid CREATE TABLE statements detected in the provided SQL. Please check SQL syntax."
        )

    # Perform smell detection and score calculation
    result = engine.analyze(schema_info)

    # Generate remediation SQL
    result.migration_sql = refactorer.generate_migration_script(result.smells, dialect=dialect)
    result.refactored_sql = refactorer.generate_refactored_schema(schema_info, result.smells, dialect=dialect)

    return result

@router.post("/refactor", response_model=RefactorResponse)
def generate_fixes(req: RefactorRequest):
    dialect = req.dialect or "postgres"
    parser = SQLSchemaParser(dialect=dialect)
    schema_info = parser.parse(req.sql)
    result = engine.analyze(schema_info)

    mig_sql = refactorer.generate_migration_script(result.smells, dialect=dialect)
    clean_sql = refactorer.generate_refactored_schema(schema_info, result.smells, dialect=dialect)

    return RefactorResponse(
        migration_sql=mig_sql,
        refactored_schema_sql=clean_sql,
    )