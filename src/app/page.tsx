"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/hero";
import PosPreview from "@/components/PosPreview";
import FeatureModule from "@/components/FeatureModule";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import SupportSection from "@/components/SupportSection";
import ScenariosSection from "@/components/ScenariosSection";
import Footer from "@/components/Footer";

import { useLanguage } from "@/lib/context/LanguageContext";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;

      const accessToken = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (accessToken && userData) {
        router.push("/pos");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const elements = document.querySelectorAll<HTMLElement>(".vp-reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, currentLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--vp-bg))] text-[hsl(var(--vp-text))]">
        <div className="text-center vp-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-[hsl(var(--vp-primary))] rounded-full animate-spin"></div>
          <p className="text-lg text-[hsl(var(--vp-muted))]">
            {currentLanguage === 'es' ? 'Cargando...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main id="top" className="vp-page">
        <div className="px-4 sm:px-6 pt-24 sm:pt-32 pb-20 sm:pb-32 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh] sm:min-h-[78vh]">
            <div className="space-y-12">
              <Hero />
            </div>

            <div className="justify-center hidden lg:flex">
              <div className="w-full max-w-xl vp-mockup-shell vp-float">
                <PosPreview />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10 sm:mt-16 lg:hidden">
            <div className="w-full max-w-md sm:max-w-xl vp-mockup-shell vp-float">
              <PosPreview />
            </div>
          </div>
        </div>

        <div className="space-y-0">
          <FeatureModule moduleKey="module1" index={0} />
          <div className="bg-[hsl(var(--vp-bg-section))]">
            <FeatureModule moduleKey="module2" index={1} />
          </div>
          <FeatureModule moduleKey="module3" index={2} />
          <div className="bg-[hsl(var(--vp-bg-section))]">
            <FeatureModule moduleKey="module4" index={3} />
          </div>
        </div>

        <PricingSection />
        <CTASection />
        <SupportSection />
        <ScenariosSection />
      </main>

      <Footer />
    </>
  );
}

