import os
import googlemaps

def search_photogenic_places(query: str, location_bias: str = "Bali") -> list:
    """
    Searches Google Places for photogenic locations based on the user's query.
    Returns a list of places with details optimized for content creators.
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key or api_key == "mock_key_for_now":
        return [{"error": "GOOGLE_API_KEY is not set or is mock key. Cannot search real places."}]
        
    try:
        gmaps = googlemaps.Client(key=api_key)
        # Combine query with location for better text search results
        search_query = f"{query} in {location_bias}"
        
        # We use text_search to get broad results based on a concept (e.g. "sunset spots")
        places_result = gmaps.places(query=search_query)
        
        results = []
        # Limit to top 3 to keep streaming fast
        for place in places_result.get('results', [])[:3]:
            # Try to determine a mock golden hour based on if it's East or West facing
            # (In a real production app we'd calculate this based on lat/lng and sunrise API)
            golden_hour_mock = "06:00 - 07:00 (Sunrise)" if "sunrise" in query.lower() or "east" in query.lower() else "17:30 - 18:30 (Sunset)"
            
            results.append({
                "id": place.get('place_id'),
                "name": place.get('name'),
                "type": place.get('types', ['Attraction'])[0].replace('_', ' ').title(),
                "rating": place.get('rating', 'N/A'),
                "golden_hour": golden_hour_mock,
                "description": f"Located at {place.get('formatted_address', '')}. User ratings suggest it's highly photogenic."
            })
            
        return results
    except Exception as e:
        return [{"error": f"Failed to search places: {str(e)}"}]
