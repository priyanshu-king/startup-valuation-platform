"""Build a downloadable PDF from immutable saved valuation data."""

from io import BytesIO
import json
import logging
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from models.security import ValuationReport
from models.valuation import StartupProfile, ValuationResult
from schemas.reports import ReportDetail, ReportSummary

logger = logging.getLogger(__name__)
GREEN = colors.HexColor("#315b42")
INK = colors.HexColor("#27312a")
MUTED = colors.HexColor("#647066")
LIGHT = colors.HexColor("#edf2ec")
INR_SYMBOL = "INR"


def _json_value(raw: str, fallback: object) -> object:
    try:
        return json.loads(raw) if raw else fallback
    except (TypeError, json.JSONDecodeError):
        logger.exception("Malformed JSON in persisted valuation report")
        raise ValueError("Saved report data is invalid.") from None


def _as_dict(value: object, section: str) -> dict:
    if not isinstance(value, dict):
        raise ValueError(f"Saved report {section} is invalid.")
    return value


def _as_list(value: object, section: str) -> list:
    if not isinstance(value, list):
        raise ValueError(f"Saved report {section} is invalid.")
    return value


def make_report_summary(report: ValuationReport, profile: StartupProfile, result: ValuationResult) -> ReportSummary:
    return ReportSummary(
        report_id=report.id,
        valuation_id=result.id,
        company_name=profile.name,
        generated_at=report.created_at,
        valuation_low=result.valuation_low,
        valuation_base=result.valuation_base,
        valuation_high=result.valuation_high,
        currency="INR crore",
        status=report.status,
    )


def make_report_detail(report: ValuationReport, profile: StartupProfile, result: ValuationResult) -> ReportDetail:
    methods = _as_list(_json_value(result.method_breakdown_json, []), "methods")
    strengths = _as_list(_json_value(result.strengths_json, []), "strengths")
    risks = _as_list(_json_value(result.risks_json, []), "risks")
    assumptions = _as_dict(_json_value(result.assumptions_json, {}), "assumptions")
    return ReportDetail(
        **make_report_summary(report, profile, result).model_dump(),
        profile={
            "name": profile.name, "industry": profile.industry, "country": profile.country,
            "founded_year": profile.founded_year, "business_model": profile.business_model,
            "stage": profile.stage,
        },
        financials={
            "annual_revenue": profile.annual_revenue, "mrr": profile.mrr,
            "revenue_growth_yoy": profile.revenue_growth_yoy, "gross_margin": profile.gross_margin,
            "monthly_opex": profile.monthly_opex, "monthly_burn": profile.monthly_burn,
            "cash_available": profile.cash_available, "total_funding_raised": profile.total_funding_raised,
        },
        business={
            "total_customers": profile.total_customers, "monthly_active_users": profile.monthly_active_users,
            "cac": profile.cac, "ltv": profile.ltv, "churn_rate": profile.churn_rate, "arpu": profile.arpu,
        },
        market={
            "tam": profile.tam, "sam": profile.sam, "som": profile.som,
            "market_growth": profile.market_growth, "num_competitors": profile.num_competitors,
            "competitive_advantage": profile.competitive_advantage,
        },
        method_breakdown=methods,
        strengths=strengths,
        risks=risks,
        assumptions=assumptions,
        scores={
            "financial_health": result.financial_health_score,
            "growth": result.growth_score,
            "investor_readiness": result.investor_readiness_score,
        },
        cash_runway_months=result.cash_runway_months or None,
        ltv_cac_ratio=result.ltv_cac_ratio or None,
        is_pre_revenue=result.is_pre_revenue,
        disclaimer=result.disclaimer,
    )


def _money(value: object) -> str:
    return f"{INR_SYMBOL} {float(value):,.0f}" if value is not None else "Not provided"


def _paragraph(text: object, style: ParagraphStyle) -> Paragraph:
    safe = str(text).replace("₹", "INR ").replace("–", "-").replace("—", "-").replace("·", "/").replace("×", "x")
    safe = safe.encode("ascii", "replace").decode("ascii")
    return Paragraph(escape(safe), style)


