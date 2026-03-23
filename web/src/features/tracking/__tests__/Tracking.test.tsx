import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { CustomerTracking } from "../pages/Tracking";
import { api } from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  api: { get: vi.fn() },
}));

vi.mock("qrcode.react", () => ({
  QRCodeCanvas: React.forwardRef<HTMLCanvasElement>((_props, ref) => (
    <canvas ref={ref} data-testid="mock-qr-canvas" width={180} height={180} />
  )),
}));

const mockGet = vi.mocked(api.get);

function trackingPayload(status: string) {
  const now = new Date().toISOString();
  return {
    trackingToken: "test-token-uuid",
    status,
    locationConfirmed: false,
    customerName: "Jordan Customer",
    address: "10 Fleet Street",
    stops: [] as {
      id: string;
      externalId: string;
      status: string;
      packages: number;
    }[],
    estimatedTime: "09:00 - 17:00",
    arrivedAt: null,
    completedAt: null,
    company: {
      name: "Acme Logistics",
      email: "ops@acme.test",
      phone: "+10000000000",
    },
    driver: null,
    liveLocation: null,
    timeline: {
      created_at: now,
      assigned_at: null,
      started_at: null,
      arrived_at: null,
      completed_at: null,
    },
  };
}

function renderTracking() {
  return render(
    <MemoryRouter initialEntries={["/track?token=test-token"]}>
      <Routes>
        <Route path="/track" element={<CustomerTracking />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CustomerTracking", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows Out for Delivery when API returns out_for_delivery", async () => {
    mockGet.mockResolvedValue({ data: trackingPayload("out_for_delivery") });
    renderTracking();

    await waitFor(() => {
      expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
    });
    expect(screen.getByText(/Acme Logistics/)).toBeInTheDocument();
  });

  it("shows Delivered when API returns delivered", async () => {
    mockGet.mockResolvedValue({ data: trackingPayload("delivered") });
    renderTracking();

    await waitFor(() => {
      expect(
        screen.getByText("Package has been delivered"),
      ).toBeInTheDocument();
    });
    const badges = screen.getAllByText("Delivered");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
