"use client";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

const defaultCenter = { lat: -8.409518, lng: 115.188919 };

type RuntimeConfig = {
  googleMapsApiKey: string;
};

export default function MapView() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRuntimeConfig() {
      try {
        const response = await fetch("/api/runtime-config", { cache: "no-store" });
        const config = (await response.json()) as RuntimeConfig;
        if (isMounted) {
          setApiKey(config.googleMapsApiKey || "");
        }
      } catch {
        if (isMounted) {
          setApiKey("");
        }
      }
    }

    loadRuntimeConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  if (apiKey === null) {
    return (
      <div className="relative w-full h-full bg-[#0f172a] flex items-center justify-center overflow-hidden" role="status" aria-live="polite">
        <p className="text-sm text-slate-300">Loading map configuration…</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="relative w-full h-full bg-[#0f172a] flex items-center justify-center overflow-hidden" role="status" aria-live="polite">
        <div className="z-10 bg-black/40 backdrop-blur-md border border-amber-500/30 p-6 rounded-2xl text-center max-w-md">
          <div className="text-4xl mb-4" aria-hidden="true">🗺️</div>
          <h3 className="text-xl font-bold mb-2">Map Configuration Needed</h3>
          <p className="text-sm text-slate-300">
            The frontend service is running, but Google Maps is not configured. Set
            GOOGLE_MAPS_API_KEY on the Cloud Run frontend service and redeploy or restart it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" aria-label="Interactive Bali scouting map">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={11}
          mapId="DEMO_MAP_ID"
          disableDefaultUI
          className="w-full h-full"
        >
          <Marker position={{ lat: -8.8291, lng: 115.0844 }} />
          <Marker position={{ lat: -8.4333, lng: 115.2792 }} />
        </Map>
      </APIProvider>
    </div>
  );
}
