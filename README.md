# Database Schema Smell Detector (DSSD)

> **A Comprehensive Academic & Production-Ready Web Application for Relational Database Schema Antipattern Detection, Normal Form Auditing, and Automated Refactoring.**
> *Developed for DBMS Course Project & Relational Database Design Auditing.*

---

## 📌 Executive Summary

In Relational Database Management Systems (DBMS), schema architecture directly dictates query execution performance, buffer cache hit ratios, transaction concurrency, and referential data integrity. When developers construct database schemas without adhering to formal normalization principles (1NF, 2NF, 3NF, BCNF) and relational constraints, schemas accumulate **"Schema Smells"**—structural and semantic design anti-patterns.

**Database Schema Smell Detector** is an interactive, full-stack platform that parses raw SQL DDL (`CREATE TABLE`, `ALTER TABLE`, keys, and indexes) into an Abstract Syntax Tree (AST), identifies 15+ relational design anti-patterns across 4 core DBMS dimensions, visualizes the relational model on an interactive ER diagram canvas, computes an overall Database Health Score (0–100, Grade A+ to F), and generates automated migration DDL to refactor identified flaws.

---

## 🚀 Key Features

1. **AST-Powered DDL Schema Parser**:
   - Supports **PostgreSQL**, **MySQL**, and **SQLite** dialects.
   - Robust AST expression analyzer powered by `sqlglot` with heuristic fallback recovery.
   - Parses tables, columns, data types, primary keys (single and composite), foreign keys, unique constraints, and indexes.

2. **Detection Engine (15+ Relational Smells)**:
   - **Referential & Entity Integrity**: Missing Primary Keys, Missing Foreign Keys (implicit `*_id` references), Orphan/Disconnected Tables, Nullable Foreign Keys, Circular Foreign Key Dependencies.
   - **Normalization & Deconstruction**: God/Blob Tables (>12 columns), 1NF Multivalued Attributes (comma-separated lists/tags in strings), Entity-Attribute-Value (EAV) Antipattern, Metadata Tribbles (table cloning by date/quarter), 2NF/3NF Transitive Attribute Redundancy.
   - **Domain Types & Design Cleanliness**: Fear of the Unknown (storing dates, numbers, or booleans in `VARCHAR`/`TEXT`), Excessive Nullability (>60% nulls indicating missing subtyping), Boolean Flag Explosion (4+ boolean flags masking an unmodeled state machine), SQL Reserved Word Collisions.
   - **Indexing & Concurrency Performance**: Unindexed Foreign Keys (full table scans on `ON DELETE CASCADE` and JOINs), Duplicate / Redundant Indexes (leftmost prefix redundancy in B-Trees).

3. **Interactive Relational ER Diagram**:
   - Dynamic canvas graph displaying table cards with Primary Keys (`Key` icon), Foreign Keys (`Link` icon), column types, and interactive smell alerts.
   - Visual SVG Bezier curve relationships connecting foreign key columns to referenced parent tables.
   - Table cards can be **dragged and rearranged** freely; zoom in, zoom out, and reset view controls.
   - Tables with critical or warning smells pulse with colored indicators.

4. **Schema Health Score & Quality Metrics**:
   - Overall score (0 to 100) and letter grade (`A+`, `A`, `B`, `C`, `D`, `F`).
   - Radial score gauge and breakdown meters for each of the 4 DBMS dimensions.
   - Summary diagnostics explaining the architectural health of the database.

5. **Automated Refactoring & Migration Generator**:
   - **In-Place Migration Script**: Generates transaction-wrapped (`BEGIN; ... COMMIT;`) `ALTER TABLE` and `CREATE INDEX` statements to fix smells on existing databases.
   - **Clean 3NF Greenfield DDL**: Synthesizes a completely normalized schema adhering to 3NF standards, decomposing multivalued attributes into 1:N relations and enforcing strict types.

