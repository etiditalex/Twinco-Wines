import { categoryColors, type DrinkCategory } from "@/lib/drink-category";
import { weekdayLabels } from "@/lib/desk";

const red = "#ea2027";

export function MonthlyChart({ points }: { points: { label: string; units: number }[] }) {
  const max = niceMax(Math.max(0, ...points.map((point) => point.units)));
  const width = 520;
  const height = 220;
  const pad = { top: 16, right: 8, bottom: 28, left: 32 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const gap = 8;
  const barW = points.length ? (innerW - gap * (points.length - 1)) / points.length : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="Monthly sales trend">
      {[0, 0.5, 1].map((step) => {
        const y = pad.top + innerH - innerH * step;
        const label = Math.round(max * step);
        return (
          <g key={step}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#e5e7eb" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {label}
            </text>
          </g>
        );
      })}
      <text x="14" y={height / 2} fontSize="10" fill="#94a3b8" transform={`rotate(-90 14 ${height / 2})`}>
        Sales Volume (units)
      </text>
      {points.map((point, index) => {
        const h = max === 0 ? 0 : (point.units / max) * innerH;
        const x = pad.left + index * (barW + gap);
        const y = pad.top + innerH - h;
        return (
          <g key={point.label}>
            <rect x={x} y={y} width={Math.max(barW, 0)} height={h} rx="3" fill={red} />
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CategoryDonut({ slices }: { slices: { label: DrinkCategory; units: number }[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.units, 0);
  const cx = 110;
  const cy = 110;
  const radius = 68;
  let angle = -Math.PI / 2;
  const arcs = slices.map((slice) => {
    const portion = total === 0 ? 0 : slice.units / total;
    const sweep = portion * Math.PI * 2;
    const start = angle;
    const end = angle + Math.max(sweep - 0.03, 0);
    angle += sweep;
    return { ...slice, start, end, portion };
  });

  return (
    <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
      <svg viewBox="0 0 220 220" className="mx-auto h-44 w-44" role="img" aria-label="Product category distribution">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="28" />
        {arcs.map((arc) =>
          arc.portion <= 0 ? null : (
            <path
              key={arc.label}
              d={arcPath(cx, cy, radius, arc.start, arc.end)}
              fill="none"
              stroke={categoryColors[arc.label]}
              strokeWidth="28"
              strokeLinecap="butt"
            />
          ),
        )}
        <circle cx={cx} cy={cy} r="42" fill="white" />
      </svg>
      <ul className="grid gap-1.5 text-[11px] leading-4">
        {slices.map((slice) => {
          const portion = total === 0 ? 0 : (slice.units / total) * 100;
          return (
            <li key={slice.label} className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ background: categoryColors[slice.label] }} />
                {slice.label}
              </span>
              <span className="text-right font-semibold text-slate-800">
                {slice.units.toLocaleString("en-KE")}
                <span className="block font-medium text-slate-400">{portion.toFixed(2)}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Heatmap({ rows }: { rows: { row: string; values: number[] }[] }) {
  const max = Math.max(1, ...rows.flatMap((row) => row.values));
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-center text-[10px]">
        <thead>
          <tr>
            <th />
            {weekdayLabels.map((day) => (
              <th key={day} className="px-1 font-medium text-slate-500">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.row}>
              <th className="pr-1 text-left font-medium text-slate-500">{row.row}</th>
              {row.values.map((value, index) => {
                const tone = value / max;
                return (
                  <td
                    key={weekdayLabels[index]}
                    className="rounded-sm px-1 py-2 font-semibold"
                    style={{ background: heatColor(tone), color: tone > 0.55 ? "white" : "#334155" }}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ForecastGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const start = Math.PI;
  const end = Math.PI + Math.PI * (clamped / 100);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="h-36 w-full" role="img" aria-label={`Forecast accuracy ${clamped.toFixed(2)} percent`}>
        <path d={arcPath(110, 112, 78, Math.PI, Math.PI * 2)} fill="none" stroke="#e5e7eb" strokeWidth="18" strokeLinecap="butt" />
        <path d={arcPath(110, 112, 78, start, end)} fill="none" stroke={red} strokeWidth="18" strokeLinecap="butt" />
        <text x="110" y="104" textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">
          {clamped.toFixed(2)}%
        </text>
      </svg>
      <p className="text-xs text-slate-500">
        Target: <span className="font-semibold text-slate-700">90.00%</span>
      </p>
    </div>
  );
}

export function CoastMap({ regions }: { regions: { name: string; totalKes: number }[] }) {
  const max = Math.max(1, ...regions.map((region) => region.totalKes));
  const colorFor = (name: string) => {
    const value = regions.find((region) => region.name === name)?.totalKes ?? 0;
    return heatColor(value / max);
  };
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[10px] text-slate-500">
        <span>1.00</span>
        <span className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(90deg, #fde8ea, #ea2027)" }} />
        <span>11.00</span>
      </div>
      <svg viewBox="0 0 200 230" className="mx-auto h-44 w-full" role="img" aria-label="Provincial sales along the Mombasa coast">
        <rect width="200" height="230" rx="10" fill="#f8fafc" />
        <path d="M118 16c32 4 66 34 58 78-8 32-30 42-52 30-16-10-22-40-6-108z" fill={colorFor("North Coast")}>
          <title>North Coast</title>
        </path>
        <path d="M78 96c22-10 48 4 44 40-4 32-30 42-50 22-16-16-14-48 6-62z" fill={colorFor("Mombasa Island")}>
          <title>Mombasa Island</title>
        </path>
        <path d="M68 168c30-10 82 8 88 46-16 22-70 24-96 2-12-16-8-40 8-48z" fill={colorFor("South Coast")}>
          <title>South Coast</title>
        </path>
        <text x="148" y="62" fontSize="8" fill="#334155">
          North
        </text>
        <text x="86" y="128" fontSize="8" fill="#334155">
          Island
        </text>
        <text x="96" y="198" fontSize="8" fill="#334155">
          South
        </text>
      </svg>
    </div>
  );
}

export function PromoChart({ points }: { points: { label: string; units: number }[] }) {
  const max = Math.max(1, ...points.map((point) => point.units));
  return (
    <div className="flex h-40 items-end gap-2">
      {points.map((point) => (
        <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <div className="flex h-28 w-full items-end justify-center">
            <div className="w-7 rounded-t-sm" style={{ height: `${Math.max((point.units / max) * 100, point.units ? 4 : 0)}%`, background: red }} />
          </div>
          <span className="line-clamp-2 h-8 text-center text-[9px] leading-3 text-slate-500">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

function niceMax(value: number) {
  if (value <= 10) return 10;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = value / power;
  const nice = step <= 1 ? 1 : step <= 2 ? 2 : step <= 5 ? 5 : 10;
  return nice * power;
}

function heatColor(tone: number) {
  const t = Math.max(0, Math.min(1, tone));
  const redChannel = Math.round(253 + (234 - 253) * t);
  const green = Math.round(232 + (32 - 232) * t);
  const blue = Math.round(234 + (39 - 234) * t);
  return `rgb(${redChannel} ${green} ${blue})`;
}

function arcPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const [x1, y1] = [cx + radius * Math.cos(start), cy + radius * Math.sin(start)];
  const [x2, y2] = [cx + radius * Math.cos(end), cy + radius * Math.sin(end)];
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
}
