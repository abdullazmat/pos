"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function SecurityPage() {
  const { t } = useLanguage();

  const securityFeatures = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      title: "Data Encryption",
      description: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your business data is always protected.",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: "Secure Authentication",
      description: "Industry-standard authentication with secure password hashing (bcrypt) and session management.",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      ),
      title: "Cloud Infrastructure",
      description: "Hosted on enterprise-grade cloud infrastructure with automatic scaling, redundancy, and 99.9% uptime SLA.",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
      title: "Automated Backups",
      description: "Your data is automatically backed up continuously. Point-in-time recovery ensures nothing is ever lost.",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
      title: "Role-Based Access",
      description: "Fine-grained permission controls ensure team members only access what they need. Owner, admin, and cashier roles.",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Audit Logging",
      description: "Complete audit trail of all system operations. Track who did what and when for full accountability.",
    },
  ];

  return (
    <>
      <Header />
      <main className="vp-page pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-success))]/5 via-transparent to-[hsl(var(--vp-primary))]/5" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <div className="vp-pill mb-6 mx-auto w-fit" style={{ background: "hsl(var(--vp-success) / 0.1)", color: "hsl(var(--vp-success))" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Security
              </div>
              <h1 className="vp-section-title mb-5">
                Your data is our top priority
              </h1>
              <p className="text-lg text-[hsl(var(--vp-muted))] leading-relaxed max-w-2xl mx-auto">
                VentaPlus is built with enterprise-grade security from the ground up. We protect 
                your business data with industry-leading encryption, authentication, and infrastructure practices.
              </p>
            </div>
          </div>
        </section>

        {/* Security Features Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="vp-card p-6 hover:shadow-[var(--vp-shadow)] transition-all duration-300"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[hsl(var(--vp-success))]/10 text-[hsl(var(--vp-success))] mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-2">{feature.title}</h3>
                <p className="text-sm text-[hsl(var(--vp-muted))] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="border-t border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))]">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="vp-heading mb-4">Regulatory Compliance</h2>
              <p className="text-[hsl(var(--vp-muted))] mb-8">
                VentaPlus is fully compliant with Argentine fiscal regulations and data protection standards.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="vp-card p-6 text-center">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))] mx-auto mb-3">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-1">ARCA / AFIP</h3>
                  <p className="text-sm text-[hsl(var(--vp-muted))]">
                    Full compliance with Argentine electronic invoicing regulations and fiscal requirements.
                  </p>
                </div>
                <div className="vp-card p-6 text-center">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[hsl(var(--vp-primary))]/10 text-[hsl(var(--vp-primary))] mx-auto mb-3">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--vp-text))] mb-1">Data Protection</h3>
                  <p className="text-sm text-[hsl(var(--vp-muted))]">
                    Customer and business data handled according to Argentine data protection laws.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
