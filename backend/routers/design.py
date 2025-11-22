"""API routes for Human Design calculations and reporting."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.models.schemas import (
    BirthInput,
    CalculationResponse,
    ReportRequest,
    ReportResponse,
)
from backend.services import ai_service, calculations, chart_renderer

router = APIRouter(prefix="/api", tags=["human-design"])


@router.post("/calculate", response_model=CalculationResponse)
async def calculate_chart(payload: BirthInput) -> CalculationResponse:
    try:
        birth = calculations.BirthData(
            name=payload.name,
            city=payload.city,
            latitude=payload.latitude,
            longitude=payload.longitude,
            datetime=payload.datetime,
        )
        result = calculations.perform_calculation(birth)
    except Exception as exc:  # pragma: no cover - surfaced to clients
        raise HTTPException(status_code=400, detail=str(exc))

    svg = chart_renderer.generate_svg(result.defined_centers, result.active_channels)
    return CalculationResponse(
        personality=result.personality,
        design=result.design,
        defined_centers=result.defined_centers,
        active_channels=result.active_channels,
        hd_type=result.hd_type,
        **{"svg": svg},
    )


@router.post("/report", response_model=ReportResponse)
async def generate_report(payload: ReportRequest) -> ReportResponse:
    try:
        content = ai_service.generate_reading(payload.calculation.dict())
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc))
    return ReportResponse(content=content, metadata={"model": "gemini-1.5-pro"})

