from typing import List, Set
from app.detectors.base import BaseSmellDetector
from app.parser.schema_models import (
    DetectedSmell,
    SchemaInfo,
    SmellCategory,
    SmellSeverity,
)

class UnindexedForeignKeyDetector(BaseSmellDetector):
    id = "SMELL_UNINDEXED_FK"
    name = "Unindexed Foreign Key"
    category = SmellCategory.PERFORMANCE
    severity = SmellSeverity.HIGH

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            # Gather indexed column prefixes
            indexed_prefixes: Set[str] = set()
            for idx in table.indexes:
                if idx.column_names:
                    # The leading column of an index can service lookups on that column
                    indexed_prefixes.add(idx.column_names[0].lower())

            # Primary key also indexes its leading column
            if table.primary_keys:
                indexed_prefixes.add(table.primary_keys[0].lower())

            for fk in table.foreign_keys:
                for fk_col in fk.column_names:
                    if fk_col.lower() not in indexed_prefixes:
                        idx_name = f"idx_{table_name}_{fk_col}"
                        suggested_sql = f"CREATE INDEX {idx_name} ON {table_name} ({fk_col});"
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{fk_col}",
                                title=f"Foreign Key '{fk_col}' in '{table_name}' is not indexed",
                                category=self.category,
                                severity=self.severity,
                                table_name=table_name,
                                column_name=fk_col,
                                description=(
                                    f"The foreign key column '{fk_col}' referencing '{fk.foreign_table}' "
                                    f"does not have an index on '{table_name}'."
                                ),
                                dbms_theory=(
                                    "Foreign Key Indexing & Table Locks: Unlike primary keys, DBMS engines do not "
                                    "automatically create indexes for foreign keys. When rows in the parent table "
                                    "('{fk.foreign_table}') are updated or deleted, the DBMS must search '{table_name}' "
                                    "to enforce referential integrity. Without an index on '{fk_col}', this check requires "
                                    "a full sequential table scan and can acquire table-level share locks, bringing "
                                    "concurrency to a halt."
                                ),
                                impact="Full table scans on JOINs; severe locks and latency spikes during parent row DELETE/UPDATE operations.",
                                remediation=f"Create a B-Tree index on '{fk_col}' in '{table_name}'.",
                                suggested_sql=suggested_sql,
                            )
                        )
        return smells

class DuplicateIndexDetector(BaseSmellDetector):
    id = "SMELL_DUPLICATE_INDEX"
    name = "Duplicate / Redundant Index"
    category = SmellCategory.PERFORMANCE
    severity = SmellSeverity.MEDIUM

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            indexes = table.indexes
            n = len(indexes)
            for i in range(n):
                idx1 = indexes[i]
                cols1 = [c.lower() for c in idx1.column_names]
                for j in range(i + 1, n):
                    idx2 = indexes[j]
                    cols2 = [c.lower() for c in idx2.column_names]

                    # Exact duplicate
                    if cols1 == cols2:
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{idx1.name}_{idx2.name}",
                                title=f"Exact duplicate indexes '{idx1.name}' and '{idx2.name}' on '{table_name}'",
                                category=self.category,
                                severity=self.severity,
                                table_name=table_name,
                                column_name=", ".join(idx1.column_names),
                                description=f"Indexes '{idx1.name}' and '{idx2.name}' cover the exact same columns ({', '.join(idx1.column_names)}).",
                                dbms_theory=(
                                    "B-Tree Index Maintenance Overhead: Every index incurs write penalty during INSERT, "
                                    "UPDATE, and DELETE operations because the DBMS storage engine must traverse and update "
                                    "each B-Tree structure and perform WAL logging. Identical indexes double write overhead "
                                    "and buffer cache consumption with zero query planner benefit."
                                ),
                                impact="Doubled write latency on modifications; wasted storage and memory in buffer pool.",
                                remediation=f"Drop redundant index '{idx2.name}'.",
                                suggested_sql=f"DROP INDEX {idx2.name};",
                            )
                        )
                    # Prefix redundancy: cols1 is a prefix of cols2
                    elif len(cols1) < len(cols2) and cols2[:len(cols1)] == cols1:
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{idx1.name}_prefix",
                                title=f"Index '{idx1.name}' ({', '.join(idx1.column_names)}) is redundant to composite index '{idx2.name}' ({', '.join(idx2.column_names)})",
                                category=self.category,
                                severity=self.severity,
                                table_name=table_name,
                                column_name=", ".join(idx1.column_names),
                                description=(
                                    f"Index '{idx1.name}' covers columns ({', '.join(idx1.column_names)}), which is already "
                                    f"the leftmost prefix of index '{idx2.name}' ({', '.join(idx2.column_names)})."
                                ),
                                dbms_theory=(
                                    "Leftmost Prefix Rule of Composite Indexes: In B-Tree index structures, an index on (A, B) "
                                    "can satisfy any query filtering on (A) or on (A, B). Therefore, a separate index on just (A) "
                                    "is completely redundant."
                                ),
                                impact="Wasted memory in DB buffer pool and unnecessary write penalty during inserts/updates.",
                                remediation=f"Drop index '{idx1.name}' as '{idx2.name}' already covers queries on its leading columns.",
                                suggested_sql=f"DROP INDEX {idx1.name};",
                            )
                        )
        return smells