import re
from typing import List, Dict
from app.detectors.base import BaseSmellDetector
from app.parser.schema_models import (
    DetectedSmell,
    SchemaInfo,
    SmellCategory,
    SmellSeverity,
)

class GodTableDetector(BaseSmellDetector):
    id = "SMELL_GOD_TABLE"
    name = "God Table / Blob Table (Unnormalized Mega-Entity)"
    category = SmellCategory.NORMALIZATION
    severity = SmellSeverity.HIGH
    COLUMN_THRESHOLD = 12

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            col_count = len(table.columns)
            if col_count >= self.COLUMN_THRESHOLD:
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}",
                        title=f"Table '{table_name}' has excessive columns ({col_count} columns)",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=None,
                        description=(
                            f"The table '{table_name}' contains {col_count} columns (threshold: {self.COLUMN_THRESHOLD}). "
                            f"It behaves as a 'God Table' aggregating multiple distinct logical concepts."
                        ),
                        dbms_theory=(
                            "Single Responsibility & Normalization: In relational design, a relation should represent "
                            "a single cohesive entity. Bloated tables frequently bundle 1:1 sub-entities "
                            "(e.g., User Credentials + User Profile + Shipping Address + Notification Preferences) "
                            "together. In DBMS storage engines, wide rows cause row-spill across multiple disk pages, "
                            "increasing disk I/O and reducing buffer pool cache efficiency."
                        ),
                        impact=(
                            "Severe disk I/O degradation during SELECT *, higher lock contention, cache thrashing, "
                            "and frequent schema alterations as disparate business requirements evolve."
                        ),
                        remediation=(
                            "Decompose this table into smaller, cohesive 3NF tables linked by 1:1 or 1:N foreign keys "
                            "(e.g., split into core table, profile table, and settings table)."
                        ),
                        suggested_sql=f"-- Refactoring Suggestion: Split '{table_name}' into dedicated child tables with 1:1 foreign keys.",
                    )
                )
        return smells

class MultivaluedAttributeDetector(BaseSmellDetector):
    id = "SMELL_1NF_MULTIVALUED"
    name = "Multivalued Attribute (First Normal Form Violation)"
    category = SmellCategory.NORMALIZATION
    severity = SmellSeverity.CRITICAL

    MULTIVALUED_NAMES = {
        "tags", "tag_list", "phones", "phone_numbers", "emails", "email_addresses",
        "items", "item_list", "roles", "categories", "keywords", "skills",
        "options", "preferences_list", "hobbies", "attachments"
    }

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            for col in table.columns:
                col_lower = col.name.lower()
                data_type_upper = col.data_type.upper()

                is_text_type = any(t in data_type_upper for t in ["VARCHAR", "TEXT", "CHAR", "STRING"])
                if col_lower in self.MULTIVALUED_NAMES or col_lower.endswith("_list") or col_lower.endswith("_array") or col_lower.endswith("_tags"):
                    if is_text_type:
                        parent_pk = table.primary_keys[0] if table.primary_keys else "id"
                        child_table = f"{table_name}_{col.name}"
                        suggested_sql = (
                            f"CREATE TABLE {child_table} (\n"
                            f"    id SERIAL PRIMARY KEY,\n"
                            f"    {table_name}_{parent_pk} INT NOT NULL REFERENCES {table_name}({parent_pk}) ON DELETE CASCADE,\n"
                            f"    val VARCHAR(100) NOT NULL\n"
                            f");\n"
                            f"ALTER TABLE {table_name} DROP COLUMN {col.name};"
                        )
                        smells.append(
                            DetectedSmell(
                                id=f"{self.id}_{table_name}_{col.name}",
                                title=f"Column '{col.name}' in '{table_name}' violates First Normal Form (1NF)",
                                category=self.category,
                                severity=self.severity,
                                table_name=table_name,
                                column_name=col.name,
                                description=(
                                    f"Column '{col.name}' appears to store multiple values (e.g. comma-delimited strings) "
                                    f"within a single field."
                                ),
                                dbms_theory=(
                                    "First Normal Form (1NF) & Atomicity: 1NF requires that the domain of each attribute "
                                    "contain only atomic (indivisible) values, and each attribute value in a tuple must be "
                                    "a single value from that domain. Storing comma-separated lists or JSON strings in a "
                                    "relational column breaks index searchability, forces expensive LIKE '%tag%' full scans, "
                                    "and makes aggregation (COUNT, GROUP BY) impossible without procedural string splitting."
                                ),
                                impact="Cannot query individual items using B-Tree indexes; queries require slow LIKE '%val%' regex scans; risks delimiter collisions.",
                                remediation="Normalize into a separate child table with a foreign key referencing the parent table (1:N relationship).",
                                suggested_sql=suggested_sql,
                            )
                        )
        return smells

