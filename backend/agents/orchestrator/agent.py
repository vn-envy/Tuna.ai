from google.adk.agents import Agent
import os

# We will use mock data for now, so we don't strictly need the Gemini API key 
# to run the app, but ADK requires an API key to initialize the Agent objects.
# We'll set a dummy key if none exists just so ADK doesn't crash on import.
if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = "mock_key_for_now"

from agents.destination_scout.tools import search_photogenic_places

destination_scout = Agent(
    name="destination_scout",
    model="gemini-2.5-flash",
    description="Finds photogenic places",
    instruction="Find photogenic locations based on user input by searching real data.",
    tools=[search_photogenic_places]
)

itinerary_architect = Agent(
    name="itinerary_architect",
    model="gemini-2.5-flash",
    description="Builds itineraries",
    instruction="Create day by day itineraries with golden hour timing.",
    tools=[]
)

content_strategist = Agent(
    name="content_strategist",
    model="gemini-2.5-flash",
    description="Researches content ideas",
    instruction="Provide ideas for travel content.",
    tools=[]
)

logistics_manager = Agent(
    name="logistics_manager",
    model="gemini-2.5-flash",
    description="Handles logistics and budget",
    instruction="Help with budget and emails.",
    tools=[]
)

root_agent = Agent(
    name="tuna",
    model="gemini-2.5-flash",
    description="Tuna - AI travel planning companion for content creators",
    instruction="""You are Tuna 🐟, an AI travel planning companion built specifically for travel influencers and content creators.
    Use your sub-agents to help the user.""",
    sub_agents=[destination_scout, itinerary_architect, content_strategist, logistics_manager],
)
