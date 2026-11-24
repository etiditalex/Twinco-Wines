"use client";

import { useState } from "react";

const notes = [
  "Customer reviews are not published on this preview. Nothing in this panel is a comment from a buyer.",
  "Prices, stock, and delivery fees shown in the shop are examples. Confirm them with TwinCO before treating them as an offer.",
  "The area check at checkout is a draft. Likoni is refused in this preview, and the other fees still need the shop’s approval.",
];

export function ReviewNotes() {
  const [index, setIndex] = useState(0);

  return (
    <section>
      <h2 className="my-2 text-2xl font-bold text-logo">What people are saying</h2>
      <div className="relative my-4 rounded-sm bg-white px-4 py-8">
        <div className="flex flex-col items-center gap-4 p-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-ink">
            TC
          </span>
          <p className="max-w-3xl text-balance">{notes[index]}</p>
          <div className="text-lg font-medium">Preview note</div>
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {notes.map((note, noteIndex) => (
            <button
              key={note}
              type="button"
              aria-label={`Note ${noteIndex + 1}`}
              aria-current={noteIndex === index ? "true" : undefined}
              className={`h-2.5 w-2.5 rounded-full ${noteIndex === index ? "bg-logo" : "bg-slate-300"}`}
              onClick={() => setIndex(noteIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
