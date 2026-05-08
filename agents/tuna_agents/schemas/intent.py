"""Structured types passed between Tuna agents."""
from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


PriceBand = Literal["$", "$$", "$$$", "$$$$"]
TravelStyle = Literal[
    "city_break",
    "beach",
    "outdoor",
    "cultural",
    "food",
    "adventure",
    "wellness",
    "family",
    "business_leisure",
    "multi_city",
]


class Traveler(BaseModel):
    role: Literal["adult", "child", "infant"] = "adult"
    age: int | None = None


class TripIntent(BaseModel):
    """Structured user intent. The contract Root produces and Scout consumes."""

    origin: str | None = Field(
        default=None,
        description="City or airport the trip starts from. None = unspecified.",
    )
    destinations: list[str] = Field(
        default_factory=list,
        description="One or more named destinations or regions.",
    )
    flexible_destination: bool = Field(
        default=False,
        description="True if user is open to suggestions vs. a fixed destination.",
    )
    start_date: date | None = None
    end_date: date | None = None
    duration_days: int | None = Field(
        default=None,
        description="If only duration is known but not exact dates.",
    )
    flexible_dates: bool = False

    travelers: list[Traveler] = Field(default_factory=list)
    price_band: PriceBand | None = None
    budget_total_usd: int | None = None

    travel_styles: list[TravelStyle] = Field(default_factory=list)
    must_haves: list[str] = Field(default_factory=list)
    avoid: list[str] = Field(default_factory=list)

    notes: str | None = Field(
        default=None,
        description="Any free-form context the user provided that doesn't fit elsewhere.",
    )