class EAVAntipatternDetector(BaseSmellDetector):
    id = "SMELL_EAV"
    name = "Entity-Attribute-Value (EAV Antipattern)"
    category = SmellCategory.NORMALIZATION
    severity = SmellSeverity.CRITICAL

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        for table_name, table in schema.tables.items():
            col_names = [c.name.lower() for c in table.columns]

            has_entity = any(c in col_names for c in ["entity_id", "entity", "object_id", "record_id"])
            has_attribute = any(c in col_names for c in ["attribute_name", "attribute", "attr_name", "key_name", "key", "property", "prop_name"])
            has_value = any(c in col_names for c in ["attribute_value", "value", "val", "attr_value", "prop_value"])

            if has_entity and has_attribute and has_value:
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}",
                        title=f"Table '{table_name}' implements Entity-Attribute-Value (EAV) antipattern",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=None,
                        description=(
                            f"The table '{table_name}' contains generic columns for entity, attribute key, and value. "
                            f"This is a classic EAV antipattern ('The Open-Schema Disease')."
                        ),
                        dbms_theory=(
                            "Relational Typing & Structural Soundness: EAV throws away the relational model. "
                            "Because 'value' must store all possible types, it is usually typed as VARCHAR/TEXT, "
                            "disabling data integrity constraints (NOT NULL, CHECK, UNIQUE, FOREIGN KEY) and "
                            "type validation. Fetching a single logical entity requires dozens of SELF-JOINs, "
                            "producing catastrophic quadratic join performance."
                        ),
                        impact="Dozens of SQL joins needed for simple SELECT queries, absence of column constraints, inability to enforce data types, massive query latency.",
                        remediation="Model attributes as explicit typed columns in concrete entities, or if dynamic attributes are strictly required, use native JSONB columns with schema validation.",
                        suggested_sql=f"-- Refactor '{table_name}' into dedicated typed relation tables or use Postgres JSONB with GIN index.",
                    )
                )
        return smells

class MetadataTribblesDetector(BaseSmellDetector):
    id = "SMELL_METADATA_TRIBBLES"
    name = "Metadata Tribbles (Table Cloning Antipattern)"
    category = SmellCategory.NORMALIZATION
    severity = SmellSeverity.HIGH

    # Matches names ending in 4-digit year, year_month, or quarter (e.g. orders_2023, sales_q1)
    TRIBBLE_REGEX = re.compile(r"^(.*?)(?:_|\b)(20\d\d|19\d\d|q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|backup|archive|temp|copy)$", re.IGNORECASE)

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        base_groups: Dict[str, List[str]] = {}

        for table_name in schema.tables.keys():
            match = self.TRIBBLE_REGEX.match(table_name)
            if match:
                base_name = match.group(1).rstrip("_").lower()
                if base_name not in base_groups:
                    base_groups[base_name] = []
                base_groups[base_name].append(table_name)

        for base_name, cloner_tables in base_groups.items():
            if len(cloner_tables) >= 1: # even 1 clone (e.g. orders_2023) is suspicious
                for t in cloner_tables:
                    smells.append(
                        DetectedSmell(
                            id=f"{self.id}_{t}",
                            title=f"Table '{t}' appears to be a partitioned clone of base entity '{base_name}'",
                            category=self.category,
                            severity=self.severity,
                            table_name=t,
                            column_name=None,
                            description=(
                                f"Table '{t}' uses date/status suffixing instead of storing records in a single table. "
                                f"This antipattern is known as 'Metadata Tribbles'."
                            ),
                            dbms_theory=(
                                "Data Independence & Table Partitioning: Relational databases separate physical storage "
                                "from logical schema. Creating new tables each year or quarter forces DDL migrations "
                                "for ongoing operations and turns simple cross-period queries into unwieldy UNION ALL constructs. "
                                "Modern DBMS support declarative table partitioning (PARTITION BY RANGE) under a single logical table."
                            ),
                            impact="Requires manual DDL maintenance every period; cross-period queries require massive UNION ALL joins; foreign keys cannot span multiple cloned tables.",
                            remediation=f"Consolidate tables into a single logical '{base_name}' table and utilize DBMS native table partitioning (PARTITION BY RANGE (created_at)).",
                            suggested_sql=f"-- Consolidate '{t}' into '{base_name}' and use: CREATE TABLE {base_name} (...) PARTITION BY RANGE (...);",
                        )
                    )
        return smells

