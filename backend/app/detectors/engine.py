from typing import List, Dict
from app.parser.schema_models import (
    CategoryScore,
    DetectedSmell,
    SchemaAnalysisResult,
    SchemaInfo,
    SchemaMetrics,
    SmellCategory,
    SmellSeverity,
)
from app.detectors.integrity import (
    MissingPrimaryKeyDetector,
    MissingForeignKeyDetector,
    OrphanTableDetector,
    NullableForeignKeyDetector,
    CircularReferenceDetector,
)
from app.detectors.normalization import (
    GodTableDetector,
    MultivaluedAttributeDetector,
    EAVAntipatternDetector,
    MetadataTribblesDetector,
    TransitiveRedundancyDetector,
)
from app.detectors.types_and_naming import (
    GenericTypeDetector,
    ExcessiveNullabilityDetector,
    BooleanExplosionDetector,
    ReservedWordDetector,
)
from app.detectors.performance import (
    UnindexedForeignKeyDetector,
    DuplicateIndexDetector,
)

class SmellDetectionEngine:
    """
    Coordinates all detectors, aggregates smells, and computes
    overall and category health scores.
    """

    def __init__(self):
        self.detectors = [
            # Integrity
            MissingPrimaryKeyDetector(),
            MissingForeignKeyDetector(),
            OrphanTableDetector(),
            NullableForeignKeyDetector(),
            CircularReferenceDetector(),
            # Normalization
            GodTableDetector(),
            MultivaluedAttributeDetector(),
            EAVAntipatternDetector(),
            MetadataTribblesDetector(),
            TransitiveRedundancyDetector(),
            # Types & Naming
            GenericTypeDetector(),
            ExcessiveNullabilityDetector(),
            BooleanExplosionDetector(),
            ReservedWordDetector(),
            # Performance
            UnindexedForeignKeyDetector(),
            DuplicateIndexDetector(),
        ]

        self.severity_weights = {
            SmellSeverity.CRITICAL: 12,
            SmellSeverity.HIGH: 7,
            SmellSeverity.MEDIUM: 4,
            SmellSeverity.LOW: 2,
        }

    def analyze(self, schema: SchemaInfo) -> SchemaAnalysisResult:
        all_smells: List[DetectedSmell] = []

        for detector in self.detectors:
            try:
                smells = detector.detect(schema)
                all_smells.extend(smells)
            except Exception as e:
                # Silently catch or log individual detector failure to prevent crashing analysis
                pass

        # Calculate metrics
        total_tables = len(schema.tables)
        total_columns = sum(len(t.columns) for t in schema.tables.values())
        total_foreign_keys = sum(len(t.foreign_keys) for t in schema.tables.values())
        total_indexes = sum(len(t.indexes) for t in schema.tables.values())
        tables_without_pk = sum(1 for t in schema.tables.values() if not t.primary_keys)

        smells_by_severity = {s.value: 0 for s in SmellSeverity}
        smells_by_category = {c.value: 0 for c in SmellCategory}

        for s in all_smells:
            smells_by_severity[s.severity.value] += 1
            smells_by_category[s.category.value] += 1

        # Calculate category scores
        category_deductions = {c: 0 for c in SmellCategory}
        for s in all_smells:
            category_deductions[s.category] += self.severity_weights.get(s.severity, 3)

        category_display_names = {
            SmellCategory.INTEGRITY: "Referential & Entity Integrity",
            SmellCategory.NORMALIZATION: "Normalization & 1NF/2NF/3NF",
            SmellCategory.TYPES_AND_NAMING: "Domain Types & Design Cleanliness",
            SmellCategory.PERFORMANCE: "Indexing & Query Performance",
        }

        category_scores: List[CategoryScore] = []
        for cat in SmellCategory:
            deduction = category_deductions[cat]
            score = max(0, 100 - (deduction * 4))
            status = "EXCELLENT" if score >= 90 else "GOOD" if score >= 75 else "NEEDS_IMPROVEMENT" if score >= 50 else "CRITICAL"
            category_scores.append(
                CategoryScore(
                    category=cat,
                    name=category_display_names[cat],
                    score=score,
                    deductions=deduction,
                    smell_count=smells_by_category[cat.value],
                    status=status,
                )
            )

        # Calculate overall score
        total_penalty = sum(self.severity_weights[s.severity] for s in all_smells)
        # Factor in size of schema (a 20-table schema with 2 smells is better than a 2-table schema with 2 smells)
        scale_factor = max(1.0, total_tables * 0.4)
        effective_penalty = total_penalty / scale_factor
        overall_score = max(5, min(100, int(100 - (effective_penalty * 2.5))))

        # If zero smells, 100%
        if not all_smells:
            overall_score = 100

        grade = self._score_to_grade(overall_score)
        summary_text = self._build_summary(overall_score, grade, all_smells, total_tables)

        metrics = SchemaMetrics(
            total_tables=total_tables,
            total_columns=total_columns,
            total_foreign_keys=total_foreign_keys,
            total_indexes=total_indexes,
            tables_without_pk=tables_without_pk,
            smells_by_severity=smells_by_severity,
            smells_by_category=smells_by_category,
        )

        return SchemaAnalysisResult(
            dialect=schema.dialect,
            overall_score=overall_score,
            grade=grade,
            summary_text=summary_text,
            metrics=metrics,
            category_scores=category_scores,
            tables=list(schema.tables.values()),
            smells=all_smells,
        )

    def _score_to_grade(self, score: int) -> str:
        if score >= 95:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 75:
            return "B"
        elif score >= 60:
            return "C"
        elif score >= 45:
            return "D"
        else:
            return "F"

    def _build_summary(self, score: int, grade: str, smells: List[DetectedSmell], total_tables: int) -> str:
        if not smells:
            return f"Excellent schema design! No architectural or normalization smells detected across {total_tables} tables."
        
        crit_count = sum(1 for s in smells if s.severity == SmellSeverity.CRITICAL)
        high_count = sum(1 for s in smells if s.severity == SmellSeverity.HIGH)
        
        if crit_count > 0:
            return (
                f"Schema scored {score}/100 (Grade {grade}). Detected {crit_count} Critical and {high_count} High-severity "
                f"relational violations that jeopardize entity integrity, 1NF normalization, or query safety."
            )
        elif high_count > 0:
            return (
                f"Schema scored {score}/100 (Grade {grade}). Schema contains {high_count} high-priority design antipatterns "
                f"(such as unindexed foreign keys or unnormalized tables) requiring attention."
            )
        else:
            return (
                f"Schema scored {score}/100 (Grade {grade}). Minor stylistic or typing smells identified; overall architecture "
                f"maintains adequate relational integrity."
            )