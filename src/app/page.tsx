"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/hero";
import Stats from "@/components/stats";
import PosPreview from "@/components/PosPreview";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] text-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-lg">
            {String(
              require("@/lib/context/LanguageContext")
                .useLanguage()
                .t("loading", "common"),
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main
        id="top"
        className="bg-white dark:bg-[#0b0c0e] text-gray-900 dark:text-white"
      >
        <div className="px-6 pt-24 pb-40 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
            <div className="space-y-16">
              <Hero />
              <Stats />
            </div>

            <div className="justify-center hidden lg:flex">
              <div className="w-full max-w-lg">
                <PosPreview />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-20 lg:hidden">
            <div className="w-full max-w-lg">
              <PosPreview />
            </div>
          </div>
        </div>
      </main>

      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </>
  );
}
