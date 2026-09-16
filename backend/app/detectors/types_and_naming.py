from typing import List
from app.detectors.base import BaseSmellDetector
from app.parser.schema_models import (
    DetectedSmell,
    SchemaInfo,
    SmellCategory,
    SmellSeverity,
)

class GenericTypeDetector(BaseSmellDetector):
    id = "SMELL_GENERIC_TYPE"
    name = "Fear of the Unknown (Overly Generic Column Types)"
    category = SmellCategory.TYPES_AND_NAMING
    severity = SmellSeverity.HIGH

    DATE_HINTS = ["date", "time", "created_at", "updated_at", "timestamp", "dob", "birth_date", "expiry_date", "deleted_at"]
    NUMERIC_HINTS = ["price", "amount", "cost", "total", "balance", "quantity", "count", "salary", "discount"]
    BOOLEAN_HINTS = ["is_", "has_", "can_", "should_"]

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            for col in table.columns:
                col_name = col.name.lower()
                dtype = col.data_type.upper()
                is_text = any(t in dtype for t in ["VARCHAR", "TEXT", "CHAR", "STRING"])

                if is_text:
                    # Check for Date/Timestamp stored as text
                    if any(hint in col_name for hint in self.DATE_HINTS):
                        suggested_sql = f"ALTER TABLE {table_name} ALTER COLUMN {col.name} TYPE TIMESTAMP USING {col.name}::TIMESTAMP;"
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{col.name}_date",
                                title=f"Temporal column '{col.name}' in '{table_name}' is stored as generic '{col.data_type}'",
                                category=self.category,
                                severity=self.severity,
                                table_name=table_name,
                                column_name=col.name,
                                description=(
                                    f"Column '{col.name}' represents a date/time value but is declared as {col.data_type}."
                                ),
                                dbms_theory=(
                                    "Domain Integrity & Temporal Operations: Storing dates as strings loses all date math "
                                    "(e.g., INTERVAL, EXTRACT, DATE_TRUNC), prevents DBMS timestamp formatting validation, "
                                    "and allows invalid dates like '2023-02-31' or format mismatches ('MM/DD/YYYY' vs 'YYYY-MM-DD'). "
                                    "Native TIMESTAMP types are stored as compact 8-byte integers, reducing storage and enabling "
                                    "lightning-fast B-Tree range comparisons."
                                ),
                                impact="Inability to perform date arithmetic or range queries accurately; storage waste; invalid date strings allowed.",
                                remediation="Convert column type to TIMESTAMP, TIMESTAMPTZ, or DATE.",
                                suggested_sql=suggested_sql,
                            )
                        )
                    # Check for Numeric/Monetary stored as text
                    elif any(hint == col_name or col_name.endswith(f"_{hint}") or col_name.startswith(f"{hint}_") for hint in self.NUMERIC_HINTS):
                        suggested_sql = f"ALTER TABLE {table_name} ALTER COLUMN {col.name} TYPE NUMERIC(12, 2) USING {col.name}::NUMERIC;"
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{col.name}_numeric",
                                title=f"Numeric/Monetary column '{col.name}' in '{table_name}' is stored as generic '{col.data_type}'",
                                category=self.category,
                                severity=self.severity,
                                table_name=table_name,
                                column_name=col.name,
                                description=(
                                    f"Column '{col.name}' represents a numeric/financial value but is declared as {col.data_type}."
                                ),
                                dbms_theory=(
                                    "Domain Integrity & Arithmetic Semantics: Strings sort lexicographically ('100' comes before '20'), "
                                    "breaking ORDER BY, MAX(), MIN(), and SUM() aggregates. Numeric types (DECIMAL/NUMERIC) ensure "
                                    "exact fixed-point arithmetic required for monetary calculation without floating-point inaccuracies."
                                ),
                                impact="Lexicographic sorting bugs in ORDER BY; SUM() and AVG() queries fail or require explicit casts; text characters can pollute financial data.",
                                remediation="Convert column type to DECIMAL(12,2), NUMERIC, or INTEGER.",
                                suggested_sql=suggested_sql,
                            )
                        )
                    # Check for Boolean stored as text
                    elif any(col_name.startswith(hint) for hint in self.BOOLEAN_HINTS) and not col_name.endswith(("_id", "_name", "_type", "_url")):
                        suggested_sql = f"ALTER TABLE {table_name} ALTER COLUMN {col.name} TYPE BOOLEAN USING ({col.name} = 'true');"
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{col.name}_bool",
                                title=f"Boolean flag '{col.name}' in '{table_name}' is stored as generic '{col.data_type}'",
                                category=self.category,
                                severity=SmellSeverity.MEDIUM,
                                table_name=table_name,
                                column_name=col.name,
                                description=(
                                    f"Column '{col.name}' represents a boolean truth value but is declared as {col.data_type}."
                                ),
                                dbms_theory=(
                                    "Boolean Logic & Bit-packed Storage: Storing flags as 'Y'/'N', 'true'/'false', or '1'/'0' "
                                    "in strings wastes storage and allows corrupt values ('maybe', 'T', 'null', 'yes'). Native BOOLEAN "
                                    "types enforce binary logic and allow compact bitmap index compression."
                                ),
                                impact="Disparate string representations ('Y', 'YES', 'true', '1') break boolean WHERE clauses.",
                                remediation="Convert column type to native BOOLEAN or TINYINT(1).",
                                suggested_sql=suggested_sql,
                            )
                        )
        return smells

