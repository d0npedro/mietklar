import { formatCurrency, formatDelta } from "@/lib/formatters";

describe("formatters", () => {
  it("formats euro values for german locale", () => {
    expect(formatCurrency(1720)).toBe(`1.720\u00a0\u20ac`);
  });

  it("formats deltas with explicit prefixes", () => {
    expect(formatDelta(45)).toBe(`+45\u00a0\u20ac`);
    expect(formatDelta(-18)).toBe(`-18\u00a0\u20ac`);
    expect(formatDelta(0)).toBe(`+/-0\u00a0\u20ac`);
  });
});
