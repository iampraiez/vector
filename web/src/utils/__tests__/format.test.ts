import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTime, formatLastUpdatedAgo } from "../format";

describe("formatTime", () => {
  it("returns null for null input", () => {
    expect(formatTime(null)).toBeNull();
  });

  it("returns a locale time string for valid ISO input", () => {
    const s = formatTime("2025-03-22T14:30:00.000Z");
    expect(s).toBeTruthy();
    expect(s).toMatch(/\d/);
  });
});

describe("formatLastUpdatedAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports seconds ago", () => {
    expect(formatLastUpdatedAgo(new Date("2025-06-01T11:59:40.000Z"))).toBe(
      "20 seconds ago",
    );
  });

  it("reports minutes ago", () => {
    expect(formatLastUpdatedAgo(new Date("2025-06-01T11:30:00.000Z"))).toBe(
      "30 minutes ago",
    );
  });

  it("reports 1 second without plural s", () => {
    expect(formatLastUpdatedAgo(new Date("2025-06-01T11:59:59.000Z"))).toBe(
      "1 second ago",
    );
  });
});
