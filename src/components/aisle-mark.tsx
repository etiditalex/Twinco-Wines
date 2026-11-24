const tones: Record<string, { glass: string; liquid: string; cap: string; kind: "bottle" | "can" | "box" | "device" }> = {
  whisky: { glass: "#c47a2a", liquid: "#e0a04a", cap: "#1a1a1a", kind: "bottle" },
  wine: { glass: "#7a1f2b", liquid: "#9a3040", cap: "#1a1a1a", kind: "bottle" },
  beers: { glass: "#d7a106", liquid: "#f2c14e", cap: "#f4f4f4", kind: "can" },
  cognac: { glass: "#a15a28", liquid: "#c47a3a", cap: "#c6a15a", kind: "bottle" },
  vodka: { glass: "#d5dde6", liquid: "#eef3f8", cap: "#9aa7b5", kind: "bottle" },
  rum: { glass: "#8a4b22", liquid: "#c47a3a", cap: "#1a1a1a", kind: "bottle" },
  tequila: { glass: "#d7e2c8", liquid: "#e7f0dc", cap: "#c6a15a", kind: "bottle" },
  champagne: { glass: "#1d6b43", liquid: "#f3e7b0", cap: "#f4efe4", kind: "bottle" },
  gin: { glass: "#d5e4ea", liquid: "#e7f2f6", cap: "#1a1a1a", kind: "bottle" },
  liqueur: { glass: "#5c2a22", liquid: "#7a3a30", cap: "#c6a15a", kind: "bottle" },
  brandy: { glass: "#a15a28", liquid: "#d9a15a", cap: "#6b3a16", kind: "bottle" },
  vape: { glass: "#334155", liquid: "#64748b", cap: "#0f172a", kind: "device" },
  "soft-drinks": { glass: "#dc2626", liquid: "#ef4444", cap: "#f8fafc", kind: "can" },
  extras: { glass: "#0f766e", liquid: "#14b8a6", cap: "#134e4a", kind: "bottle" },
  gifts: { glass: "#9f1239", liquid: "#e11d48", cap: "#fbbf24", kind: "box" },
};

export function AisleMark({ slug }: { slug: string }) {
  const tone = tones[slug] ?? tones.wine;

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="rounded-md" aria-hidden="true">
      <rect width="64" height="64" fill="#ffffff" />
      {tone.kind === "can" ? <Can tone={tone} /> : null}
      {tone.kind === "box" ? <Gift tone={tone} /> : null}
      {tone.kind === "device" ? <Device tone={tone} /> : null}
      {tone.kind === "bottle" ? <Bottle tone={tone} slug={slug} /> : null}
    </svg>
  );
}

function Bottle({
  tone,
  slug,
}: {
  tone: { glass: string; liquid: string; cap: string };
  slug: string;
}) {
  return (
    <g>
      <path
        d="M28 10h8v6c6 4 10 9 10 16v20c0 4-3 7-10 7h-8c-7 0-10-3-10-7V32c0-7 4-12 10-16v-6z"
        fill={tone.glass}
      />
      <path d="M24 36h16v12c0 3-2 5-8 5s-8-2-8-5z" fill={tone.liquid} />
      <rect x="27" y="6" width="10" height="6" rx="1" fill={tone.cap} />
      {slug === "champagne" ? (
        <path d="M29 7c2 2 2 3 2 4M32 6c2 2 2 4 1 5M35 7c1 2 2 3 1 4" fill="none" stroke="#c9a24a" strokeWidth="0.8" />
      ) : null}
      <rect x="26" y="30" width="12" height="10" fill="#fbf8f2" />
    </g>
  );
}

function Can({ tone }: { tone: { glass: string; liquid: string; cap: string } }) {
  return (
    <g>
      <rect x="22" y="12" width="20" height="40" rx="4" fill={tone.glass} />
      <rect x="22" y="12" width="20" height="6" rx="2" fill={tone.cap} />
      <rect x="26" y="26" width="12" height="14" fill="#fbf8f2" />
    </g>
  );
}

function Gift({ tone }: { tone: { glass: string; cap: string } }) {
  return (
    <g>
      <rect x="16" y="24" width="32" height="26" rx="2" fill={tone.glass} />
      <rect x="14" y="20" width="36" height="8" rx="1" fill={tone.cap} />
      <path d="M32 20v30" stroke="#fff" strokeWidth="2" />
      <path d="M24 20c0-6 6-8 8-2 2-6 8-4 8 2" fill="none" stroke={tone.glass} strokeWidth="2" />
    </g>
  );
}

function Device({ tone }: { tone: { glass: string; cap: string } }) {
  return (
    <g>
      <rect x="26" y="10" width="12" height="40" rx="4" fill={tone.glass} />
      <rect x="29" y="16" width="6" height="10" rx="1" fill={tone.cap} />
    </g>
  );
}

export function BrandMark({ name }: { name: string }) {
  const lines = name.split(" ");
  const start = 54 - (lines.length - 1) * 8;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto aspect-square w-full max-w-[100px] rounded-md" aria-hidden="true">
      <rect width="100" height="100" fill="#f8fafc" />
      {lines.map((line, index) => (
        <text
          key={`${name}-${index}`}
          x="50"
          y={start + index * 16}
          textAnchor="middle"
          fontFamily="Georgia, Times, serif"
          fontSize={line.length > 12 ? 10 : 13}
          fill="#111827"
        >
          {line}
        </text>
      ))}
    </svg>
  );
}