6. **Preloaded Academic Sample Schemas**:
   - **E-Commerce Store (Severe Smells)**: Features God table, EAV pattern, 1NF multivalued tags, missing PKs, unindexed FKs, and VARCHAR dates (Grade F).
   - **Hospital System (Metadata Tribbles & Normalization)**: Features table cloning (`patients_2023`, `patients_2024`), 2NF/3NF transitive addresses, and missing PKs (Grade D).
   - **SaaS Multi-tenant (Circular Dependencies & Index Smells)**: Features circular references (`org <-> user`), duplicate B-Tree index prefixes, and boolean explosion (Grade C).
   - **Clean Relational Schema (3NF Benchmark)**: Pristine textbook-grade 3NF schema scoring 95+ (Grade A+).

7. **Audit Report Export**:
   - 1-click Markdown export and print-ready PDF audit report formatting.

---

## 🛠️ Architecture & Technology Stack

```
                               ┌──────────────────────────────────────────────┐
                               │               User Web Browser               │
                               │   (React 18 + Tailwind CSS + Lucide Icons)   │
                               └──────────────────────┬───────────────────────┘
                                                      │ HTTP / REST API
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           FastAPI Backend Server             │
                               │         (Python 3.10 / Uvicorn)              │
                               └───────┬──────────────┬──────────────┬────────┘
                                       │              │              │
                       ┌───────────────▼┐     ┌───────▼────────┐     │
                       │ SQL AST Parser │     │ Refactor Engine│     │
                       │   (sqlglot)    │     │(SQL Generation)│     │
                       └───────┬────────┘     └────────────────┘     │
                               │                                     │
                               ▼                                     │
                       ┌────────────────┐                            │
                       │ Schema Models  │                            │
                       │   (Pydantic)   │                            │
                       └───────┬────────┘                            │
                               │                                     │
                               ▼                                     ▼
                     ┌────────────────────┐                ┌──────────────────┐
                     │Smell Detect Engine │◄───────────────┤  Sample Schemas  │
                     │  (15+ Rulesets)    │                │  (4 Test Suites) │
                     └────────────────────┘                └──────────────────┘
```

- **Backend**:
  - **Language**: Python 3.10
  - **Framework**: FastAPI (high-throughput asynchronous REST API)
  - **Parser**: `sqlglot` (Abstract Syntax Tree generator supporting 20+ SQL dialects)
  - **Validation**: Pydantic v2
  - **Testing**: Pytest (100% automated test coverage across parser and all detection rules)
- **Frontend**:
  - **Framework**: React 18 + Vite
  - **Styling**: Tailwind CSS
  - **Icons**: Lucide React
  - **Interactivity**: Custom HTML5/SVG draggable ER diagram canvas & Canvas-Confetti

---

## 📋 Catalog of Detected Schema Smells

