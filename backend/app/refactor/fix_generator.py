from typing import List
from app.parser.schema_models import DetectedSmell, SchemaInfo

class RefactorGenerator:
    """
    Generates remediation migration SQL and cleaned full-schema DDL.
    """

    def generate_migration_script(self, smells: List[DetectedSmell], dialect: str = "postgres") -> str:
        lines = [
            f"-- ===========================================================",
            f"-- Automated Schema Smell Remediation Migration Script",
            f"-- Target Dialect: {dialect.upper()}",
            f"-- Total Smells Addressed: {sum(1 for s in smells if s.suggested_sql)}",
            f"-- ===========================================================",
            "",
            "BEGIN TRANSACTION;",
            "",
        ]

        added_sqls = set()
        for s in smells:
            if s.suggested_sql and not s.suggested_sql.startswith("--"):
                sql = s.suggested_sql.strip()
                if sql not in added_sqls:
                    added_sqls.add(sql)
                    lines.append(f"-- [Fix: {s.title}]")
                    lines.append(f"-- Reason: {s.remediation}")
                    lines.append(sql)
                    lines.append("")

        lines.append("COMMIT;")
        lines.append("")
        return "\n".join(lines)

    def generate_refactored_schema(self, schema: SchemaInfo, smells: List[DetectedSmell], dialect: str = "postgres") -> str:
        """
        Synthesizes a clean, normalized relational DDL schema incorporating all best practices.
        """
        output = [
            f"-- ===========================================================",
            f"-- Refactored & Normalized Relational Database Schema",
            f"-- Normalized to 3NF with complete Entity & Referential Integrity",
            f"-- Dialect: {dialect.upper()}",
            f"-- ===========================================================",
            "",
        ]

        # Gather table fixes
        smell_lookup = {}
        for s in smells:
            if s.table_name not in smell_lookup:
                smell_lookup[s.table_name] = []
            smell_lookup[s.table_name].append(s)

        extra_tables = []
        extra_indexes = []

        for table_name, table in schema.tables.items():
            t_smells = smell_lookup.get(table_name, [])

            # Rename reserved keyword table
            final_table_name = f"{table_name}s" if table_name.lower() in ["user", "order", "group", "table"] else table_name

            output.append(f"CREATE TABLE {final_table_name} (")
            col_lines = []

            # Determine primary key
            pks = list(table.primary_keys)
            has_pk = len(pks) > 0

            # If missing PK, inject an id SERIAL PRIMARY KEY
            if not has_pk:
                col_lines.append("    id SERIAL PRIMARY KEY")

            for col in table.columns:
                cname = col.name
                if cname.lower() in ["desc", "key", "by", "order", "user"]:
                    cname = f"{cname}_val"

                # Check if multivalued attribute (1NF smell)
                is_1nf_smell = any(s.column_name == col.name and s.id.startswith("SMELL_1NF") for s in t_smells)
                if is_1nf_smell:
                    # Normalize into child table
                    child_name = f"{final_table_name}_{col.name}"
                    extra_tables.append(
                        f"CREATE TABLE {child_name} (\n"
                        f"    id SERIAL PRIMARY KEY,\n"
                        f"    {final_table_name}_id INT NOT NULL REFERENCES {final_table_name}({pks[0] if pks else 'id'}) ON DELETE CASCADE,\n"
                        f"    val VARCHAR(100) NOT NULL\n"
                        f");"
                    )
                    continue  # do not include raw tags column in parent table

                # Refactor generic types
                ctype = col.data_type.upper()
                col_lower = cname.lower()

                if any(h in col_lower for h in ["created_at", "updated_at", "timestamp", "dob", "birth_date"]):
                    if "VARCHAR" in ctype or "TEXT" in ctype:
                        ctype = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                elif any(h in col_lower for h in ["price", "amount", "total", "cost", "salary"]):
                    if "VARCHAR" in ctype or "TEXT" in ctype:
                        ctype = "NUMERIC(12, 2) NOT NULL DEFAULT 0.00"
                elif col_lower.startswith(("is_", "has_")) and ("VARCHAR" in ctype or "TEXT" in ctype):
                    ctype = "BOOLEAN NOT NULL DEFAULT TRUE"

                null_spec = " NOT NULL" if not col.is_nullable or col.is_primary_key else ""
                pk_spec = " PRIMARY KEY" if col.is_primary_key and len(pks) == 1 else ""
                uq_spec = " UNIQUE" if col.is_unique else ""

                col_lines.append(f"    {cname} {ctype}{null_spec}{pk_spec}{uq_spec}")

            # Composite PK constraint if needed
            if len(pks) > 1:
                col_lines.append(f"    PRIMARY KEY ({', '.join(pks)})")

            # Table foreign keys
            fk_cols_seen = set()
            for fk in table.foreign_keys:
                target_table = f"{fk.foreign_table}s" if fk.foreign_table.lower() in ["user", "order", "group", "table"] else fk.foreign_table
                c_name = fk.constraint_name or f"fk_{final_table_name}_{fk.column_names[0]}"
                ref_cols = ", ".join(fk.foreign_columns) if fk.foreign_columns else "id"
                col_lines.append(
                    f"    CONSTRAINT {c_name} FOREIGN KEY ({', '.join(fk.column_names)}) "
                    f"REFERENCES {target_table}({ref_cols}) ON DELETE RESTRICT"
                )
                for c in fk.column_names:
                    fk_cols_seen.add(c.lower())
                    extra_indexes.append(f"CREATE INDEX idx_{final_table_name}_{c} ON {final_table_name} ({c});")

            # Missing foreign keys detected
            for s in t_smells:
                if s.id.startswith("SMELL_MISSING_FK") and s.column_name:
                    if s.column_name.lower() not in fk_cols_seen:
                        target = s.column_name.lower().replace("_id", "").replace("id_", "")
                        target_tbl = f"{target}s"
                        col_lines.append(
                            f"    CONSTRAINT fk_{final_table_name}_{s.column_name} "
                            f"FOREIGN KEY ({s.column_name}) REFERENCES {target_tbl}(id) ON DELETE RESTRICT"
                        )
                        fk_cols_seen.add(s.column_name.lower())
                        extra_indexes.append(f"CREATE INDEX idx_{final_table_name}_{s.column_name} ON {final_table_name} ({s.column_name});")

            output.append(",\n".join(col_lines))
            output.append(");\n")

        # Add normalized child tables
        if extra_tables:
            output.append("-- Normalized Child Tables (1NF Resolution):")
            output.extend(extra_tables)
            output.append("")

        # Add missing indexes
        if extra_indexes:
            output.append("-- Foreign Key Indexes (Performance & Lock Prevention):")
            output.extend(sorted(list(set(extra_indexes))))
            output.append("")

        return "\n".join(output)