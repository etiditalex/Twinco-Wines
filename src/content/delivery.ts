/**
 * Draft delivery coverage for preview checkout. Fees are examples in KES.
 * Set `approved` to true only after TwinCO confirms the boundary, fee,
 * and timing for each area. Ineligible areas are rejected at checkout.
 */
export type DeliveryArea = {
  id: string;
  name: string;
  feeKes: number;
  eligible: boolean;
  timing: string;
  note: string;
};

export const deliveryConfig = {
  approved: false,
  currency: "KES" as const,
  summary:
    "Customers confirm the delivery area at checkout. The fee and the final total are shown before a preview is submitted. These areas are drafts.",
  areas: [
    {
      id: "nyali",
      name: "Nyali",
      feeKes: 200,
      eligible: true,
      timing: "Draft window: same day is not promised until hours are approved.",
      note: "Example fee for the area around Nyali Centre.",
    },
    {
      id: "kongowea",
      name: "Kongowea",
      feeKes: 250,
      eligible: true,
      timing: "Draft window: same day is not promised until hours are approved.",
      note: "Example fee. Confirm the boundary before launch.",
    },
    {
      id: "bamburi",
      name: "Bamburi",
      feeKes: 300,
      eligible: true,
      timing: "Draft window: same day is not promised until hours are approved.",
      note: "Example fee. Confirm the boundary before launch.",
    },
    {
      id: "mombasa-island",
      name: "Mombasa Island",
      feeKes: 400,
      eligible: true,
      timing: "Draft window: same day is not promised until hours are approved.",
      note: "Example fee for Kizingo and other island addresses. Confirm before launch.",
    },
    {
      id: "likoni",
      name: "Likoni",
      feeKes: 0,
      eligible: false,
      timing: "Not in the draft service area.",
      note: "Included so checkout can refuse an address TwinCO has not approved.",
    },
  ] satisfies DeliveryArea[],
};

export function getDeliveryArea(id: string) {
  return deliveryConfig.areas.find((area) => area.id === id);
}