| Category | Smell Name | Academic / DBMS Theoretical Basis | Severity |
| :--- | :--- | :--- | :--- |
| **Integrity** | **Missing Primary Key** | Codd’s Relational Rule #2 (Entity Integrity). Tuples without a unique identifier cannot be clustered in B-Tree storage or uniquely indexed. | 🔴 Critical |
| **Integrity** | **Missing Foreign Key** | Referential Integrity Constraint. Storing `*_id` without constraints allows orphan records and phantom references when parent rows are deleted. | 🟠 High |
| **Integrity** | **Orphan / Disconnected Table** | Relational Cohesion. An isolated entity with no relationships in an OLTP schema indicates flat file imports or forgotten FKs. | 🟡 Medium |
| **Integrity** | **Nullable Foreign Key** | Three-Valued Logic (3VL). Joins on NULL evaluate to `UNKNOWN`, forcing `OUTER JOIN`s and complicating query planning. | 🟡 Medium |
| **Integrity** | **Circular References** | Acyclic Dependency Rule. Table A referencing Table B while Table B references Table A prevents deterministic insertion ordering and causes deadlocks. | 🟠 High |
| **Normalization** | **God Table / Blob Table** | Single Responsibility & Normalization. Exceeding 12–15 columns causes row-spill across disk blocks, cache thrashing, and high lock contention. | 🟠 High |
| **Normalization** | **1NF Multivalued Attribute** | First Normal Form (Atomicity). Storing delimited tags or lists in strings breaks B-Tree lookups and forces expensive `LIKE '%val%'` scans. | 🔴 Critical |
| **Normalization** | **EAV (Entity-Attribute-Value)** | Relational Typing. Storing generic `(entity_id, key, value)` breaks data types, constraints, and requires quadratic self-joins. | 🔴 Critical |
| **Normalization** | **Metadata Tribbles** | Physical/Logical Independence. Cloning tables by year/quarter forces continuous DDL changes instead of declarative range partitioning. | 🟠 High |
| **Normalization** | **Transitive Redundancy** | Third Normal Form (3NF). Embedding address attributes (`city`, `state`, `zip`) in transactional tables causes update anomalies. | 🟡 Medium |
| **Types & Naming** | **Fear of the Unknown** | Domain Integrity. Storing dates, timestamps, or money in `VARCHAR` disables date math, breaks lexicographical sorting, and wastes storage. | 🟠 High |
| **Types & Naming** | **Excessive Nullability** | Subtyping Antipattern. Having >60% nullable columns indicates unmodeled class hierarchies (Class-Table Inheritance needed). | 🟡 Medium |
| **Types & Naming** | **Boolean Explosion** | Finite State Machine Modeling. Having 4+ boolean flags allows contradictory states (`is_pending` AND `is_approved`), requiring an ENUM/lookup. | 🟡 Medium |
| **Types & Naming** | **Reserved Keyword Collision** | Lexical Scoping. Naming tables/columns `user`, `order`, `group` causes parser clashes and requires dialect-specific quoting. | 🔵 Low |
| **Performance** | **Unindexed Foreign Key** | Foreign Key Indexing & Table Locking. Deleting a parent row requires a full sequential scan on unindexed child FKs, escalating table locks. | 🟠 High |
| **Performance** | **Duplicate / Redundant Index** | Leftmost Prefix Rule. An index on `(A)` is redundant if a composite index on `(A, B)` exists, doubling write latency. | 🟡 Medium |

---

## ⚡ Quick Start & How to Run

### Method 1: One-Click Startup (Windows)
Double-click `run_app.bat` in the project root:
```cmd
run_app.bat
```
*This automatically activates the Python virtual environment, launches the FastAPI server on port 8000, and opens `http://localhost:8000` in your web browser.*

### Method 2: Manual Startup

