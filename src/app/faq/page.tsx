import type { Metadata } from "next";
import { faqs } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions about TwinCO Wines preview stock, orders, and delivery.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Questions</h1>
      <p className="mt-4 leading-7 text-muted">
        Answers for this preview, covering stock, orders, and delivery. They are not a substitute
        for TwinCO’s approved policies.
      </p>
      <div className="mt-8 grid gap-3">
        {faqs.map((item) => (
          <details key={item.question} className="rounded-2xl border border-line px-4 py-3">
            <summary className="cursor-pointer text-lg font-semibold text-navy">{item.question}</summary>
            <p className="mt-3 leading-7 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
