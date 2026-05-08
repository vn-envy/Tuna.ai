import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "./page";

afterEach(() => {
  cleanup();
});

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LandingPage", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
  });

  it("renders creator-focused landing content", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: /meet tuna\.ai/i })).toBeInTheDocument();
    expect(screen.getByText(/Scout photogenic places/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute("href", "#main-content");
  });

  it("stores the demo token and opens the workspace", () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in with google/i }));

    expect(localStorage.getItem("tuna_auth_token")).toBe("mock_jwt_token_12345");
    expect(push).toHaveBeenCalledWith("/app");
    expect(screen.getByRole("button", { name: /sign in with google/i })).toHaveAttribute("aria-busy", "true");
  });
});
