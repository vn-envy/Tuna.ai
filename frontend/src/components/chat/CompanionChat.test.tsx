import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CompanionChat from "./CompanionChat";

function streamFrom(chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
}

afterEach(() => {
  cleanup();
});

describe("CompanionChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("sends a message with authorization and renders streamed text", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        streamFrom([
          'data: {"type":"status","text":"Writing..."}\n\n',
          'data: {"type":"text","text":"Great "}\n\n',
          'data: {"type":"text","text":"idea!"}\n\n',
          'data: {"type":"done"}\n\n',
        ]),
        { status: 200 },
      ),
    );

    render(<CompanionChat />);
    fireEvent.change(screen.getByLabelText(/message tuna/i), { target: { value: "Plan Bali" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(screen.getByText(/Great idea!/i)).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer mock_jwt_token_12345" }),
        body: JSON.stringify({ message: "Plan Bali" }),
      }),
    );
  });

  it("renders streamed place cards with specific itinerary labels", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        streamFrom([
          'data: {"type":"place_card","data":{"name":"Uluwatu Temple","golden_hour":"17:30","description":"Cliff sunset shoot"}}\n\n',
          'data: {"type":"done"}\n\n',
        ]),
        { status: 200 },
      ),
    );

    render(<CompanionChat />);
    fireEvent.change(screen.getByLabelText(/message tuna/i), { target: { value: "sunset places" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("button", { name: /add uluwatu temple to itinerary/i })).toBeInTheDocument();
  });
});