class ExcessiveNullabilityDetector(BaseSmellDetector):
    id = "SMELL_EXCESSIVE_NULLABILITY"
    name = "Excessive Nullability (Subtyping Antipattern)"
    category = SmellCategory.TYPES_AND_NAMING
    severity = SmellSeverity.MEDIUM
    NULL_PERCENT_THRESHOLD = 0.60

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            if len(table.columns) < 5:
                continue

            nullable_cols = [c for c in table.columns if c.is_nullable and not c.is_primary_key]
            null_ratio = len(nullable_cols) / len(table.columns)

            if null_ratio >= self.NULL_PERCENT_THRESHOLD:
                pct = int(null_ratio * 100)
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}",
                        title=f"Table '{table_name}' has {pct}% nullable columns ({len(nullable_cols)} of {len(table.columns)})",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=None,
                        description=(
                            f"{pct}% of columns in '{table_name}' allow NULL values. "
                            f"This indicates poor subtype modeling (Single Table Inheritance anti-pattern)."
                        ),
                        dbms_theory=(
                            "Three-Valued Logic & Subtype Relational Patterns: When many columns are nullable, it usually "
                            "signals that distinct subtypes (e.g., Corporate Customer vs Individual Customer) are crammed "
                            "into a single table. In relational algebra, columns that only apply to certain subtypes violate "
                            "domain cohesion. In physical storage, NULL bitmap overhead increases row fragmentation."
                        ),
                        impact="Requires complex COALESCE and IS NOT NULL queries; prevents NOT NULL constraints on business-critical fields.",
                        remediation="Model subtypes using Class Table Inheritance (separate tables for specific subtype attributes with a 1:1 foreign key to the parent).",
                        suggested_sql=f"-- Consider splitting subtype-specific nullable columns into separate 1:1 extension tables.",
                    )
                )
        return smells

