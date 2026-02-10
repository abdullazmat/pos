"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/context/LanguageContext";

const DEFAULT_HERO_IMAGE_URL = "/images/hero-en.jpg";

export default function PosPreview() {
  const { t } = useLanguage();
  const posPreview = t("posPreview", "landing") as {
    alt?: string;
    image?: string;
  };
  const altText = posPreview?.alt ?? "Minimart counter staff using POS";
  const imageUrl = posPreview?.image ?? DEFAULT_HERO_IMAGE_URL;

  return (
    <div className="vp-card overflow-hidden vp-reveal bg-[hsl(var(--vp-bg-card))]">
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={imageUrl}
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
