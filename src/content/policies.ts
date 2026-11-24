export type PolicySection = {
  heading: string;
  paragraphs: string[];
};

export type Policy = {
  slug: string;
  title: string;
  status: string;
  sections: PolicySection[];
};

export const policies: Policy[] = [
  {
    slug: "privacy",
    title: "Privacy",
    status: "Draft for TwinCO approval. This text is not in force.",
    sections: [
      {
        heading: "What this preview does with details you type",
        paragraphs: [
          "Checkout asks for a name, mobile number, email, delivery area, and address so the demo summary can be checked. Submitting it does not open an account and does not send the details to a payment company.",
          "The demo summary is signed on the server and returned in the confirmation link. It is not written into an order database. Do not share that link. Close it when you are finished testing.",
        ],
      },
      {
        heading: "Before live ordering",
        paragraphs: [
          "TwinCO needs to approve a privacy notice that names the business, what is collected for a real order, how long it is kept, who can see it, and how a customer can ask for a correction. That notice should match the payment provider and any delivery partner that is eventually used.",
          "Age-check documents, if they are collected later, need their own rule. This preview does not ask for an identity-card number.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    status: "Draft for TwinCO approval. This text is not in force and is not a contract of sale.",
    sections: [
      {
        heading: "Preview only",
        paragraphs: [
          "Pages, prices, stock counts, and delivery fees on this website are examples. Submitting checkout creates a demo preview. It does not sell wine, reserve stock, or take money.",
          "A contract of sale can exist only after TwinCO turns on live ordering, a payment result is verified on the server, and the customer has passed the age and delivery checks TwinCO approves.",
        ],
      },
      {
        heading: "Alcohol",
        paragraphs: [
          "Wine is for adults aged 18 and over. The Alcoholic Drinks Control Act prohibits selling, supplying, or providing an alcoholic drink to a person under 18. Delivery, once it is allowed, has to follow TwinCO’s Mombasa County licence and any conditions on that licence.",
          "Nothing on this site is an invitation to drink to excess. Drink responsibly.",
        ],
      },
      {
        heading: "Catalog facts",
        paragraphs: [
          "Producer, country, grape, bottle size, and alcohol figures in the preview are taken from the public sources listed in CATALOG-SOURCES.md. Vintage labels can differ. TwinCO’s own invoices and shelf labels are the source for what is actually sold and at what price.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns",
    status: "Draft for TwinCO approval. No returns are offered while live sales are off.",
    sections: [
      {
        heading: "While this is a preview",
        paragraphs: [
          "There is nothing to return, because the site does not take payment or dispatch wine. A demo confirmation is not proof of purchase.",
        ],
      },
      {
        heading: "Draft for a future live shop",
        paragraphs: [
          "TwinCO should decide, with its licence and insurer in mind, what happens if a sealed bottle arrives broken, if the wrong wine is delivered, or if a customer changes their mind. Perishable and age-restricted goods often cannot be taken back once they have been handed over in good condition.",
          "Publish the approved rule here before the first paid order. Include who to contact, how quickly, and whether a replacement or a refund is offered.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string) {
  return policies.find((policy) => policy.slug === slug);
}
