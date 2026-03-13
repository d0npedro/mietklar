import {
  calculateMarginAmount,
  calculateRentSnapshot,
  generateLeaseDelta,
} from "@/lib/domain/rent";

describe("rent domain logic", () => {
  it("calculates percentage margin against the cost subtotal", () => {
    expect(
      calculateMarginAmount({
        costSubtotal: 1550,
        marginType: "percentage",
        marginValue: 10,
      }),
    ).toBe(155);
  });

  it("supports fixed margin amounts", () => {
    expect(
      calculateMarginAmount({
        costSubtotal: 1550,
        marginType: "fixed",
        marginValue: 170,
      }),
    ).toBe(170);
  });

  it("builds a snapshot with a derived margin line", () => {
    const snapshot = calculateRentSnapshot({
      components: [
        {
          amount: 1190,
          categoryKey: "base_costs",
          isExternal: true,
          key: "base-costs",
          label: "Objektkosten",
        },
        {
          amount: 360,
          categoryKey: "utilities",
          isExternal: true,
          key: "utilities",
          label: "Externe Betriebskosten",
        },
      ],
      marginType: "fixed",
      marginValue: 170,
    });

    expect(snapshot.costTotal).toBe(1550);
    expect(snapshot.marginAmount).toBe(170);
    expect(snapshot.rentTotal).toBe(1720);
    expect(snapshot.items.at(-1)).toMatchObject({
      amount: 170,
      isMargin: true,
      key: "margin",
      label: "Offene Vermietermarge",
    });
  });

  it("generates deltas between two published snapshots", () => {
    const previous = calculateRentSnapshot({
      components: [
        {
          amount: 1190,
          isExternal: true,
          key: "base-costs",
          label: "Objektkosten",
        },
        {
          amount: 378,
          isExternal: true,
          key: "utilities",
          label: "Externe Betriebskosten",
        },
      ],
      marginType: "fixed",
      marginValue: 170,
    });

    const current = calculateRentSnapshot({
      components: [
        {
          amount: 1190,
          isExternal: true,
          key: "base-costs",
          label: "Objektkosten",
        },
        {
          amount: 360,
          isExternal: true,
          key: "utilities",
          label: "Externe Betriebskosten",
        },
      ],
      marginType: "fixed",
      marginValue: 170,
    });

    const delta = generateLeaseDelta({ current, previous });

    expect(delta.totalDelta).toBe(-18);
    expect(delta.itemDeltas).toEqual([
      {
        currentAmount: 360,
        delta: -18,
        key: "utilities",
        label: "Externe Betriebskosten",
        previousAmount: 378,
      },
    ]);
  });
});
