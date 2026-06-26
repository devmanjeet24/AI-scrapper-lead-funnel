from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ExtractionResult:
    page_title: str | None
    meta_description: str | None
    canonical_url: str | None
    headings_h1: list[str]
    headings_h2: list[str]
    visible_text_sample: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "page_title": self.page_title,
            "meta_description": self.meta_description,
            "canonical_url": self.canonical_url,
            "headings": {
                "h1": self.headings_h1,
                "h2": self.headings_h2,
            },
            "visible_text_sample": self.visible_text_sample,
        }


@dataclass(slots=True)
class ScrapeOutput:
    target_url: str
    final_url: str
    page_title: str | None
    raw_html: str
    extraction: ExtractionResult
    metadata: dict[str, Any] = field(default_factory=dict)
