from abc import ABC, abstractmethod
from typing import List
from app.parser.schema_models import DetectedSmell, SchemaInfo, SmellCategory, SmellSeverity

class BaseSmellDetector(ABC):
    id: str
    name: str
    category: SmellCategory
    severity: SmellSeverity

    @abstractmethod
    def detect(self, schema: SchemaInfo) -> List[DetectedSmell]:
        """Analyze schema and return list of detected smells."""
        pass