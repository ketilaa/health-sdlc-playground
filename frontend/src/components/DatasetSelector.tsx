"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dataset } from "../domain/dataset";

interface Props {
  currentName: string;
  options: Dataset[];
}

export function DatasetSelector({ currentName, options }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Filter out any test fixture from the visible dropdown options.
  const visibleOptions = options.filter((o) => !o.isTestFixture);

  return (
    <div ref={rootRef} className="dataset-selector-root">
      <button
        type="button"
        data-testid="dataset-selector"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select dataset"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        {currentName} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul role="listbox" className="dataset-selector-list">
          {visibleOptions.map((opt) => (
            <li key={opt.id} role="option" aria-selected={false}>
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}