class BooleanExplosionDetector(BaseSmellDetector):
    id = "SMELL_BOOLEAN_EXPLOSION"
    name = "Boolean Flag Explosion (Implicit State Machine)"
    category = SmellCategory.TYPES_AND_NAMING
    severity = SmellSeverity.MEDIUM
    FLAG_THRESHOLD = 4

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            flag_cols = []
            for col in table.columns:
                col_lower = col.name.lower()
                dtype = col.data_type.upper()
                is_bool_type = any(b in dtype for b in ["BOOL", "TINYINT(1)", "BIT"])
                is_flag_name = col_lower.startswith(("is_", "has_", "can_", "flag_"))
                if is_bool_type or is_flag_name:
                    flag_cols.append(col.name)

            if len(flag_cols) >= self.FLAG_THRESHOLD:
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}",
                        title=f"Table '{table_name}' contains {len(flag_cols)} boolean flags",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=", ".join(flag_cols),
                        description=(
                            f"The table '{table_name}' has {len(flag_cols)} flags: {', '.join(flag_cols)}. "
                            f"This suggests an unmodeled state machine or status lifecycle."
                        ),
                        dbms_theory=(
                            "State Machine Modeling vs Flag Proliferation: Having many independent boolean flags allows "
                            "contradictory states (e.g. is_pending=TRUE AND is_approved=TRUE AND is_rejected=TRUE). "
                            "Relational modeling handles lifecycles using a single 'status' column constrained by a "
                            "foreign key lookup table or ENUM, ensuring valid state transitions."
                        ),
                        impact="Impossible or conflicting state combinations occur easily; indexes on boolean flags have poor selectivity (high cardinality skew).",
                        remediation="Replace conflicting boolean flags with an explicit 'status' column and a lookup table or ENUM type.",
                        suggested_sql=(
                            f"CREATE TYPE {table_name}_status AS ENUM ('draft', 'pending', 'active', 'archived');\n"
                            f"ALTER TABLE {table_name} ADD COLUMN status {table_name}_status DEFAULT 'draft';"
                        ),
                    )
                )
        return smells

class ReservedWordDetector(BaseSmellDetector):
    id = "SMELL_RESERVED_KEYWORD"
    name = "SQL Reserved Keyword as Identifier"
    category = SmellCategory.TYPES_AND_NAMING
    severity = SmellSeverity.LOW

    RESERVED_WORDS = {
        "user", "order", "group", "table", "desc", "asc", "select", "where",
        "from", "into", "key", "check", "by", "default", "limit", "offset",
        "values", "index", "column", "alter", "drop", "create", "all", "any"
    }

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            if table_name.lower() in self.RESERVED_WORDS:
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}",
                        title=f"Table name '{table_name}' is a reserved SQL keyword",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=None,
                        description=f"'{table_name}' is a standard SQL reserved keyword.",
                        dbms_theory=(
                            "Lexical Grammar & Parser Ambiguity: Using reserved words as table or column identifiers "
                            "requires explicit quoting in queries (e.g. \"user\" or `order`). Failure to quote creates "
                            "syntax errors, breaks ORM query generators, and creates cross-dialect porting issues."
                        ),
                        impact="Syntax errors during raw SQL queries; dialect-dependent quoting required in all application code.",
                        remediation=f"Rename '{table_name}' to a plural or more descriptive identifier (e.g. '{table_name}s' or 'app_{table_name}').",
                        suggested_sql=f"ALTER TABLE \"{table_name}\" RENAME TO \"{table_name}s\";",
                    )
                )

            for col in table.columns:
                if col.name.lower() in self.RESERVED_WORDS:
                    smells.append(
                        DetectedSmell(
                            id=f"{self.id}_{table_name}_{col.name}",
                            title=f"Column name '{col.name}' in '{table_name}' is a reserved SQL keyword",
                            category=self.category,
                            severity=self.severity,
                            table_name=table_name,
                            column_name=col.name,
                            description=f"Column '{col.name}' matches a reserved SQL keyword.",
                            dbms_theory=(
                                "SQL Lexical Scoping: Reserved keywords clash with parser grammars in SELECT, WHERE, and GROUP BY clauses."
                            ),
                            impact="Forces quotes in SQL queries; causes hard-to-debug parsing errors in application code.",
                            remediation=f"Rename column '{col.name}' to a descriptive non-reserved identifier.",
                            suggested_sql=f"ALTER TABLE {table_name} RENAME COLUMN \"{col.name}\" TO \"{col.name}_val\";",
                        )
                    )
        return smells