"""Pydantic schemas for the Human Design API."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Set

from pydantic import BaseModel, Field, validator


class BirthInput(BaseModel):
    name: str
    city: str
    latitude: float
    longitude: float
    datetime: datetime

    @validator("datetime")
    def ensure_naive(cls, v: datetime) -> datetime:  # noqa: B902
        if v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v


class GateActivationSchema(BaseModel):
    planet: str
    gate: int
    line: int
    degree: float
    consciousness: str


class CalculationResponse(BaseModel):
    personality: List[GateActivationSchema]
    design: List[GateActivationSchema]
    defined_centers: Set[str]
    active_channels: Set[str]
    hd_type: str
    svg: str | None = Field(None, description="Rendered SVG BodyGraph")


class ReportRequest(BaseModel):
    calculation: CalculationResponse


class ReportResponse(BaseModel):
    content: str = Field(..., description="Markdown report from Gemini")
    metadata: Dict[str, Any] = Field(default_factory=dict)

