export const dynamic = "force-dynamic";

type RuntimeConfig = {
  googleMapsApiKey: string;
  chatProxyConfigured: boolean;
};

function runtimeConfig(): RuntimeConfig {
  return {
    googleMapsApiKey:
      process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    chatProxyConfigured: Boolean(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL),
  };
}

export async function GET() {
  return Response.json(runtimeConfig(), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
