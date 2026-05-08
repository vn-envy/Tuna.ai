"use client";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

// We'll use a hardcoded default center for now, or expect it to be passed via props later.
const defaultCenter = { lat: -8.409518, lng: 115.188919 }; // Bali

export default function MapView() {
  // Try to get key from env, but provide a safe fallback so the UI doesn't completely crash if missing
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="relative w-full h-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
        <div className="z-10 bg-black/40 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl text-center max-w-sm">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold mb-2">Map Unavailable</h3>
          <p className="text-sm text-slate-400">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing. Add it to frontend/.env.local to view the live map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={11}
          mapId="DEMO_MAP_ID" // Requires a Map ID for Advanced Markers, using a generic one
          disableDefaultUI={true}
          className="w-full h-full"
        >
          {/* Example Marker for Uluwatu */}
          <Marker position={{ lat: -8.8291, lng: 115.0844 }} />
          {/* Example Marker for Tegallalang */}
          <Marker position={{ lat: -8.4333, lng: 115.2792 }} />
        </Map>
      </APIProvider>
    </div>
  );
}
