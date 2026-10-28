"""Owner-scoped report history, report details, and on-demand PDF downloads."""

import logging
from io import BytesIO
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import CurrentUser, require_csrf
from database.session import get_db
from models.security import User, ValuationReport
from models.valuation import StartupProfile, ValuationResult
from schemas.reports import ReportDetail, ReportSummary
from services.report_service import generate_valuation_pdf, make_report_detail, make_report_summary

router = APIRouter()
logger = logging.getLogger(__name__)
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def _owned_report(
    report_id: int,
    user: User,
    db: AsyncSession,
) -> tuple[ValuationReport, StartupProfile, ValuationResult]:
    statement = (
        select(ValuationReport, StartupProfile, ValuationResult)
        .join(ValuationResult, ValuationReport.valuation_id == ValuationResult.id)
        .join(StartupProfile, ValuationResult.startup_profile_id == StartupProfile.id)
        .where(
            ValuationReport.id == report_id,
            ValuationReport.user_id == user.id,
            ValuationResult.owner_id == user.id,
            StartupProfile.owner_id == user.id,
        )
    )
    row = (await db.execute(statement)).one_or_none()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return row


@router.get("", response_model=list[ReportSummary], summary="List saved valuation reports")
async def list_reports(user: CurrentUser, db: DbSession) -> list[ReportSummary]:
    statement = (
        select(ValuationReport, StartupProfile, ValuationResult)
        .join(ValuationResult, ValuationReport.valuation_id == ValuationResult.id)
        .join(StartupProfile, ValuationResult.startup_profile_id == StartupProfile.id)
        .where(
            ValuationReport.user_id == user.id,
            ValuationResult.owner_id == user.id,
            StartupProfile.owner_id == user.id,
        )
        .order_by(ValuationReport.created_at.desc(), ValuationReport.id.desc())
    )
    rows = (await db.execute(statement)).all()
    return [make_report_summary(report, profile, result) for report, profile, result in rows]


@router.get("/{report_id}/pdf", summary="Download saved valuation report PDF")
async def download_report_pdf(report_id: int, user: CurrentUser, db: DbSession) -> StreamingResponse:
    report, profile, result = await _owned_report(report_id, user, db)
    try:
        detail = make_report_detail(report, profile, result)
        pdf = generate_valuation_pdf(detail)
    except ValueError as exc:
        logger.exception("Could not render saved valuation report %s", report_id)
        raise HTTPException(status_code=500, detail="The saved report data is invalid and could not be rendered.") from exc
    return StreamingResponse(
        BytesIO(pdf),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="startup-valuation-report-{report.id}.pdf"',
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/{report_id}", response_model=ReportDetail, summary="View saved valuation report")
async def get_report(report_id: int, user: CurrentUser, db: DbSession) -> ReportDetail:
    report, profile, result = await _owned_report(report_id, user, db)
    try:
        return make_report_detail(report, profile, result)
    except ValueError as exc:
        logger.exception("Could not read saved valuation report %s", report_id)
        raise HTTPException(status_code=500, detail="The saved report data is invalid.") from exc


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete saved valuation report")
async def delete_report(
    report_id: int,
    user: CurrentUser,
    _: Annotated[None, Depends(require_csrf)],
    db: DbSession,
) -> Response:
    report, profile, result = await _owned_report(report_id, user, db)
    await db.delete(report)
    await db.flush()
    await db.delete(result)
    await db.flush()
    remaining = await db.scalar(
        select(func.count(ValuationResult.id)).where(
            ValuationResult.startup_profile_id == profile.id,
            ValuationResult.id != result.id,
        )
    )
    if not remaining:
        await db.delete(profile)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