#### 1. Backend:
```bash
cd backend
py -3.10 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

A comprehensive suite of 10 automated test cases tests parsing, all detection rules, the scoring engine, and API routes:

```bash
cd backend
venv\Scripts\activate
pytest -v
```

Output:
```
tests/test_detectors.py::test_sql_parser_basic PASSED                    [ 10%]
tests/test_detectors.py::test_missing_primary_key_detector PASSED        [ 20%]
tests/test_detectors.py::test_missing_foreign_key_detector PASSED        [ 30%]
tests/test_detectors.py::test_god_table_detector PASSED                  [ 40%]
tests/test_detectors.py::test_eav_detector PASSED                        [ 50%]
tests/test_detectors.py::test_multivalued_1nf_detector PASSED            [ 60%]
tests/test_detectors.py::test_unindexed_foreign_key_detector PASSED      [ 70%]
tests/test_detectors.py::test_sample_schemas_analysis PASSED             [ 80%]
tests/test_detectors.py::test_refactor_generator PASSED                  [ 90%]
tests/test_detectors.py::test_api_routes PASSED                          [100%]
======================= 10 passed in 1.30s ========================
```

---

## 🎓 DBMS Viva & Presentation Talking Points

During your DBMS project evaluation, here are answers to common questions your evaluators may ask:

1. **Q: Why does an unindexed Foreign Key degrade database performance?**  
   *A:* When a parent table record is updated or deleted, the DBMS must verify that child records comply with referential integrity (e.g. `ON DELETE CASCADE` or `RESTRICT`). Without an index on the child table's foreign key column, the DBMS must execute a **full sequential table scan** on the child table and may acquire **table-level share locks**, throttling transaction concurrency.

2. **Q: What is the formal definition of First Normal Form (1NF), and how does the detector find violations?**  
   *A:* 1NF requires that the domain of all attributes consist only of atomic (indivisible) values, meaning no attribute may contain repeating groups or composite lists. The detector identifies columns named `tags`, `phones`, `emails`, or `*_list` stored as `VARCHAR`/`TEXT` containing comma-delimited or non-atomic values, and recommends decomposing them into a 1:N child table.

3. **Q: Why is the Entity-Attribute-Value (EAV) pattern considered an anti-pattern in relational databases?**  
   *A:* EAV abandons relational algebra. Because `value` must hold integers, dates, and strings, it is typed as `VARCHAR`/`TEXT`, which removes data typing, `CHECK` constraints, and foreign keys. Furthermore, reconstructing an entity with 10 attributes requires 10 self-joins, turning polynomial queries into exponential latency bottlenecks.

4. **Q: What is the Leftmost Prefix Rule of B-Tree indexing?**  
   *A:* In a multi-column composite B-Tree index on `(col_a, col_b)`, the index is sorted primarily by `col_a` and secondarily by `col_b`. Any query filtering by `col_a` can utilize this index. Therefore, creating a separate index solely on `(col_a)` is redundant, doubling disk I/O and write write-ahead logging (WAL) overhead with zero query performance benefit.

---

## 📂 Project Directory Structure

```
dbms-schema-smell-detector/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py              # REST Endpoints: /analyze, /samples, /refactor
│   │   ├── detectors/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # BaseSmellDetector abstract class
│   │   │   ├── integrity.py           # Missing PK, Missing FK, Orphan, Nullable FK, Circular FK
│   │   │   ├── normalization.py       # God Table, 1NF Multivalued, EAV, Tribbles, 2NF/3NF
│   │   │   ├── types_and_naming.py    # Fear of Unknown types, Excessive nulls, Booleans, Keywords
│   │   │   ├── performance.py         # Unindexed FK, Duplicate B-Tree Index
│   │   │   └── engine.py              # Orchestrator aggregating smells & scoring algorithm
│   │   ├── parser/
│   │   │   ├── __init__.py
│   │   │   ├── sql_parser.py          # sqlglot AST + regex fallback schema parser
│   │   │   └── schema_models.py       # Pydantic schemas (Table, Column, ForeignKey, Index, Smell)
│   │   ├── refactor/
│   │   │   ├── __init__.py
│   │   │   └── fix_generator.py       # Generates ALTER migration SQL & clean 3NF DDL
│   │   ├── samples/
│   │   │   ├── __init__.py
│   │   │   └── sample_schemas.py      # E-Commerce, Hospital, SaaS, and Clean benchmark schemas
│   │   └── main.py                    # FastAPI app entrypoint & static asset server
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_detectors.py          # 10 comprehensive pytest test cases
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top bar, sample loader, dialect switcher, audit CTA
│   │   │   ├── SchemaEditor.jsx       # SQL DDL editor with file upload & line count
│   │   │   ├── HealthScoreCard.jsx    # Health score radial gauge, letter grade, category meters
│   │   │   ├── ERDiagram.jsx          # Interactive draggable ER diagram with smell badges
│   │   │   ├── SmellList.jsx          # Searchable, filterable smell explorer
│   │   │   ├── SmellCard.jsx          # Expandable smell card with theory, impact & 1-click SQL fix
│   │   │   ├── RefactorView.jsx       # Side-by-side migration & 3NF refactored schema viewer
│   │   │   └── ExportModal.jsx        # Markdown & print/PDF export modal
│   │   ├── services/
│   │   │   └── api.js                 # API service layer
│   │   ├── App.jsx                    # Core application layout & tab state
│   │   ├── main.jsx                   # React root mount
│   │   └── index.css                  # Tailwind styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── run_app.bat                        # Windows 1-click startup batch script
└── README.md                          # Comprehensive project documentation
```

---

## 📜 License
This project is open-source and created for academic DBMS evaluation and software engineering education.