"use client";

import { useState } from "react";

export function ProductImageField({ currentImage = "", required = true }: { currentImage?: string; required?: boolean }) {
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const shown = preview || currentImage;

  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="text-sm font-semibold text-slate-800">Product image</span>
      <div className="flex flex-wrap items-center gap-4">
        {shown ? (
          // The preview is either the saved product picture or a file the admin just chose.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-28 w-20 rounded-md bg-white object-contain" />
        ) : (
          <span className="flex h-28 w-20 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-2 text-center text-[11px] text-slate-400">
            No picture yet
          </span>
        )}
        <label className="grid gap-1 text-sm text-slate-600">
          Choose the bottle picture
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required={required}
            className="block w-full max-w-sm text-sm text-slate-700 file:mr-3 file:h-10 file:rounded-lg file:border-0 file:bg-[#ea2027] file:px-3 file:text-sm file:font-semibold file:text-white"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name ?? "");
              setPreview((current) => {
                if (current.startsWith("blob:")) URL.revokeObjectURL(current);
                return file ? URL.createObjectURL(file) : "";
              });
            }}
          />
          <span className="text-[12px] text-slate-500">{fileName || "JPG, PNG, WEBP, or GIF. Under 5 MB."}</span>
        </label>
      </div>
    </div>
  );
}
