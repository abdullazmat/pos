// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/context/LanguageContext";
import BrandLogo from "@/components/BrandLogo";

export default function Header() {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-surface))]/80 backdrop-blur-xl vp-navbar ${
        isScrolled ? "is-scrolled" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + Tagline */}
          <Link href="/" className="group">
            <div className="flex items-center">
              <BrandLogo
                size="lg"
                className="group-hover:scale-105 transition"
              />
            </div>
            <p className="text-blue-200 text-xs mt-1 hidden sm:block">
              {String(t("subtitle", "pricing"))}
            </p>
          </Link>

          {/* Right Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <Link href="/auth/login" className="vp-button">
              {String(t("login", "common"))}
            </Link>
            <Link href="/auth/register" className="vp-button vp-button-primary">
              {String(t("startFree", "pricing"))}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-text))]"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 rounded-2xl border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg))]/90 p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-end">
                <LanguageSelector />
              </div>
              <Link
                href="#features"
                className="vp-button"
                onClick={() => setIsMenuOpen(false)}
              >
                {String(t("features", "common"))}
              </Link>
              <Link
                href="#pricing"
                className="vp-button"
                onClick={() => setIsMenuOpen(false)}
              >
                {String(t("pricing", "common"))}
              </Link>
              <Link
                href="/auth/login"
                className="vp-button"
                onClick={() => setIsMenuOpen(false)}
              >
                {String(t("login", "common"))}
              </Link>
              <Link
                href="/auth/register"
                className="vp-button vp-button-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {String(t("startFree", "pricing"))}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
