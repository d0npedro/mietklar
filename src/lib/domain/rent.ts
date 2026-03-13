export type MarginInput = {
  costSubtotal: number;
  marginType: "fixed" | "percentage";
  marginValue: number;
};

export type RentComponentInput = {
  amount: number;
  categoryKey?: string;
  isExternal: boolean;
  key: string;
  label: string;
};

export type SnapshotLine = RentComponentInput & {
  isMargin?: boolean;
  sharePercent: number;
};

export type CalculatedSnapshot = {
  costTotal: number;
  items: SnapshotLine[];
  marginAmount: number;
  rentTotal: number;
};

export type SnapshotDelta = {
  itemDeltas: Array<{
    currentAmount: number;
    delta: number;
    key: string;
    label: string;
    previousAmount: number;
  }>;
  totalDelta: number;
};

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateMarginAmount({
  costSubtotal,
  marginType,
  marginValue,
}: MarginInput) {
  if (marginType === "fixed") {
    return roundMoney(marginValue);
  }

  return roundMoney((costSubtotal * marginValue) / 100);
}

export function calculateRentSnapshot(input: {
  components: RentComponentInput[];
  marginType: MarginInput["marginType"];
  marginValue: number;
}): CalculatedSnapshot {
  const costTotal = roundMoney(
    input.components.reduce((sum, item) => sum + item.amount, 0),
  );
  const marginAmount = calculateMarginAmount({
    costSubtotal: costTotal,
    marginType: input.marginType,
    marginValue: input.marginValue,
  });
  const rentTotal = roundMoney(costTotal + marginAmount);
  const items = [
    ...input.components,
    {
      amount: marginAmount,
      isExternal: false,
      isMargin: true,
      key: "margin",
      label: "Offene Vermietermarge",
    },
  ].map((item) => ({
    ...item,
    amount: roundMoney(item.amount),
    sharePercent:
      rentTotal === 0 ? 0 : roundMoney((item.amount / rentTotal) * 100),
  }));

  return {
    costTotal,
    items,
    marginAmount,
    rentTotal,
  };
}

export function generateLeaseDelta(input: {
  current: CalculatedSnapshot;
  previous: CalculatedSnapshot;
}): SnapshotDelta {
  const currentByKey = new Map(
    input.current.items.map((item) => [item.key, item] as const),
  );
  const previousByKey = new Map(
    input.previous.items.map((item) => [item.key, item] as const),
  );
  const keys = new Set([...currentByKey.keys(), ...previousByKey.keys()]);

  const itemDeltas = Array.from(keys)
    .map((key) => {
      const currentItem = currentByKey.get(key);
      const previousItem = previousByKey.get(key);
      const currentAmount = currentItem?.amount ?? 0;
      const previousAmount = previousItem?.amount ?? 0;

      return {
        currentAmount: roundMoney(currentAmount),
        delta: roundMoney(currentAmount - previousAmount),
        key,
        label: currentItem?.label ?? previousItem?.label ?? key,
        previousAmount: roundMoney(previousAmount),
      };
    })
    .filter((item) => item.delta !== 0)
    .sort((left, right) => right.delta - left.delta);

  return {
    itemDeltas,
    totalDelta: roundMoney(input.current.rentTotal - input.previous.rentTotal),
  };
}
