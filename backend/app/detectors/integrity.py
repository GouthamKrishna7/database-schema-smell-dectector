from typing import List, Set, Dict
from app.detectors.base import BaseSmellDetector
from app.parser.schema_models import (
    DetectedSmell,
    SchemaInfo,
    SmellCategory,
    SmellSeverity,
)

class MissingPrimaryKeyDetector(BaseSmellDetector):
    id = "SMELL_MISSING_PK"
    name = "Missing Primary Key (Identity Crisis)"
    category = SmellCategory.INTEGRITY
    severity = SmellSeverity.CRITICAL

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            if not table.primary_keys:
                suggested_sql = f"ALTER TABLE {table_name} ADD COLUMN id SERIAL PRIMARY KEY;"
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}",
                        title=f"Table '{table_name}' has no Primary Key",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=None,
                        description=(
                            f"The table '{table_name}' does not define a primary key constraint. "
                            f"Every relational table must have a unique identifier for its tuples."
                        ),
                        dbms_theory=(
                            "Entity Integrity Constraint (Codd's Relational Rule #2): "
                            "In relational algebra, relations are sets of tuples, meaning no two tuples "
                            "can be identical. Without a primary key, modern DBMS storage engines cannot "
                            "create clustered B-tree index structures, leading to inefficient full table scans "
                            "during point updates and row-level locking bottlenecks."
                        ),
                        impact=(
                            "Row updates require full table scans, replication cannot reliably uniquely identify rows, "
                            "and duplicate identical rows may be accidentally inserted."
                        ),
                        remediation="Add a surrogate auto-incrementing integer / UUID primary key, or define a composite natural primary key.",
                        suggested_sql=suggested_sql,
                    )
                )
        return smells

class MissingForeignKeyDetector(BaseSmellDetector):
    id = "SMELL_MISSING_FK"
    name = "Missing Foreign Key (Implicit Relationship)"
    category = SmellCategory.INTEGRITY
    severity = SmellSeverity.HIGH

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        known_tables = {t.lower(): t for t in schema.tables.keys()}

        for table_name, table in schema.tables.items():
            existing_fk_cols = set()
            for fk in table.foreign_keys:
                for col in fk.column_names:
                    existing_fk_cols.add(col.lower())

            for col in table.columns:
                col_name_lower = col.name.lower()
                # If column ends with _id or id_ and is not the table's own primary key
                if (col_name_lower.endswith("_id") or col_name_lower.startswith("id_")) and not col.is_primary_key:
                    if col_name_lower not in existing_fk_cols:
                        # Guess referenced entity
                        target_entity = col_name_lower.replace("_id", "").replace("id_", "")
                        # Check if target entity exists in singular or plural (user -> users, order -> orders)
                        matching_table = None
                        for candidate in [target_entity, f"{target_entity}s", f"{target_entity}es"]:
                            if candidate in known_tables:
                                matching_table = known_tables[candidate]
                                break

                        ref_table_display = matching_table if matching_table else f"{target_entity}s"
                        suggested_sql = (
                            f"ALTER TABLE {table_name} "
                            f"ADD CONSTRAINT fk_{table_name}_{col.name} "
                            f"FOREIGN KEY ({col.name}) REFERENCES {ref_table_display}(id);"
                        )

                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{col.name}",
                                title=f"Column '{col.name}' in '{table_name}' looks like a Foreign Key but has no FK constraint",
                                category=self.category,
                                severity=self.severity,
                                table_name=table_name,
                                column_name=col.name,
                                description=(
                                    f"Column '{col.name}' follows foreign key naming conventions but lacks a formal "
                                    f"FOREIGN KEY constraint referencing '{ref_table_display}'."
                                ),
                                dbms_theory=(
                                    "Referential Integrity Constraint: Relational theory enforces that references between "
                                    "relations must correspond to valid existing primary keys in the referenced relation. "
                                    "Relying on application-level integrity rather than DBMS-level foreign keys allows "
                                    "orphaned child rows and phantom references when parent rows are deleted or modified."
                                ),
                                impact="Orphaned records remain in child tables when parents are deleted, leading to inconsistent join results and corrupted analytics.",
                                remediation=f"Add a FOREIGN KEY constraint referencing the parent table '{ref_table_display}'.",
                                suggested_sql=suggested_sql,
                            )
                        )
        return smells

