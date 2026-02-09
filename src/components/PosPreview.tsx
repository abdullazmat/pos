"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/context/LanguageContext";

const HERO_IMAGE_URL = "/images/hero-image.jpeg";

export default function PosPreview() {
  const { t } = useLanguage();
  const altText = String(t("posPreview.alt", "landing"));

  return (
    <div className="vp-card overflow-hidden vp-reveal bg-[hsl(var(--vp-bg-card))]">
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={HERO_IMAGE_URL}
          alt={altText}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
