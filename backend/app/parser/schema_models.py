from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class SmellSeverity(str, Enum):
    CRITICAL = 'CRITICAL'
    HIGH = 'HIGH'
    MEDIUM = 'MEDIUM'
    LOW = 'LOW'

class SmellCategory(str, Enum):
    INTEGRITY = 'INTEGRITY'
    NORMALIZATION = 'NORMALIZATION'
    TYPES_AND_NAMING = 'TYPES_AND_NAMING'
    PERFORMANCE = 'PERFORMANCE'

class ColumnInfo(BaseModel):
    name: str
    data_type: str
    is_nullable: bool = True
    is_primary_key: bool = False
    is_unique: bool = False
    default_value: Optional[str] = None

class ForeignKeyInfo(BaseModel):
    column_names: List[str]
    foreign_table: str
    foreign_columns: List[str]
    constraint_name: Optional[str] = None
    on_delete: Optional[str] = None
    on_update: Optional[str] = None

class IndexInfo(BaseModel):
    name: str
    column_names: List[str]
    is_unique: bool = False

class TableInfo(BaseModel):
    name: str
    columns: List[ColumnInfo] = Field(default_factory=list)
    primary_keys: List[str] = Field(default_factory=list)
    foreign_keys: List[ForeignKeyInfo] = Field(default_factory=list)
    indexes: List[IndexInfo] = Field(default_factory=list)
    raw_sql: Optional[str] = None

class SchemaInfo(BaseModel):
    tables: Dict[str, TableInfo] = Field(default_factory=dict)
    raw_sql: str = ''
    dialect: str = 'postgres'

class DetectedSmell(BaseModel):
    id: str
    title: str
    category: SmellCategory
    severity: SmellSeverity
    table_name: str
    column_name: Optional[str] = None
    description: str
    dbms_theory: str
    impact: str
    remediation: str
    suggested_sql: Optional[str] = None

class CategoryScore(BaseModel):
    category: SmellCategory
    name: str
    score: int
    deductions: int
    smell_count: int
    status: str

class SchemaMetrics(BaseModel):
    total_tables: int
    total_columns: int
    total_foreign_keys: int
    total_indexes: int
    tables_without_pk: int
    smells_by_severity: Dict[str, int]
    smells_by_category: Dict[str, int]

class SchemaAnalysisResult(BaseModel):
    dialect: str
    overall_score: int
    grade: str
    summary_text: str
    metrics: SchemaMetrics
    category_scores: List[CategoryScore]
    tables: List[TableInfo]
    smells: List[DetectedSmell]
    refactored_sql: Optional[str] = None
    migration_sql: Optional[str] = None
