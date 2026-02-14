"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Supplier {
  _id: string;
  name: string;
}

interface SupplierSearchProps {
  suppliers: Supplier[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export default function SupplierSearch({
  suppliers,
  value,
  onChange,
  placeholder = "Buscar proveedor...",
  label,
  className = "",
  allowEmpty = true,
  emptyLabel,
}: SupplierSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive display text from selected value
  const selectedSupplier = suppliers.find((s) => s._id === value);

  // Filter suppliers based on query
  const filtered = query.trim()
    ? suppliers.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()),
      )
    : suppliers;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        // Restore display text if nothing selected
        if (!value) setQuery("");
        else setQuery(selectedSupplier?.name || "");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, selectedSupplier]);

  // Sync query text with selected value
  useEffect(() => {
    if (!open) {
      setQuery(selectedSupplier?.name || "");
    }
  }, [value, selectedSupplier, open]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setOpen(true);
    },
    [],
  );

  const handleFocus = useCallback(() => {
    setQuery("");
    setOpen(true);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
      const sup = suppliers.find((s) => s._id === id);
      setQuery(sup?.name || "");
      inputRef.current?.blur();
    },
    [onChange, suppliers],
  );

  const handleClear = useCallback(() => {
    onChange("");
    setQuery("");
    setOpen(false);
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery(selectedSupplier?.name || "");
        inputRef.current?.blur();
      }
      if (e.key === "Enter" && filtered.length === 1) {
        e.preventDefault();
        handleSelect(filtered[0]._id);
      }
    },
    [filtered, handleSelect, selectedSupplier],
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[hsl(var(--vp-muted))] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-sm border rounded px-3 py-1.5 pr-8 bg-[hsl(var(--vp-bg))] text-[hsl(var(--vp-text))] border-[hsl(var(--vp-border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--vp-primary))] placeholder:text-[hsl(var(--vp-muted))]"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--vp-muted))] hover:text-[hsl(var(--vp-text))] text-sm leading-none"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
        {!value && (
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--vp-muted))] pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))] shadow-lg">
          {allowEmpty && emptyLabel && (
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[hsl(var(--vp-bg-secondary))] transition-colors ${
                !value
                  ? "bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))] font-semibold"
                  : "text-[hsl(var(--vp-muted))]"
              }`}
              onClick={() => {
                onChange("");
                setQuery("");
                setOpen(false);
              }}
            >
              {emptyLabel}
            </button>
          )}
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm text-[hsl(var(--vp-muted))] text-center">
              —
            </div>
          ) : (
            filtered.map((s) => (
              <button
                key={s._id}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-[hsl(var(--vp-bg-secondary))] transition-colors ${
                  s._id === value
                    ? "bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))] font-semibold"
                    : "text-[hsl(var(--vp-text))]"
                }`}
                onClick={() => handleSelect(s._id)}
              >
                {query.trim() ? highlightMatch(s.name, query) : s.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* Highlight matching portion of text */
function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-[hsl(var(--vp-primary))]">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
