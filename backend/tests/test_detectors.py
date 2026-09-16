import pytest
from app.parser.sql_parser import SQLSchemaParser
from app.detectors.engine import SmellDetectionEngine
from app.refactor.fix_generator import RefactorGenerator
from app.samples.sample_schemas import SAMPLE_SCHEMAS

def test_sql_parser_basic():
    ddl = """
    CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE
    );
    CREATE TABLE posts (
        post_id INT PRIMARY KEY,
        author_id INT,
        title VARCHAR(200),
        CONSTRAINT fk_post_user FOREIGN KEY (author_id) REFERENCES users(id)
    );
    """
    parser = SQLSchemaParser(dialect="postgres")
    schema = parser.parse(ddl)
    assert len(schema.tables) == 2
    assert "users" in schema.tables
    assert "posts" in schema.tables
    assert "id" in schema.tables["users"].primary_keys
    assert len(schema.tables["posts"].foreign_keys) == 1
    assert schema.tables["posts"].foreign_keys[0].foreign_table.lower() == "users"

def test_missing_primary_key_detector():
    ddl = """
    CREATE TABLE unkeyed_data (
        col1 INT,
        col2 VARCHAR(50)
    );
    """
    parser = SQLSchemaParser()
    schema = parser.parse(ddl)
    engine = SmellDetectionEngine()
    result = engine.analyze(schema)

    smell_ids = [s.id for s in result.smells]
    assert any("SMELL_MISSING_PK" in sid for sid in smell_ids)
    assert result.overall_score < 100

def test_missing_foreign_key_detector():
    ddl = """
    CREATE TABLE accounts (
        id INT PRIMARY KEY,
        acc_name VARCHAR(100)
    );
    CREATE TABLE transactions (
        tx_id INT PRIMARY KEY,
        account_id INT,
        amount DECIMAL(10,2)
    );
    """
    parser = SQLSchemaParser()
    schema = parser.parse(ddl)
    engine = SmellDetectionEngine()
    result = engine.analyze(schema)

    smell_ids = [s.id for s in result.smells]
    assert any("SMELL_MISSING_FK" in sid for sid in smell_ids)

def test_god_table_detector():
    cols = ", ".join([f"col_{i} VARCHAR(50)" for i in range(16)])
    ddl = f"CREATE TABLE mega_table (id INT PRIMARY KEY, {cols});"
    parser = SQLSchemaParser()
    schema = parser.parse(ddl)
    engine = SmellDetectionEngine()
    result = engine.analyze(schema)

    smell_ids = [s.id for s in result.smells]
    assert any("SMELL_GOD_TABLE" in sid for sid in smell_ids)

def test_eav_detector():
    ddl = """
    CREATE TABLE entity_attributes (
        id INT PRIMARY KEY,
        entity_id INT NOT NULL,
        attribute_name VARCHAR(100) NOT NULL,
        attribute_value TEXT
    );
    """
    parser = SQLSchemaParser()
    schema = parser.parse(ddl)
    engine = SmellDetectionEngine()
    result = engine.analyze(schema)

    smell_ids = [s.id for s in result.smells]
    assert any("SMELL_EAV" in sid for sid in smell_ids)

def test_multivalued_1nf_detector():
    ddl = """
    CREATE TABLE articles (
        article_id INT PRIMARY KEY,
        title VARCHAR(200),
        tags TEXT
    );
    """
    parser = SQLSchemaParser()
    schema = parser.parse(ddl)
    engine = SmellDetectionEngine()
    result = engine.analyze(schema)

    smell_ids = [s.id for s in result.smells]
    assert any("SMELL_1NF_MULTIVALUED" in sid for sid in smell_ids)

def test_unindexed_foreign_key_detector():
    ddl = """
    CREATE TABLE parent (id INT PRIMARY KEY);
    CREATE TABLE child (
        child_id INT PRIMARY KEY,
        parent_id INT,
        FOREIGN KEY (parent_id) REFERENCES parent(id)
    );
    """
    parser = SQLSchemaParser()
    schema = parser.parse(ddl)
    engine = SmellDetectionEngine()
    result = engine.analyze(schema)

    smell_ids = [s.id for s in result.smells]
    assert any("SMELL_UNINDEXED_FK" in sid for sid in smell_ids)

def test_sample_schemas_analysis():
    parser = SQLSchemaParser()
    engine = SmellDetectionEngine()

    # Clean benchmark should have high score
    clean_sample = SAMPLE_SCHEMAS["clean_benchmark"]
    clean_schema = parser.parse(clean_sample.sql)
    clean_result = engine.analyze(clean_schema)
    assert clean_result.overall_score >= 90
    assert clean_result.grade in ["A+", "A"]

    # E-Commerce smelly should have low score
    ecommerce_sample = SAMPLE_SCHEMAS["ecommerce_smelly"]
    smelly_schema = parser.parse(ecommerce_sample.sql)
    smelly_result = engine.analyze(smelly_schema)
    assert len(smelly_result.smells) >= 5
    assert smelly_result.overall_score < 70

def test_refactor_generator():
    parser = SQLSchemaParser()
    engine = SmellDetectionEngine()
    refactorer = RefactorGenerator()

    sample = SAMPLE_SCHEMAS["ecommerce_smelly"]
    schema = parser.parse(sample.sql)
    result = engine.analyze(schema)

    migration_sql = refactorer.generate_migration_script(result.smells)
    assert "BEGIN TRANSACTION;" in migration_sql
    assert "COMMIT;" in migration_sql

    refactored_ddl = refactorer.generate_refactored_schema(schema, result.smells)
    assert "CREATE TABLE" in refactored_ddl
def test_api_routes():
    from app.main import app
    from fastapi.testclient import TestClient

    client = TestClient(app)
    # Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    # Samples
    res_samples = client.get("/api/samples")
    assert res_samples.status_code == 200
    samples = res_samples.json()
    assert len(samples) >= 4

    # Analyze
    sample_sql = samples[0]["sql"]
    res_analyze = client.post("/api/analyze", json={"sql": sample_sql, "dialect": "postgres"})
    assert res_analyze.status_code == 200
    data = res_analyze.json()
    assert "overall_score" in data
    assert "grade" in data
    assert "smells" in data
    assert len(data["smells"]) > 0

    # Refactor endpoint
    res_refactor = client.post("/api/refactor", json={"sql": sample_sql, "dialect": "postgres"})
    assert res_refactor.status_code == 200
    ref_data = res_refactor.json()
    assert "migration_sql" in ref_data
    assert "refactored_schema_sql" in ref_data