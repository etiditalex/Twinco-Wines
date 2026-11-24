"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "twinco-age-ack";

export function AgeGate() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [underage, setUnderage] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "yes") return;
    dialogRef.current?.showModal();
  }, []);

  function confirmAdult() {
    sessionStorage.setItem(STORAGE_KEY, "yes");
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="age-gate"
      aria-labelledby="age-gate-title"
      onCancel={(event) => event.preventDefault()}
    >
      <p className="text-sm font-semibold tracking-[0.14em] text-logo uppercase">TwinCO Wines</p>
      <h2 id="age-gate-title" className="mt-2 text-3xl">
        This preview is about wine
      </h2>
      {underage ? (
        <p className="mt-3 text-base leading-7 text-muted">
          This site is only for adults aged 18 and over. You can close the tab and come back if
          that applies to you.
        </p>
      ) : (
        <>
          <p className="mt-3 text-base leading-7 text-muted">
            You need to be 18 or older to look through this shop. Confirming here is only an
            acknowledgement for the preview. It is not an identity check, and it does not allow a
            purchase.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-logo px-5 text-sm font-semibold text-white hover:bg-logo-deep"
              onClick={confirmAdult}
            >
              I am 18 or older
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-navy px-5 text-sm font-semibold text-navy hover:bg-mist"
              onClick={() => setUnderage(true)}
            >
              I am under 18
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
