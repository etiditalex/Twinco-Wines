# TwinCO Wines

A preview wine-delivery storefront for TwinCO Wines at Nyali Centre, Mombasa. The shop can be searched, filtered, and taken through a guest checkout. Live orders and payments stay off until the owner completes [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

Product facts and the publications they came from are listed in [CATALOG-SOURCES.md](CATALOG-SOURCES.md). Prices and stock in `src/content/catalog.ts` are examples.

## Requirements

- Node.js 20 or newer (this project was created with Node.js 24)
- npm

## Setup

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` serves the production build. Run `npm run build` first.

## Edit the shop without changing page code

| What | File |
| --- | --- |
| Wines, preview prices, stock, images | `src/content/catalog.ts` |
| Turn live ordering on or off | `src/content/commerce.ts` |
| Phone, email, hours, address flags | `src/content/store.ts` |
| Delivery areas and fees | `src/content/delivery.ts` |
| Privacy, terms, returns | `src/content/policies.ts` |
| Questions | `src/content/faq.ts` |
| Homepage sentences | `src/content/store.ts` (`homepageCopy`) |

Replace bottle photos by changing a product’s `image` path and putting the file in `public/products/`. Replace the homepage picture at `public/brand/hero-placeholder.png`, or point `homepageCopy.heroImage` at a new file. The logo used in the header and footer is `public/brand/twinco-wines-logo.png`.

Set `catalogMode` to `"live"` and `liveOrderingEnabled` to `true` only after the launch checklist is done, and only when `paymentProvider` names an integration that this server can verify. Until then, checkout creates a signed demo preview and does not take payment.

Demo confirmation links are signed with `ORDER_PREVIEW_SECRET` if that environment variable is set. Otherwise a built-in demo secret is used. Replace it before any real launch.

The preview catalog is marked `noindex`. Product structured data is not emitted for preview prices.
