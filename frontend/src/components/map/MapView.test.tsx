import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MapView from "./MapView";

afterEach(() => {
  cleanup();
});

describe("MapView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads runtime config before deciding whether the Google Maps key is available", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ googleMapsApiKey: "" }));

    render(<MapView />);

    expect(screen.getByRole("status")).toHaveTextContent(/loading map configuration/i);
    expect(await screen.findByText(/Map Configuration Needed/i)).toBeInTheDocument();
    expect(screen.getByText(/GOOGLE_MAPS_API_KEY/i)).toBeInTheDocument();
  });
});
