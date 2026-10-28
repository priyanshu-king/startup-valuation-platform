"""
AI Service Abstraction Layer
==============================
Defines the interface that ALL AI providers must implement.
The active provider is selected at runtime via the AI_PROVIDER env var.

To add a new provider:
1. Create a new class that inherits from BaseAIService.
2. Implement all abstract methods.
3. Register it in get_ai_service() below.

Current providers:
    mock     — returns structured placeholder analysis (no API call)
    openai   — GPT-4o via OpenAI API           (TODO: Phase 2)
    anthropic— Claude 3.5 Sonnet via Anthropic  (TODO: Phase 2)
    google   — Gemini 1.5 Pro via Google AI     (TODO: Phase 2)
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from functools import lru_cache
from typing import Any, Dict

from core.config import settings


# ─── Abstract Base ───────────────────────────────────────────────────────────

class BaseAIService(ABC):
    """Contract that every AI provider must fulfil."""

    @abstractmethod
    async def analyse_valuation(
        self,
        startup_data: Dict[str, Any],
        valuation_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Analyse a startup and its valuation result using an LLM.

        Args:
            startup_data:     Structured startup profile and metrics.
            valuation_result: Output from the valuation engine.

        Returns:
            Dict containing:
                summary      (str)  — Executive summary paragraph
                strengths    (list) — Key positive factors
                risks        (list) — Key risk factors
                opportunities(list) — Identified growth opportunities
                confidence   (float)— Model confidence 0.0–1.0
                raw_response (str)  — Full LLM response text
        """

    @abstractmethod
    async def generate_investor_narrative(
        self,
        startup_data: Dict[str, Any],
        valuation_result: Dict[str, Any],
        analysis: Dict[str, Any],
    ) -> str:
        """
        Generate a polished investor narrative suitable for a report.

        Args:
            startup_data:     Startup profile and metrics.
            valuation_result: Valuation engine output.
            analysis:         Output from analyse_valuation().

        Returns:
            Formatted investor narrative as a markdown string.
        """


# ─── Mock Provider ───────────────────────────────────────────────────────────

class MockAIService(BaseAIService):
    """
    Deterministic mock provider for development and testing.
    Returns realistic-looking structured responses without hitting any API.
    Replace individual methods with real LLM calls in Phase 2.
    """

    async def analyse_valuation(
        self,
        startup_data: Dict[str, Any],
        valuation_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        startup_name = startup_data.get("name", "the startup")
        base = valuation_result.get("valuation_base", 0)
        return {
            "summary": (
                f"{startup_name} receives a model-based estimate of ₹{base:.2f} crore. "
                "This estimate uses the submitted inputs and disclosed mathematical "
                "assumptions only; it does not use external market comparables or an LLM."
            ),
            "strengths": valuation_result.get("strengths", []),
            "risks": valuation_result.get("risks", []),
            "opportunities": [],
            "confidence": 0.0,   # 0 = mock, never trust this value
            "provider": "rules",
            "raw_response": "Deterministic summary from the valuation result; no LLM used.",
        }

    async def generate_investor_narrative(
        self,
        startup_data: Dict[str, Any],
        valuation_result: Dict[str, Any],
        analysis: Dict[str, Any],
    ) -> str:
        startup_name = startup_data.get("name", "the startup")
        return (
            f"# Investor Narrative — {startup_name}\n\n"
            "> **Note**: This is a mock narrative. "
            "Configure `AI_PROVIDER` in your `.env` file to generate real content.\n\n"
            "## Executive Summary\n\n"
            f"{analysis.get('summary', '')}\n\n"
            "## Investment Thesis\n\n"
            "_Full AI-generated narrative will appear here once an LLM is configured._\n"
        )


# ─── Provider Registry ────────────────────────────────────────────────────────

@lru_cache
def get_ai_service() -> BaseAIService:
    """
    Factory function — returns the correct AI service based on config.
    Cached so only one instance is created per process lifetime.
    """
    provider = settings.AI_PROVIDER.lower()

    if provider == "mock":
        return MockAIService()

    # Phase 2 providers — raise a clear error so developers know what to do
    if provider == "openai":
        raise NotImplementedError(
            "OpenAI provider not yet implemented. "
            "Set AI_PROVIDER=mock or implement services/ai/openai_service.py"
        )
    if provider == "anthropic":
        raise NotImplementedError(
            "Anthropic provider not yet implemented. "
            "Set AI_PROVIDER=mock or implement services/ai/anthropic_service.py"
        )
    if provider == "google":
        raise NotImplementedError(
            "Google provider not yet implemented. "
            "Set AI_PROVIDER=mock or implement services/ai/google_service.py"
        )

    raise ValueError(
        f"Unknown AI_PROVIDER '{provider}'. "
        "Valid options: mock | openai | anthropic | google"
    )
