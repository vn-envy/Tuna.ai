export const dynamic = "force-dynamic";

function backendBaseUrl() {
  return (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
}

function copyStreamingHeaders(upstream: Response) {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("Cache-Control", "no-store, no-transform");
  return headers;
}

export async function POST(request: Request) {
  const baseUrl = backendBaseUrl();

  if (!baseUrl) {
    return Response.json(
      {
        detail:
          "Tuna's backend is not configured. Set BACKEND_URL on the Cloud Run frontend service.",
      },
      { status: 503 },
    );
  }

  const upstream = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: request.headers.get("Authorization") || "",
    },
    body: await request.text(),
    cache: "no-store",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: copyStreamingHeaders(upstream),
  });
}
