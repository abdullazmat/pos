"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      title: "Simplicity",
      description: "We build tools that are intuitive and easy to use. No complexity, no confusion.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: "Reliability",
      description: "Your business depends on us. We prioritize uptime, data safety, and consistent performance.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: "Customer-First",
      description: "Every feature we build starts with a real need from our users. Your feedback shapes our roadmap.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      title: "Local Focus",
      description: "Built in Argentina, for Argentine businesses. We understand local regulations and challenges.",
    },
  ];

  const stats = [
    { value: "1,000+", label: "Active Businesses" },
    { value: "50K+", label: "Monthly Transactions" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <>
      <Header />
      <main className="vp-page pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))]/6 via-transparent to-[hsl(var(--vp-accent))]/4" />
          <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-[hsl(var(--vp-primary))]/5 blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="vp-pill mb-6 mx-auto w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584" />
                </svg>
                About Us
              </div>
              <h1 className="vp-section-title mb-5">
                Empowering Argentine businesses to sell smarter
              </h1>
              <p className="text-lg text-[hsl(var(--vp-muted))] leading-relaxed max-w-2xl mx-auto">
                VentaPlus is a modern, cloud-based point of sale system designed specifically for kiosks, 
                retail shops, and countertop businesses across Argentina. We make fiscal compliance simple 
                and selling effortless.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[hsl(var(--vp-primary))] mb-1">{stat.value}</div>
                  <div className="text-sm text-[hsl(var(--vp-muted))] font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="vp-pill mb-4 w-fit">Our Mission</div>
              <h2 className="vp-heading mb-5">
                Making commerce accessible to every business in Argentina
              </h2>
              <p className="text-[hsl(var(--vp-muted))] leading-relaxed mb-4">
                We believe every store, kiosk, and market stand deserves access to professional tools 
                that help them grow. VentaPlus was born from the frustration of seeing small business 
                owners struggle with outdated, expensive, and complicated POS systems.
              </p>
              <p className="text-[hsl(var(--vp-muted))] leading-relaxed">
                Our platform brings enterprise-level features like real-time inventory tracking, 
                fiscal compliance with ARCA/AFIP, and powerful sales analytics — all in a package 
                that's simple enough for anyone to use from day one.
              </p>
            </div>
            <div className="vp-card p-8 bg-gradient-to-br from-[hsl(var(--vp-primary))]/5 to-[hsl(var(--vp-accent))]/5">
              <div className="space-y-6">
                {values.map((value) => (
                  <div key={value.title} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))]">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-1">{value.title}</h3>
                      <p className="text-sm text-[hsl(var(--vp-muted))] leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="rounded-2xl border border-[hsl(var(--vp-border))] bg-gradient-to-r from-[hsl(var(--vp-primary))]/8 to-[hsl(var(--vp-accent))]/6 p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-semibold text-[hsl(var(--vp-text))] mb-3">Ready to get started?</h2>
            <p className="text-[hsl(var(--vp-muted))] mb-6 max-w-lg mx-auto">
              Join thousands of Argentine businesses already using VentaPlus to streamline their operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/register" className="vp-button vp-button-primary">
                Start Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/contact" className="vp-button">Contact Sales</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
