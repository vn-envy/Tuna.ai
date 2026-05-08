import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("chat proxy route", () => {
  it("returns a deployment hint when BACKEND_URL is not configured", async () => {
    vi.stubEnv("BACKEND_URL", "");
    vi.stubEnv("NEXT_PUBLIC_BACKEND_URL", "");

    const response = await POST(new Request("http://localhost/api/chat", { method: "POST", body: "{}" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      detail: "Tuna's backend is not configured. Set BACKEND_URL on the Cloud Run frontend service.",
    });
  });

  it("forwards chat requests to the configured backend", async () => {
    vi.stubEnv("BACKEND_URL", "https://tuna-api.example.com/");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('data: {"type":"done"}\n\n', {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { Authorization: "Bearer token" },
        body: JSON.stringify({ message: "Hi" }),
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://tuna-api.example.com/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
        body: JSON.stringify({ message: "Hi" }),
      }),
    );
    expect(response.headers.get("content-type")).toContain("text/event-stream");
  });
});
