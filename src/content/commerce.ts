/**
 * Live ordering stays off until TwinCO approves the catalog, prices,
 * contact details, delivery terms, licensing checks, and a payment provider
 * whose result can be verified on the server.
 *
 * Set `catalogMode` to "live" and `liveOrderingEnabled` to true only after
 * LAUNCH-CHECKLIST.md is complete. `paymentProvider` must name a real
 * integration. A null provider never charges a customer.
 */
export const commerce = {
  catalogMode: "preview" as "preview" | "live",
  liveOrderingEnabled: false,
  paymentProvider: null as null | string,
  maxQuantityPerLine: 12,
};

export function livePurchasesEnabled() {
  return (
    commerce.catalogMode === "live" &&
    commerce.liveOrderingEnabled &&
    Boolean(commerce.paymentProvider)
  );
}
