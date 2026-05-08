"""Day 1 sanity tests."""
from datetime import date

from tuna_agents.root import root_agent
from tuna_agents.schemas import TripIntent, Traveler


def test_root_agent_constructed():
    assert root_agent.name == "tuna_root"
    assert "gemini-3.1" in root_agent.model


def test_trip_intent_minimal():
    intent = TripIntent(destinations=["Lisbon"], duration_days=5)
    assert intent.destinations == ["Lisbon"]
    assert intent.duration_days == 5
    assert intent.travelers == []


def test_trip_intent_full():
    intent = TripIntent(
        origin="Bangalore",
        destinations=["Lisbon", "Sintra"],
        start_date=date(2026, 6, 10),
        end_date=date(2026, 6, 15),
        travelers=[Traveler(role="adult"), Traveler(role="adult")],
        price_band="$$",
        travel_styles=["city_break", "food"],
        must_haves=["aisle seats", "vegetarian friendly"],
    )
    assert intent.duration_days is None  # explicit dates given
    assert intent.price_band == "$$"
    assert "vegetarian friendly" in intent.must_haves
