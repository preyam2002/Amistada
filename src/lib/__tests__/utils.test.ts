import { describe, it, expect } from "vitest";
import { cn, formatDate, formatTime, formatRelativeTime } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatDate", () => {
  it("formats Date object", () => {
    const d = new Date("2026-01-15T00:00:00Z");
    const result = formatDate(d);
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats ISO string", () => {
    const result = formatDate("2026-03-29T12:00:00Z");
    expect(result).toContain("Mar");
    expect(result).toContain("29");
  });
});

describe("formatTime", () => {
  it("returns time with AM/PM", () => {
    const result = formatTime(new Date("2026-01-15T14:30:00Z"));
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
  });
});

describe("formatRelativeTime", () => {
  it('returns "just now" for recent dates', () => {
    expect(formatRelativeTime(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000);
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000);
    expect(formatRelativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
    expect(formatRelativeTime(twoDaysAgo)).toBe("2d ago");
  });

  it("handles string input", () => {
    const result = formatRelativeTime(new Date().toISOString());
    expect(result).toBe("just now");
  });
});
