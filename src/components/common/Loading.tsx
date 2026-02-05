"use client";

import React from "react";

export default function Loading({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[hsl(var(--vp-bg))]">
      <div className="vp-card px-10 py-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[hsl(var(--vp-border))] border-t-[hsl(var(--vp-primary))] animate-spin"></div>
        <span className="text-base font-semibold text-[hsl(var(--vp-text))]">
          {label}
        </span>
        <div className="h-2 w-40 vp-skeleton"></div>
      </div>
    </div>
  );
}
