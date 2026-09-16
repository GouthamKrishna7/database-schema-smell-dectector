from typing import Dict, List
from pydantic import BaseModel

class SampleSchemaItem(BaseModel):
    id: str
    title: str
    badge: str
    description: str
    dialect: str
    expected_smells: List[str]
    sql: str

SAMPLE_SCHEMAS: Dict[str, SampleSchemaItem] = {
    "ecommerce_smelly": SampleSchemaItem(
        id="ecommerce_smelly",
        title="E-Commerce Store (Severe Smells)",
        badge="Grade F / High Smells",
        description="A legacy e-commerce database plagued with a God Table, EAV pattern, 1NF multivalued tags, missing primary keys, unindexed FKs, and VARCHAR timestamps.",
        dialect="postgres",
        expected_smells=[
            "God Table (users has 16 columns)",
            "Missing Primary Key (order_items has no PK)",
            "1NF Violation (products.tags stores comma-separated list)",
            "EAV Antipattern (product_custom_attrs)",
            "Missing Foreign Key (orders.user_id)",
            "Overly Generic Types (created_at VARCHAR, price VARCHAR)",
            "Unindexed Foreign Keys",
            "SQL Reserved Keyword ('user', 'order')",
        ],
        sql="""-- ============================================================
-- E-COMMERCE SAMPLE SCHEMA (Contains Multiple Design Smells)
-- Designed for DBMS Schema Smell Detection Demonstration
-- ============================================================

-- Smell 1: Reserved keyword 'user', God Table (16 columns), Boolean flag explosion
CREATE TABLE user (
    id INT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    shipping_street VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(50),
    shipping_zip VARCHAR(20),
    billing_street VARCHAR(255),
    billing_city VARCHAR(100),
    credit_card_number VARCHAR(30),
    is_active VARCHAR(10),
    is_verified VARCHAR(10),
    is_admin VARCHAR(10),
    is_banned VARCHAR(10)
);

-- Smell 2: 1NF Multivalued violation (tags), Fear of unknown (price VARCHAR)
CREATE TABLE products (
    id INT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price VARCHAR(20) NOT NULL,
    cost VARCHAR(20),
    tags TEXT,
    stock_quantity INT NOT NULL
);

-- Smell 3: Entity-Attribute-Value (EAV) Antipattern
CREATE TABLE product_custom_attrs (
    entity_id INT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT
);

-- Smell 4: Reserved keyword 'order', Missing FK on user_id, VARCHAR timestamp
CREATE TABLE "order" (
    order_id INT PRIMARY KEY,
    user_id INT,
    order_status VARCHAR(50),
    created_at VARCHAR(50),
    total_amount VARCHAR(30)
);

-- Smell 5: Missing Primary Key (Identity Crisis), Missing FKs, Unindexed keys
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price VARCHAR(20)
);

-- Smell 6: Orphan / Disconnected Table
CREATE TABLE legacy_coupons (
    coupon_id INT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    discount_pct INT,
    expiry_date VARCHAR(50)
);
"""
    ),

    "hospital_smelly": SampleSchemaItem(
        id="hospital_smelly",
        title="Hospital System (Metadata Tribbles & Normalization)",
        badge="Grade D / Normalization Smells",
        description="Healthcare database demonstrating Metadata Tribbles (table cloning by year), 2NF/3NF transitive address embedding, and missing PK constraints.",
        dialect="postgres",
        expected_smells=[
            "Metadata Tribbles (cloned patients_2023 and patients_2024)",
            "Transitive Redundancy (2NF/3NF violation in consultations)",
            "Missing Primary Key (prescriptions table)",
            "Overly Generic Types (dob VARCHAR, consultation_time VARCHAR)",
            "Excessive Nullability (>65% nulls)",
        ],
        sql="""-- ============================================================
-- HOSPITAL CLINIC SAMPLE SCHEMA
-- Demonstrates Metadata Tribbles, 2NF/3NF Violations, and Missing PKs
-- ============================================================

-- Smell: Metadata Tribbles (Table Cloning instead of Partitioning)
CREATE TABLE patients_2023 (
    patient_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob VARCHAR(30),
    blood_group VARCHAR(10),
    insurance_policy VARCHAR(100)
);

CREATE TABLE patients_2024 (
    patient_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob VARCHAR(30),
    blood_group VARCHAR(10),
    insurance_policy VARCHAR(100)
);

CREATE TABLE doctors (
    doctor_id INT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL
);

-- Smell: Transitive Address & Patient Redundancy (2NF/3NF Violation), Missing FK constraints
CREATE TABLE consultations (
    consultation_id INT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    consultation_time VARCHAR(50),
    clinic_city VARCHAR(100),
    clinic_state VARCHAR(100),
    clinic_zip VARCHAR(20),
    clinic_country VARCHAR(100),
    patient_name VARCHAR(150),
    patient_phone VARCHAR(50),
    diagnosis TEXT
);

-- Smell: Missing Primary Key
CREATE TABLE prescriptions (
    consultation_id INT,
    medication_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    CONSTRAINT fk_presc_consult FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id)
);

-- Smell: Excessive Nullability (75% nullable columns)
CREATE TABLE medical_equipment (
    equip_id INT PRIMARY KEY,
    serial_number VARCHAR(100),
    manufacturer VARCHAR(100),
    calibration_date VARCHAR(50),
    maintenance_notes TEXT,
    loaned_to_dept VARCHAR(100),
    decommission_reason TEXT,
    warranty_provider VARCHAR(100)
);
"""
    ),

    "saas_smelly": SampleSchemaItem(
        id="saas_smelly",
        title="SaaS Multi-tenant (Circular References & Index Smells)",
        badge="Grade C / Integrity & Index Smells",
        description="Cloud SaaS schema containing circular foreign key dependencies, redundant composite index prefixes, unindexed foreign keys, and nullable FKs.",
        dialect="postgres",
        expected_smells=[
            "Circular Foreign Key Dependency (organizations <-> users)",
            "Nullable Foreign Keys",
            "Duplicate / Redundant Indexes (idx_posts_user is prefix of idx_posts_user_created)",
            "Unindexed Foreign Keys",
            "Boolean Flag Explosion",
        ],
        sql="""-- ============================================================
-- SAAS MULTI-TENANT SAMPLE SCHEMA
-- Demonstrates Circular Dependencies, Redundant Indexes, & Nullable FKs
-- ============================================================

CREATE TABLE organizations (
    org_id INT PRIMARY KEY,
    org_name VARCHAR(150) NOT NULL,
    primary_user_id INT,
    plan_tier VARCHAR(50) DEFAULT 'free'
);

-- Smell: Circular FK with organizations; Nullable FK; Boolean Explosion
CREATE TABLE users (
    id INT PRIMARY KEY,
    org_id INT,
    email VARCHAR(150) UNIQUE NOT NULL,
    is_active BOOLEAN,
    is_billing_admin BOOLEAN,
    is_invited BOOLEAN,
    is_sso_enabled BOOLEAN,
    is_mfa_required BOOLEAN,
    CONSTRAINT fk_user_org FOREIGN KEY (org_id) REFERENCES organizations(org_id)
);

-- Complete circular dependency back to users
ALTER TABLE organizations ADD CONSTRAINT fk_org_primary_user FOREIGN KEY (primary_user_id) REFERENCES users(id);

CREATE TABLE workspaces (
    workspace_id INT PRIMARY KEY,
    org_id INT NOT NULL,
    workspace_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_ws_org FOREIGN KEY (org_id) REFERENCES organizations(org_id)
);

CREATE TABLE documents (
    doc_id INT PRIMARY KEY,
    workspace_id INT NOT NULL,
    author_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id),
    CONSTRAINT fk_doc_author FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Smell: Duplicate Index (idx_docs_workspace is prefix of idx_docs_workspace_created)
CREATE INDEX idx_docs_workspace ON documents(workspace_id);
CREATE INDEX idx_docs_workspace_created ON documents(workspace_id, created_at);
"""
    ),

    "clean_benchmark": SampleSchemaItem(
        id="clean_benchmark",
        title="Clean Relational Schema (3NF Benchmark)",
        badge="Grade A+ / 0 Smells",
        description="A pristine, textbook-quality 3NF relational schema with strict entity integrity, referential constraints, proper typing, and complete foreign key indexing.",
        dialect="postgres",
        expected_smells=[],
        sql="""-- ============================================================
-- TEXTBOOK CLEAN 3NF BENCHMARK SCHEMA
-- Fully Normalized, Explicit Constraints, Strict Data Typing
-- ============================================================

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    street_line1 VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country_code CHAR(2) NOT NULL,
    CONSTRAINT fk_addr_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE INDEX idx_addr_customer_id ON addresses(customer_id);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE catalog_items (
    item_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    price_cents INT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);
CREATE INDEX idx_item_category_id ON catalog_items(category_id);

CREATE TABLE customer_orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    shipping_address_id INT NOT NULL,
    order_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount_cents INT NOT NULL,
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_shipping FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id) ON DELETE RESTRICT
);
CREATE INDEX idx_order_customer_id ON customer_orders(customer_id);
CREATE INDEX idx_order_shipping_id ON customer_orders(shipping_address_id);

CREATE TABLE order_line_items (
    order_id INT NOT NULL,
    line_number INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price_cents INT NOT NULL,
    PRIMARY KEY (order_id, line_number),
    CONSTRAINT fk_line_order FOREIGN KEY (order_id) REFERENCES customer_orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_line_item FOREIGN KEY (item_id) REFERENCES catalog_items(item_id) ON DELETE RESTRICT
);
CREATE INDEX idx_line_order_id ON order_line_items(order_id);
CREATE INDEX idx_line_item_id ON order_line_items(item_id);
"""
    ),
}