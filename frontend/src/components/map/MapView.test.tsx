import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import MapView from "./MapView";

afterEach(() => {
  cleanup();
});

describe("MapView", () => {
  it("shows an accessible fallback when the Google Maps key is missing", () => {
    render(<MapView />);

    expect(screen.getByRole("status")).toHaveTextContent(/map unavailable/i);
    expect(screen.getByText(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing/i)).toBeInTheDocument();
  });
});