class OrphanTableDetector(BaseSmellDetector):
    id = "SMELL_ORPHAN_TABLE"
    name = "Orphan / Disconnected Table"
    category = SmellCategory.INTEGRITY
    severity = SmellSeverity.MEDIUM

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        if len(schema.tables) <= 2:
            return smells

        # Track referenced tables
        referenced_tables: Set[str] = set()
        referencing_tables: Set[str] = set()

        for table_name, table in schema.tables.items():
            if table.foreign_keys:
                referencing_tables.add(table_name.lower())
                for fk in table.foreign_keys:
                    referenced_tables.add(fk.foreign_table.lower())

        for table_name, table in schema.tables.items():
            t_lower = table_name.lower()
            # If table does not reference any table AND is not referenced by any table
            if t_lower not in referencing_tables and t_lower not in referenced_tables:
                # Exclude obvious standalone tables like 'migrations', 'schema_versions', 'audit_logs'
                if any(k in t_lower for k in ["migration", "version", "flyway", "liquibase"]):
                    continue

                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}",
                        title=f"Table '{table_name}' is completely disconnected from the relational schema",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=None,
                        description=(
                            f"The table '{table_name}' has no foreign keys linking it to other entities, "
                            f"and no other tables in the schema reference it."
                        ),
                        dbms_theory=(
                            "Relational Cohesion & Schema Architecture: A relational schema models interconnected entities. "
                            "An isolated table in an otherwise relational database suggests that foreign keys were forgotten, "
                            "or that an unnormalized data dump or flat file was imported into the relational engine."
                        ),
                        impact="Loss of relational constraints; risks domain isolation or redundant data storage.",
                        remediation="Verify if this table shares relationships with other entities and establish explicit foreign keys.",
                        suggested_sql=None,
                    )
                )
        return smells

class NullableForeignKeyDetector(BaseSmellDetector):
    id = "SMELL_NULLABLE_FK"
    name = "Nullable Foreign Key"
    category = SmellCategory.INTEGRITY
    severity = SmellSeverity.MEDIUM

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            fk_cols = {}
            for fk in table.foreign_keys:
                for col_name in fk.column_names:
                    fk_cols[col_name.lower()] = fk

            for col in table.columns:
                if col.name.lower() in fk_cols and col.is_nullable:
                    fk = fk_cols[col.name.lower()]
                    smells.append(
                        DetectedSmell(
                            id=f"{self.id}_{table_name}_{col.name}",
                            title=f"Foreign Key '{col.name}' in '{table_name}' allows NULL values",
                            category=self.category,
                            severity=self.severity,
                            table_name=table_name,
                            column_name=col.name,
                            description=(
                                f"The foreign key column '{col.name}' referencing '{fk.foreign_table}' is nullable."
                            ),
                            dbms_theory=(
                                "Three-Valued Logic (3VL) & Optionality: Nullable foreign keys represent optional relationships, "
                                "introducing NULLs into join conditions. Relational joins on NULL evaluate to UNKNOWN, "
                                "requiring OUTER JOINs and complicating query optimization and index usage."
                            ),
                            impact="Complicates SQL queries with NULL checks, risks unassociated records, and slows down index-based join optimization.",
                            remediation="If the relationship is mandatory (total participation), declare the column NOT NULL. If optional, consider a separate associative junction table.",
                            suggested_sql=f"ALTER TABLE {table_name} ALTER COLUMN {col.name} SET NOT NULL;",
                        )
                    )
        return smells

class CircularReferenceDetector(BaseSmellDetector):
    id = "SMELL_CIRCULAR_FK"
    name = "Circular Foreign Key Dependency"
    category = SmellCategory.INTEGRITY
    severity = SmellSeverity.HIGH

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        # Build adjacency graph
        adj: Dict[str, Set[str]] = {}
        for tname, table in schema.tables.items():
            adj[tname.lower()] = set()
            for fk in table.foreign_keys:
                adj[tname.lower()].add(fk.foreign_table.lower())

        reported_pairs = set()
        for t1, refs in adj.items():
            for t2 in refs:
                if t1 != t2 and t2 in adj and t1 in adj[t2]:
                    pair_key = tuple(sorted([t1, t2]))
                    if pair_key not in reported_pairs:
                        reported_pairs.add(pair_key)
                        t1_display = schema.tables.get(t1, table).name
                        t2_display = schema.tables.get(t2, table).name
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{t1}_{t2}",
                                title=f"Circular Foreign Key dependency between '{t1_display}' and '{t2_display}'",
                                category=self.category,
                                severity=self.severity,
                                table_name=t1_display,
                                column_name=None,
                                description=(
                                    f"Table '{t1_display}' references '{t2_display}', while '{t2_display}' "
                                    f"also references '{t1_display}'."
                                ),
                                dbms_theory=(
                                    "Acyclic Dependency in Relational Calculus: Relational tables should form a directed acyclic "
                                    "graph (DAG) of dependencies. Circular dependencies violate topological sorting, preventing "
                                    "deterministic row insertion without temporarily disabling constraints or deferring checks."
                                ),
                                impact="Deadlocks during concurrent inserts, inability to truncate tables, and complex deferred constraint configuration.",
                                remediation="Break the cycle by redesigning the relationship, extracting a 1:1 or M:N junction table, or removing one redundant foreign key.",
                                suggested_sql=None,
                            )
                        )
        return smells