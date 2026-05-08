import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("runtime config route", () => {
  it("reads map and backend settings from runtime environment variables", async () => {
    vi.stubEnv("GOOGLE_MAPS_API_KEY", "maps-key");
    vi.stubEnv("BACKEND_URL", "https://tuna-api.example.com");

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      googleMapsApiKey: "maps-key",
      chatProxyConfigured: true,
    });
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
