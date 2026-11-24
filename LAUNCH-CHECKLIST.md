# Launch checklist

Live ordering is off. Checkout only creates a demo preview. Do not set `catalogMode` to `"live"` or `liveOrderingEnabled` to `true` in `src/content/commerce.ts` until every item below is done. `paymentProvider` must name a real integration. Leaving it `null` keeps charging impossible even if the other two flags are changed by mistake.

## Catalog and prices

- [ ] Replace `src/content/catalog.ts` with the brands, sizes, and vintages TwinCO actually stocks.
- [ ] Enter current selling prices in Kenyan shillings and real stock counts.
- [ ] Set `preview: false` only on rows TwinCO has approved.
- [ ] Replace placeholder images in `public/products/` and `public/brand/hero-placeholder.png` with photography TwinCO has the right to use.
- [ ] Re-check alcohol, grape, and origin against the bottle label. Fact-sheet vintages in CATALOG-SOURCES.md will not match every delivery.
- [ ] Turn on product structured data only after prices and availability are the live ones. The preview deliberately omits it.

## Customers, delivery, and policies

- [ ] Confirm the public address, phone, email, WhatsApp, and opening hours in `src/content/store.ts`, and set the matching `*Verified` flags.
- [ ] Do not publish the directory number +254 720 044444 unless TwinCO confirms it is the customer line.
- [ ] Approve delivery areas, fees, cut-off times, and what happens if nobody is at the address. Edit `src/content/delivery.ts` and set `approved` to `true`.
- [ ] Remove or keep Likoni, and any other area, based on the real map. Ineligible areas are refused at checkout.
- [ ] Replace the draft privacy, terms, and returns copy in `src/content/policies.ts`. The drafts say they are not in force.

## Licensing and age checks

These notes are not legal advice. They record what was read so the owner can take the next step with the county and with counsel.

- [ ] Alcoholic Drinks Control Act, section 28, as published by Kenya Law: no person shall sell, supply, or provide an alcoholic drink to anyone under 18. The Act’s defence for that offence depends on asking for, and being shown, a Kenyan national identity card, a passport, or another document the Cabinet Secretary prescribes, and believing the document is authentic. Text consulted: https://new.kenyalaw.org/akn/ke/act/2010/4/eng@2022-12-31
- [ ] NACADA’s implementation guidelines describe the retail-licence papers (identity or incorporation, KRA PIN, public health, and related items) and repeat the under-18 supply rule. https://nacada.go.ke/sites/default/files/2019-10/guidelines-for-implementing-alcoholic-drinks-control-act.pdf
- [ ] The Alcoholic Drinks Control (Licensing) Regulations, 2010, define an off-licence as sale for consumption elsewhere than on the premises. County law now sets local fees and procedure. Do not use the 2010 national fee table as Mombasa’s current charge. https://new.kenyalaw.org/akn/ke/act/ln/2010/206
- [ ] Mombasa County publishes the Mombasa County Liquor Licensing Act, 2014, as a download: https://web.mombasa.go.ke/download/mombasa-county-liquor-licensing-act-2014/ Confirm the licence TwinCO holds, whether it allows delivery, and every condition on hours, records, and handover.
- [ ] News reports in November 2026 (The Star and K24) describe interim High Court orders by Justice David Mburu about online alcohol sales in Nairobi City County, including licensing, a restricted alcohol section, authentication, and an age check before payment and again at handover. This project did not read the order itself. The reports are about Nairobi, not Mombasa. If delivery stays inside Mombasa they are not the local rule, but they are a reason to ask counsel what this shop must do before anyone can pay.
- [ ] Replace the preview’s “I am 18” acknowledgement with the check the licence and the Act actually require. Check the recipient again when the wine is handed over. The current dialog is not an identity check.
- [ ] Keep a responsible-retail notice on the site. Do not market wine to anyone under 18.

## Payments and indexing

- [ ] Connect a payment provider and verify the payment result on the server before an order is accepted. There is no payment code in this project to switch on.
- [ ] Change `ORDER_PREVIEW_SECRET` to a private value if demo links are still used in any environment. The confirmation link currently carries the typed details. Do not use that pattern for real orders.
- [ ] Set `catalogMode` to `"live"` so `src/app/robots.ts` and the layout stop marking the site `noindex`.
- [ ] Place a test order for an in-stock size, a refused area, an unknown product, and an unavailable size before announcing the shop.

## Where the switches live

`src/content/commerce.ts`

```ts
catalogMode: "preview" | "live"
liveOrderingEnabled: false
paymentProvider: null
```

All three have to allow a sale, and the server still has to be able to verify the payment. This build refuses to charge even if the flags are edited, because no provider is implemented.
