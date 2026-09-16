import re
import logging
from typing import Dict, List, Optional
import sqlglot
from sqlglot import exp
from app.parser.schema_models import (
    ColumnInfo,
    ForeignKeyInfo,
    IndexInfo,
    SchemaInfo,
    TableInfo,
)

logger = logging.getLogger(__name__)

def clean_sql(sql_text: str) -> str:
    """Strip comments and normalize spacing."""
    sql_text = re.sub(r'--.*?$', '', sql_text, flags=re.MULTILINE)
    sql_text = re.sub(r'/\*.*?\*/', '', sql_text, flags=re.DOTALL)
    sql_text = re.sub(r'ENGINE\s*=\s*\w+', '', sql_text, flags=re.IGNORECASE)
    sql_text = re.sub(r'DEFAULT\s+CHARSET\s*=\s*\w+', '', sql_text, flags=re.IGNORECASE)
    sql_text = re.sub(r'AUTO_INCREMENT\s*=\s*\d+', '', sql_text, flags=re.IGNORECASE)
    return sql_text.strip()

class SQLSchemaParser:
    """
    Parses SQL DDL into a structured SchemaInfo model.
    Uses sqlglot AST parsing as primary engine with regex-based fallbacks.
    """

    def __init__(self, dialect: str = 'postgres'):
        self.dialect = dialect.lower()

    def parse(self, sql_text: str) -> SchemaInfo:
        cleaned = clean_sql(sql_text)
        tables: Dict[str, TableInfo] = {}

        try:
            parsed_statements = sqlglot.parse(cleaned, read=self.dialect)
        except Exception as e:
            logger.warning(f"sqlglot parsing error with dialect {self.dialect}, trying generic: {e}")
            try:
                parsed_statements = sqlglot.parse(cleaned)
            except Exception as e2:
                logger.error(f"sqlglot generic parse failed: {e2}")
                parsed_statements = []

        for stmt in parsed_statements:
            if stmt is None:
                continue

            if isinstance(stmt, exp.Create) and stmt.args.get('kind', '').upper() == 'TABLE':
                self._extract_create_table(stmt, tables)
            elif isinstance(stmt, exp.Alter) and stmt.args.get('kind', '').upper() == 'TABLE':
                self._extract_alter_table(stmt, tables)
            elif isinstance(stmt, exp.Create) and (stmt.args.get('kind', '').upper() == 'INDEX' or stmt.find(exp.Index)):
                self._extract_create_index(stmt, tables)

        self._regex_fallback(cleaned, tables)

        # Synchronize PK flags
        for table in tables.values():
            for pk_col in table.primary_keys:
                for col in table.columns:
                    if col.name.lower() == pk_col.lower():
                        col.is_primary_key = True
                        col.is_nullable = False

        return SchemaInfo(tables=tables, raw_sql=sql_text, dialect=self.dialect)

    def _extract_create_table(self, stmt: exp.Create, tables: Dict[str, TableInfo]):
        schema = stmt.find(exp.Schema)
        if not schema:
            return

        table_name = schema.this.name if hasattr(schema.this, 'name') else str(schema.this)
        table_name = table_name.strip('"`[] ')

        columns: List[ColumnInfo] = []
        primary_keys: List[str] = []
        foreign_keys: List[ForeignKeyInfo] = []
        indexes: List[IndexInfo] = []

        for item in schema.expressions:
            if isinstance(item, exp.ColumnDef):
                col_name = item.this.name.strip('"`[] ') if hasattr(item.this, 'name') else str(item.this)
                data_type = item.kind.sql().upper() if item.kind else 'VARCHAR'

                is_pk = False
                is_unique = False
                is_nullable = True
                default_val = None

                for c in item.constraints:
                    kind = c.kind
                    if isinstance(kind, exp.PrimaryKeyColumnConstraint):
                        is_pk = True
                        is_nullable = False
                    elif isinstance(kind, exp.NotNullColumnConstraint):
                        is_nullable = False
                    elif isinstance(kind, exp.UniqueColumnConstraint):
                        is_unique = True
                    elif isinstance(kind, exp.DefaultColumnConstraint):
                        default_val = kind.this.sql() if hasattr(kind, 'this') else str(kind)

                if is_pk:
                    primary_keys.append(col_name)

                columns.append(ColumnInfo(
                    name=col_name,
                    data_type=data_type,
                    is_nullable=is_nullable,
                    is_primary_key=is_pk,
                    is_unique=is_unique,
                    default_value=default_val
                ))

            elif isinstance(item, exp.PrimaryKey) or item.find(exp.PrimaryKey):
                pk_node = item if isinstance(item, exp.PrimaryKey) else item.find(exp.PrimaryKey)
                if pk_node:
                    for e in pk_node.expressions:
                        col_name = e.name.strip('"`[] ') if hasattr(e, 'name') else str(e)
                        if col_name not in primary_keys:
                            primary_keys.append(col_name)

            elif isinstance(item, exp.ForeignKey) or item.find(exp.ForeignKey):
                fk_node = item if isinstance(item, exp.ForeignKey) else item.find(exp.ForeignKey)
                if fk_node:
                    fk_info = self._parse_foreign_key_node(fk_node, item)
                    if fk_info:
                        foreign_keys.append(fk_info)

            elif isinstance(item, exp.Unique) or item.find(exp.Unique):
                u_node = item if isinstance(item, exp.Unique) else item.find(exp.Unique)
                if u_node:
                    u_cols = [e.name.strip('"`[] ') for e in u_node.expressions if hasattr(e, 'name')]
                    if u_cols:
                        indexes.append(IndexInfo(name=f"uq_{table_name}_{len(indexes)}", column_names=u_cols, is_unique=True))

        tables[table_name] = TableInfo(
            name=table_name,
            columns=columns,
            primary_keys=primary_keys,
            foreign_keys=foreign_keys,
            indexes=indexes,
            raw_sql=stmt.sql()
        )

    def _parse_foreign_key_node(self, fk_node: exp.ForeignKey, parent_item=None) -> Optional[ForeignKeyInfo]:
        try:
            fk_cols = [e.name.strip('"`[] ') for e in fk_node.expressions if hasattr(e, 'name')]
            ref = fk_node.args.get('reference')
            if not ref:
                return None

            ref_table = ''
            ref_cols = []

            if hasattr(ref, 'this'):
                if isinstance(ref.this, exp.Schema):
                    ref_table = ref.this.this.name if hasattr(ref.this.this, 'name') else str(ref.this.this)
                    ref_cols = [e.name.strip('"`[] ') for e in ref.this.expressions if hasattr(e, 'name')]
                elif isinstance(ref.this, exp.Table):
                    ref_table = ref.this.name
                else:
                    ref_table = str(ref.this)

            if not ref_cols and hasattr(ref, 'expressions'):
                ref_cols = [e.name.strip('"`[] ') for e in ref.expressions if hasattr(e, 'name')]

            constraint_name = None
            if parent_item and isinstance(parent_item, exp.Constraint) and hasattr(parent_item, 'this'):
                constraint_name = parent_item.this.name if hasattr(parent_item.this, 'name') else str(parent_item.this)

            ref_table = ref_table.strip('"`[] ')
            return ForeignKeyInfo(
                column_names=fk_cols,
                foreign_table=ref_table,
                foreign_columns=ref_cols,
                constraint_name=constraint_name
            )
        except Exception as e:
            logger.debug(f"Error parsing FK node: {e}")
            return None

    def _extract_alter_table(self, stmt: exp.Alter, tables: Dict[str, TableInfo]):
        table_name = stmt.this.name.strip('"`[] ') if hasattr(stmt.this, 'name') else str(stmt.this).strip('"`[] ')
        if table_name not in tables:
            tables[table_name] = TableInfo(name=table_name, columns=[], primary_keys=[], foreign_keys=[], indexes=[])

        target_table = tables[table_name]

        fk_node = stmt.find(exp.ForeignKey)
        if fk_node:
            constraint_node = stmt.find(exp.Constraint)
            fk_info = self._parse_foreign_key_node(fk_node, constraint_node)
            if fk_info and fk_info not in target_table.foreign_keys:
                target_table.foreign_keys.append(fk_info)

        pk_node = stmt.find(exp.PrimaryKey)
        if pk_node:
            for e in pk_node.expressions:
                cname = e.name.strip('"`[] ') if hasattr(e, 'name') else str(e)
                if cname not in target_table.primary_keys:
                    target_table.primary_keys.append(cname)

    def _extract_create_index(self, stmt: exp.Create, tables: Dict[str, TableInfo]):
        idx_node = stmt.find(exp.Index)
        if not idx_node:
            return

        table_node = idx_node.find(exp.Table)
        table_name = table_node.name.strip('"`[] ') if table_node and hasattr(table_node, 'name') else ''

        if not table_name:
            return

        idx_name = idx_node.this.name if hasattr(idx_node, 'this') and hasattr(idx_node.this, 'name') else 'idx'
        cols = [c.name.strip('"`[] ') for c in idx_node.find_all(exp.Column) if hasattr(c, 'name')]
        is_unique = bool(stmt.args.get('unique'))

        # Match table case-insensitively
        target_tbl = None
        for t in tables.keys():
            if t.lower() == table_name.lower():
                target_tbl = tables[t]
                break

        if target_tbl:
            target_tbl.indexes.append(IndexInfo(name=idx_name, column_names=cols, is_unique=is_unique))

    def _regex_fallback(self, cleaned_sql: str, tables: Dict[str, TableInfo]):
        # Regex for CREATE INDEX
        idx_pattern = re.compile(
            r'CREATE\s+(UNIQUE\s+)?INDEX\s+([`"\[]?\w+[`"\]]?)\s+ON\s+([`"\[]?\w+[`"\]]?)\s*\((.*?)\)',
            re.IGNORECASE
        )
        for match in idx_pattern.finditer(cleaned_sql):
            is_unique = bool(match.group(1))
            idx_name = match.group(2).strip('"`[] ')
            tname = match.group(3).strip('"`[] ')
            cols_str = match.group(4)
            cols = [c.strip('"`[] ') for c in cols_str.split(',') if c.strip()]

            for t in tables.keys():
                if t.lower() == tname.lower():
                    # check if already added
                    if not any(i.name == idx_name for i in tables[t].indexes):
                        tables[t].indexes.append(IndexInfo(name=idx_name, column_names=cols, is_unique=is_unique))

        # Regex for CREATE TABLE
        create_pattern = re.compile(
            r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"\[]?\w+[`"\]]?)\s*\((.*?)\)(?:;|\s*$|\s+(?:ENGINE|WITHOUT|DEFAULT))',
            re.IGNORECASE | re.DOTALL
        )

        for match in create_pattern.finditer(cleaned_sql):
            raw_table_name = match.group(1).strip('"`[] ')
            body = match.group(2)

            if raw_table_name not in tables or len(tables[raw_table_name].columns) == 0:
                cols = []
                pks = []
                fks = []

                lines = [line.strip() for line in body.split(',') if line.strip()]
                for line in lines:
                    upper = line.upper()
                    if upper.startswith('PRIMARY KEY'):
                        pk_match = re.search(r'\((.*?)\)', line)
                        if pk_match:
                            for c in pk_match.group(1).split(','):
                                pks.append(c.strip('"`[] '))
                    elif 'FOREIGN KEY' in upper and 'REFERENCES' in upper:
                        fk_match = re.search(r'FOREIGN\s+KEY\s*\((.*?)\)\s*REFERENCES\s*([`"\[]?\w+[`"\]]?)\s*\((.*?)\)', line, re.IGNORECASE)
                        if fk_match:
                            fk_cols = [c.strip('"`[] ') for c in fk_match.group(1).split(',')]
                            ref_tbl = fk_match.group(2).strip('"`[] ')
                            ref_cols = [c.strip('"`[] ') for c in fk_match.group(3).split(',')]
                            fks.append(ForeignKeyInfo(column_names=fk_cols, foreign_table=ref_tbl, foreign_columns=ref_cols))
                    elif upper.startswith('CONSTRAINT') and 'FOREIGN KEY' in upper:
                        fk_match = re.search(r'CONSTRAINT\s+([`"\[]?\w+[`"\]]?)\s+FOREIGN\s+KEY\s*\((.*?)\)\s*REFERENCES\s*([`"\[]?\w+[`"\]]?)\s*\((.*?)\)', line, re.IGNORECASE)
                        if fk_match:
                            c_name = fk_match.group(1).strip('"`[] ')
                            fk_cols = [c.strip('"`[] ') for c in fk_match.group(2).split(',')]
                            ref_tbl = fk_match.group(3).strip('"`[] ')
                            ref_cols = [c.strip('"`[] ') for c in fk_match.group(4).split(',')]
                            fks.append(ForeignKeyInfo(column_names=fk_cols, foreign_table=ref_tbl, foreign_columns=ref_cols, constraint_name=c_name))
                    else:
                        col_parts = line.split()
                        if len(col_parts) >= 2:
                            cname = col_parts[0].strip('"`[] ')
                            if cname.upper() not in ('PRIMARY', 'FOREIGN', 'KEY', 'CONSTRAINT', 'INDEX', 'UNIQUE', 'CHECK'):
                                ctype = col_parts[1].upper()
                                is_pk = 'PRIMARY KEY' in upper
                                is_nn = 'NOT NULL' in upper or is_pk
                                if is_pk:
                                    pks.append(cname)
                                cols.append(ColumnInfo(
                                    name=cname,
                                    data_type=ctype,
                                    is_nullable=not is_nn,
                                    is_primary_key=is_pk
                                ))

                tables[raw_table_name] = TableInfo(
                    name=raw_table_name,
                    columns=cols,
                    primary_keys=pks,
                    foreign_keys=fks,
                    indexes=[],
                    raw_sql=match.group(0)
                )