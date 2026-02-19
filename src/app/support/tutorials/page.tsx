"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";

interface TutorialCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
  color: string;
}

const tutorialCategories: TutorialCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "First steps to set up your VentaPlus account and start selling",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    articleCount: 5,
    color: "var(--vp-primary)",
  },
  {
    id: "arca-invoicing",
    title: "ARCA Invoicing",
    description: "Electronic invoicing with ARCA/AFIP compliance",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    articleCount: 8,
    color: "var(--vp-success)",
  },
  {
    id: "pos-cash-register",
    title: "POS / Cash Register",
    description: "Master the point of sale interface and cash management",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    articleCount: 12,
    color: "var(--vp-info)",
  },
  {
    id: "inventory-management",
    title: "Inventory Management",
    description: "Stock control, categories, and product management",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    articleCount: 10,
    color: "var(--vp-warning)",
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    description: "Manage your VentaPlus subscription and billing",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    articleCount: 4,
    color: "221 70% 48%",
  },
  {
    id: "payment-orders",
    title: "Payment Orders",
    description: "Create and manage payment orders for suppliers",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    articleCount: 6,
    color: "var(--vp-accent)",
  },
  {
    id: "suppliers",
    title: "Suppliers",
    description: "Supplier management, purchases, and returns",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-17.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125H6.75M12 14.25V3.75m0 10.5l3-3m-3 3l-3-3" />
      </svg>
    ),
    articleCount: 7,
    color: "var(--vp-danger)",
  },
  {
    id: "customers",
    title: "Customers",
    description: "Customer database, credit sales, and accounts",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    articleCount: 5,
    color: "280 70% 55%",
  },
  {
    id: "expenses",
    title: "Expenses",
    description: "Track and manage business expenses",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    articleCount: 4,
    color: "0 84% 60%",
  },
  {
    id: "fiscal-reports",
    title: "Fiscal Reports",
    description: "Generate and understand fiscal and tax reports",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    articleCount: 9,
    color: "38 92% 50%",
  },
  {
    id: "initial-configuration",
    title: "Initial Configuration",
    description: "Business setup, tax settings, and system preferences",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    articleCount: 6,
    color: "215 18% 45%",
  },
];

export default function TutorialsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = tutorialCategories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="vp-page pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--vp-primary))]/8 via-transparent to-[hsl(var(--vp-accent))]/6" />
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[hsl(var(--vp-primary))]/5 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-[hsl(var(--vp-accent))]/5 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[hsl(var(--vp-muted))] mb-8">
              <Link href="/" className="hover:text-[hsl(var(--vp-text))] transition-colors">
                {String(t("home", "common") || "Home")}
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/support/tutorials" className="hover:text-[hsl(var(--vp-text))] transition-colors">
                {String(t("support", "common") || "Support")}
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[hsl(var(--vp-text))] font-medium">
                {String(t("tutorials", "common") || "Tutorials")}
              </span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--vp-primary))]/10 border border-[hsl(var(--vp-primary))]/20 text-sm font-semibold text-[hsl(var(--vp-primary))] mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
                {String(t("tutorials", "common") || "Tutorials")}
              </div>

              <h1 className="vp-section-title mb-4">
                {String(t("tutorialsTitle", "common") || "Learn VentaPlus")}
              </h1>
              <p className="text-lg text-[hsl(var(--vp-muted))] leading-relaxed mb-8">
                {String(
                  t("tutorialsSubtitle", "common") ||
                    "Step-by-step guides to help you master every feature. From initial setup to advanced fiscal reports."
                )}
              </p>

              {/* Search */}
              <div className="relative max-w-lg">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--vp-muted))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={String(
                    t("searchTutorials", "common") || "Search tutorials..."
                  )}
                  className="vp-input pl-12 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="tutorials-search"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/support/tutorials/${category.id}`}
                className="group vp-card p-6 hover:shadow-[var(--vp-shadow-float)] hover:border-[hsl(var(--vp-primary))]/30 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 60}ms` }}
                id={`tutorial-category-${category.id}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `linear-gradient(135deg, hsl(${category.color}) 0%, hsl(${category.color} / 0.7) 100%)`,
                    }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[hsl(var(--vp-text))] text-base mb-1 group-hover:text-[hsl(var(--vp-primary))] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-[hsl(var(--vp-muted))] leading-relaxed mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--vp-muted))]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {category.articleCount} {category.articleCount === 1 ? "article" : "articles"}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-[hsl(var(--vp-muted))] group-hover:text-[hsl(var(--vp-primary))] group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* No results */}
          {filteredCategories.length === 0 && (
            <div className="vp-empty-state mt-8">
              <svg className="w-12 h-12 mx-auto mb-4 vp-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h3 className="text-lg font-semibold text-[hsl(var(--vp-text))] mb-2">
                {String(t("noResults", "common") || "No results found")}
              </h3>
              <p className="text-sm">
                {String(t("tryDifferentSearch", "common") || "Try a different search term")}
              </p>
            </div>
          )}

          {/* Need Help CTA */}
          <div className="mt-16 rounded-2xl border border-[hsl(var(--vp-border))] bg-gradient-to-r from-[hsl(var(--vp-primary))]/5 to-[hsl(var(--vp-accent))]/5 p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-semibold text-[hsl(var(--vp-text))] mb-3">
              {String(t("needMoreHelp", "common") || "Need more help?")}
            </h2>
            <p className="text-[hsl(var(--vp-muted))] mb-6 max-w-lg mx-auto">
              {String(
                t("contactSupportDescription", "common") ||
                  "Our support team is ready to help you with any questions about VentaPlus."
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/contact" className="vp-button vp-button-primary">
                {String(t("contactSupport", "common") || "Contact Support")}
              </Link>
              <Link href="/help" className="vp-button">
                {String(t("helpCenter", "common") || "Help Center")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
