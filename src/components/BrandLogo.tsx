import React from "react";

interface BrandLogoProps {
  size?: "md" | "lg";
  className?: string;
}

const sizeMap = {
  md: {
    icon: "h-12 w-12 sm:h-14 sm:w-14",
    text: "text-lg sm:text-xl",
    gap: "gap-4",
  },
  lg: {
    icon: "h-14 w-14 sm:h-16 sm:w-16",
    text: "text-xl sm:text-2xl",
    gap: "gap-4",
  },
};

export default function BrandLogo({ size = "md", className }: BrandLogoProps) {
  const styles = sizeMap[size];

  return (
    <div
      className={`flex items-center ${styles.gap} ${className || ""}`.trim()}
    >
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden border border-[hsl(var(--vp-border))] bg-[#171B26] ${styles.icon}`}
        aria-hidden
      >
        <svg
          viewBox="0 0 64 64"
          role="img"
          aria-label="VentaPlus logo"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="vpGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F7DF7" />
              <stop offset="100%" stopColor="#7CCBFF" />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="14"
            fill="url(#vpGradient)"
          />
          <circle cx="26" cy="12" r="2.2" fill="#0B1E36" />
          <circle cx="32" cy="12" r="2.2" fill="#0B1E36" />
          <circle cx="38" cy="12" r="2.2" fill="#0B1E36" />
          <rect x="10" y="18" width="44" height="26" rx="6" fill="#0B1E36" />
          <rect x="14" y="22" width="20" height="3" rx="1.5" fill="#3C74F1" />
          <rect x="14" y="28" width="10" height="3" rx="1.5" fill="#3C74F1" />
          <path
            d="M18 40 L28 50 L47 28"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={`font-semibold ${styles.text} text-[hsl(var(--vp-text))] tracking-tight shrink-0 leading-tight`}
      >
        Venta<span className="text-[hsl(var(--vp-primary))]">Plus</span>
      </span>
    </div>
  );
}