def generate_valuation_pdf(report: ReportDetail) -> bytes:
    output = BytesIO()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="BrandTitle", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=22, leading=27, textColor=GREEN, alignment=TA_CENTER, spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="SectionHeading", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=12, leading=16, textColor=GREEN, spaceBefore=12, spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="SmallMuted", parent=styles["BodyText"], fontSize=8, leading=11, textColor=MUTED,
    ))
    styles["BodyText"].textColor = INK
    doc = SimpleDocTemplate(
        output, pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=17 * mm, bottomMargin=18 * mm,
        title=f"Startup Valuation Report - {report.profile['name']}",
        author="Startup Valuation",
    )
    story = [
        Paragraph("Startup Valuation Report", styles["BrandTitle"]),
        _paragraph(report.profile["name"], styles["Heading2"]),
        _paragraph(
            f"Generated {report.generated_at.strftime('%d %B %Y')} / Report #{report.report_id} / "
            f"{report.profile['industry']} · {report.profile['stage'].replace('_', ' ').title()}",
            styles["SmallMuted"],
        ),
        Spacer(1, 7 * mm),
        Paragraph("Estimated valuation range", styles["SectionHeading"]),
    ]
    valuation_rows = [
        ["Low estimate", "Base estimate", "High estimate"],
        [f"{report.valuation_low:,.2f} Cr", f"{report.valuation_base:,.2f} Cr", f"{report.valuation_high:,.2f} Cr"],
    ]
    story.append(Table(valuation_rows, colWidths=[55 * mm] * 3, style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BACKGROUND", (0, 1), (-1, 1), LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d4ddd3")),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ])))

    def section(title: str, rows: list[list[object]]) -> None:
        story.append(Paragraph(title, styles["SectionHeading"]))
        table_rows = [[_paragraph(cell, styles["BodyText"]) for cell in row] for row in rows]
        story.append(Table(table_rows, colWidths=[58 * mm, 107 * mm], repeatRows=1, style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
            ("TEXTCOLOR", (0, 0), (-1, 0), INK),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d4ddd3")),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])))

    section("Startup profile", [
        ["Input", "Saved value"],
        ["Company", report.profile["name"]],
        ["Industry / country", f"{report.profile['industry']} / {report.profile['country']}"],
        ["Founded / business model", f"{report.profile['founded_year']} / {report.profile['business_model']}"],
    ])
    section("Financial inputs (user provided)", [
        ["Input", "Saved value"],
        ["Annual revenue / MRR", f"{_money(report.financials['annual_revenue'])} / {_money(report.financials['mrr'])}"],
        ["Revenue growth / gross margin", f"{report.financials['revenue_growth_yoy']}% / {report.financials['gross_margin']}%"],
        ["Monthly OpEx / burn", f"{_money(report.financials['monthly_opex'])} / {_money(report.financials['monthly_burn'])}"],
        ["Available cash / funding raised", f"{_money(report.financials['cash_available'])} / {_money(report.financials['total_funding_raised'])}"],
    ])
    section("Business and market inputs (user provided)", [
        ["Input", "Saved value"],
        ["Customers / monthly active users", f"{report.business['total_customers']:,} / {report.business['monthly_active_users']:,}"],
        ["CAC / LTV / ARPU", f"{_money(report.business['cac'])} / {_money(report.business['ltv'])} / {_money(report.business['arpu'])}"],
        ["Monthly churn", f"{report.business['churn_rate']}%"],
        ["TAM / SAM / SOM (INR crore)", f"{report.market['tam']:,.2f} / {report.market['sam']:,.2f} / {report.market['som']:,.2f}"],
        ["Market growth / competitors", f"{report.market['market_growth']}% / {report.market['num_competitors']}"],
        ["Competitive advantage", report.market["competitive_advantage"] or "Not provided"],
    ])
    story.append(Paragraph("Calculation methods", styles["SectionHeading"]))
    methods = [["Method", "Estimate", "Applicability / saved assumption"]]
    for method in report.method_breakdown:
        methods.append([
            _paragraph(method.get("method_name", ""), styles["BodyText"]),
            "Not applicable" if method.get("value_crore") is None else f"{float(method['value_crore']):,.2f} Cr",
            _paragraph(method.get("note", ""), styles["SmallMuted"]),
        ])
    story.append(Table(methods, colWidths=[42 * mm, 32 * mm, 91 * mm], repeatRows=1, style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d4ddd3")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ])))
    score_rows = [["Measure", "Saved result"]]
    score_rows += [[name.replace("_", " ").title(), f"{value:.1f} / 100"] for name, value in report.scores.items()]
    score_rows += [["Cash runway", "Not available" if report.cash_runway_months is None else f"{report.cash_runway_months:.1f} months"]]
    score_rows += [["LTV / CAC", "Not available" if report.ltv_cac_ratio is None else f"{report.ltv_cac_ratio:.2f}x"]]
    section("Scores and derived metrics", score_rows)

    for title, items in (("Reported strengths", report.strengths), ("Reported risks", report.risks)):
        if items:
            story.append(Paragraph(title, styles["SectionHeading"]))
            story.extend(Paragraph(f"- {escape(str(item))}", styles["BodyText"]) for item in items)
    story.append(Paragraph("Saved assumptions", styles["SectionHeading"]))
    story.append(_paragraph(json.dumps(report.assumptions, ensure_ascii=True, indent=2), styles["Code"]))
    story.append(Spacer(1, 4 * mm))
    story.append(KeepTogether([
        Paragraph("Limitations and disclaimer", styles["SectionHeading"]),
        _paragraph(report.disclaimer, styles["SmallMuted"]),
        _paragraph(
            "This report reflects the valuation result and inputs saved at calculation time. It does not "
            "refresh or recalculate the estimate, use external market comparables, or constitute a formal "
            "appraisal, investment advice, or a guarantee of future performance.",
            styles["SmallMuted"],
        ),
    ]))

    def page_footer(canvas, document) -> None:
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#d4ddd3"))
        canvas.line(18 * mm, 13 * mm, A4[0] - 18 * mm, 13 * mm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(18 * mm, 8 * mm, f"Startup Valuation / Saved report #{report.report_id}")
        canvas.drawRightString(A4[0] - 18 * mm, 8 * mm, f"Page {document.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    content = output.getvalue()
    if not content.startswith(b"%PDF-") or len(content) < 500:
        raise ValueError("Could not generate a valid valuation report PDF.")
    return content