class TransitiveRedundancyDetector(BaseSmellDetector):
    id = "SMELL_2NF_3NF_REDUNDANCY"
    name = "Transitive Redundancy (Second / Third Normal Form Violation Suspect)"
    category = SmellCategory.NORMALIZATION
    severity = SmellSeverity.MEDIUM

    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        smells = []
        # Check for address clustering within transactional tables (e.g. city, state, zip in orders)
        address_markers = {"city", "state", "zip", "zip_code", "postal_code", "country"}
        customer_markers = {"customer_name", "customer_email", "customer_phone"}

        for table_name, table in schema.tables.items():
            t_lower = table_name.lower()
            if t_lower in ["address", "addresses", "location", "locations", "user", "users", "customer", "customers"]:
                continue

            col_names = {c.name.lower() for c in table.columns}

            # If an order/transaction table has multiple address columns directly
            matched_addr = col_names.intersection(address_markers)
            if len(matched_addr) >= 3:
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}_address",
                        title=f"Table '{table_name}' embeds transitive address attributes {list(matched_addr)}",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=", ".join(matched_addr),
                        description=(
                            f"The table '{table_name}' stores multiple address attributes ({', '.join(matched_addr)}) "
                            f"directly rather than referencing a normalized address entity."
                        ),
                        dbms_theory=(
                            "Third Normal Form (3NF) & Transitive Dependency: A relation is in 3NF if it is in 2NF and "
                            "no non-prime attribute is transitively dependent on the primary key (X -> Y -> Z). "
                            "Zip code determines city and state; embedding them repeatedly in transactional tables creates "
                            "update anomalies where changing an address in one transaction leaves prior records contradictory."
                        ),
                        impact="Update anomalies (modifying an address requires updating millions of rows), redundant disk storage, and inconsistent spelling of cities/states.",
                        remediation="Extract address attributes into an 'addresses' table and reference it via an address_id foreign key.",
                        suggested_sql=f"-- Extract address attributes ({', '.join(matched_addr)}) into an addresses table.",
                    )
                )

            # If table embeds customer_name AND customer_email
            matched_cust = col_names.intersection(customer_markers)
            if len(matched_cust) >= 2:
                smells.append(
                    DetectedSmell(
                        id=f"{self.id}_{table_name}_customer",
                        title=f"Table '{table_name}' embeds redundant customer attributes {list(matched_cust)}",
                        category=self.category,
                        severity=self.severity,
                        table_name=table_name,
                        column_name=", ".join(matched_cust),
                        description=(
                            f"The table '{table_name}' embeds customer identity fields ({', '.join(matched_cust)}) "
                            f"instead of storing a clean customer_id foreign key."
                        ),
                        dbms_theory=(
                            "Second Normal Form (2NF) & Redundant Storage: Attributes that describe a customer "
                            "depend on customer_id, not on transaction_id. Embedding customer details inside transaction "
                            "records violates 2NF/3NF principles and introduces data duplication."
                        ),
                        impact="Data inconsistency when customer updates their email or name; bloated row sizes.",
                        remediation="Store only customer_id foreign key in this table and look up customer attributes via JOIN.",
                        suggested_sql=f"-- Drop {', '.join(matched_cust)} from '{table_name}' and join with customers table.",
                    )
                )

        return smells