import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicy, policies } from "@/content/policies";

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Policy not found" };
  return { title: policy.title, description: policy.status };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-navy">{policy.status}</p>
      <h1 className="mt-6 text-4xl">{policy.title}</h1>
      {policy.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-2xl">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-7 text-muted">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
