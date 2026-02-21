"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  MailIcon,
  PhoneIcon,
  ClockIcon,
  MapPinIcon,
  SendIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";

/* ─── Icon helper ─────────────────────────────────────────── */
function ContactIcon({ name }: { name: string }) {
  const cls = "w-5 h-5";
  switch (name) {
    case "mail":     return <MailIcon className={cls} />;
    case "phone":    return <PhoneIcon className={cls} />;
    case "clock":    return <ClockIcon className={cls} />;
    case "location": return <MapPinIcon className={cls} />;
    default:         return <MessageSquareIcon className={cls} />;
  }
}

/* ─── FAQ accordion item ──────────────────────────────────── */
function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="vp-card overflow-hidden transition-all duration-300 border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-primary)/0.3)] shadow-sm hover:shadow-md"
      style={{ animationDelay: `${index * 85}ms` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-8 text-left group"
        aria-expanded={open}
      >
        <span className="text-lg font-black text-[hsl(var(--vp-text))] group-hover:text-[hsl(var(--vp-primary))] transition-colors leading-tight tracking-tight">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border border-[hsl(var(--vp-border))] bg-[hsl(var(--vp-bg-soft))] text-[hsl(var(--vp-muted))] transition-all duration-300 ${
            open
              ? "bg-[hsl(var(--vp-primary))] border-[hsl(var(--vp-primary))] text-white rotate-180"
              : "group-hover:border-[hsl(var(--vp-primary))] group-hover:text-[hsl(var(--vp-primary))]"
          }`}
        >
          <ChevronDownIcon className="w-5 h-5" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-8 pb-8 pt-2">
            <p className="text-[hsl(var(--vp-muted))] leading-relaxed font-medium">
              {answer}
            </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function ContactPage() {
  const { t, currentLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hero    = useMemo(() => t("hero",   "contactPage") as any, [t, currentLanguage]);
  const form    = useMemo(() => t("form",   "contactPage") as any, [t, currentLanguage]);
  const info    = useMemo(() => t("info",   "contactPage") as any, [t, currentLanguage]);
  const faq     = useMemo(() => t("faq",    "contactPage") as any, [t, currentLanguage]);
  const demo    = useMemo(() => t("demo",   "contactPage") as any, [t, currentLanguage]);
  const ready   = useMemo(() => t("ready",  "contactPage") as any, [t, currentLanguage]);

  /* form state */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  /* scroll-reveal */
  useEffect(() => {
    if (!mounted) return;
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted, currentLanguage, sent]);

  /* validation */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim())    e.name    = form?.errors?.required || "Required";
    if (!formData.email.trim())   e.email   = form?.errors?.required || "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = form?.errors?.invalidEmail || "Invalid email";
    if (!formData.subject)        e.subject = form?.errors?.required || "Required";
    if (!formData.message.trim()) e.message = form?.errors?.required || "Required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSending(false);
    setSent(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  if (!mounted) return null;

  const inputBase =
    "w-full vp-input resize-none transition-all duration-200 h-12 rounded-xl border-[hsl(var(--vp-border))] focus:border-[hsl(var(--vp-primary))] focus:ring-4 focus:ring-[hsl(var(--vp-primary)/0.1)] outline-none font-medium";
  const labelBase =
    "block text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--vp-muted))] mb-2.5 ml-1";
  const errorMsg =
    "mt-1.5 text-xs text-[hsl(var(--vp-danger))] font-bold ml-1";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[hsl(var(--vp-bg-page))]">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-28 overflow-hidden">
          {/* background orbs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[140px]"
              style={{ background: "hsl(var(--vp-primary) / 0.07)" }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]"
              style={{ background: "hsl(var(--vp-accent) / 0.06)" }} />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center vp-reveal">
            {/* eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 vp-fade-in"
              style={{
                background: "hsl(var(--vp-primary) / 0.1)",
                border: "1px solid hsl(var(--vp-primary) / 0.2)"
              }}>
              <MessageSquareIcon className="w-4 h-4" style={{ color: "hsl(var(--vp-primary))" }} />
              <span className="font-black tracking-[0.15em] uppercase text-[10px]"
                style={{ color: "hsl(var(--vp-primary))" }}>
                {hero?.eyebrow}
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-balance mb-8 max-w-4xl mx-auto tracking-tight leading-[1.05] text-[hsl(var(--vp-text))]">
              {hero?.title}
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-balance font-medium text-[hsl(var(--vp-muted))] leading-relaxed">
              {hero?.subtitle}
            </p>

            {/* trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
              {[
                { icon: "⚡", label: hero?.badges?.response },
                { icon: "🔒", label: hero?.badges?.secure },
                { icon: "🇦🇷", label: hero?.badges?.argentina },
              ].map((b) => (
                <div key={b.label}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest vp-card border-[hsl(var(--vp-border))] bg-white/50 backdrop-blur-sm shadow-sm"
                  style={{ color: "hsl(var(--vp-muted))" }}>
                  <span className="text-lg">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main content: form + info ─────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* ── Contact Form (3/5) ─────────────────────────── */}
            <div className="lg:col-span-3 vp-reveal">
              <div className="vp-card overflow-hidden shadow-2xl border-[hsl(var(--vp-border))]">
                {/* form header */}
                <div className="px-10 pt-10 pb-8 border-b border-[hsl(var(--vp-border))]"
                  style={{ background: "hsl(var(--vp-bg-soft)/0.3)" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        background: "hsl(var(--vp-primary) / 0.1)",
                        border: "1px solid hsl(var(--vp-primary) / 0.2)"
                      }}>
                      <SendIcon className="w-6 h-6" style={{ color: "hsl(var(--vp-primary))" }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[hsl(var(--vp-text))] tracking-tight">{form?.title}</h2>
                      <p className="text-[hsl(var(--vp-muted))] font-medium">{form?.subtitle}</p>
                    </div>
                  </div>
                </div>

                {sent ? (
                  /* ── Success state ── */
                  <div className="p-16 text-center vp-fade-in">
                    <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-inner"
                      style={{ background: "hsl(var(--vp-success) / 0.1)", border: "2px solid hsl(var(--vp-success) / 0.3)" }}>
                      <CheckCircleIcon className="w-12 h-12" style={{ color: "hsl(var(--vp-success))" }} />
                    </div>
                    <h3 className="text-3xl font-black mb-4 text-[hsl(var(--vp-text))] tracking-tight">{form?.successTitle}</h3>
                    <p className="text-lg text-[hsl(var(--vp-muted))] mb-10 max-w-sm mx-auto font-medium leading-relaxed">{form?.successMessage}</p>
                    <button
                      onClick={() => { setSent(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                      className="vp-button vp-button-primary h-14 px-10 text-lg font-black rounded-2xl shadow-xl hover:shadow-[hsl(var(--vp-primary)/0.3)] transition-all"
                    >
                      {form?.sendAnother}
                    </button>
                  </div>
                ) : (
                  /* ── Form ── */
                  <form onSubmit={handleSubmit} className="p-10 space-y-8" noValidate>
                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div>
                        <label className={labelBase} htmlFor="contact-name">{form?.name}</label>
                        <div className="relative">
                          <input
                            id="contact-name"
                            name="name"
                            type="text"
                            placeholder={form?.namePlaceholder}
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => setFocused("name")}
                            onBlur={() => setFocused(null)}
                            className={`${inputBase} ${errors.name ? "border-[hsl(var(--vp-danger))]" : ""}`}
                            autoComplete="name"
                          />
                        </div>
                        {errors.name && <p className={errorMsg}>{errors.name}</p>}
                      </div>
                      <div>
                        <label className={labelBase} htmlFor="contact-email">{form?.email}</label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder={form?.emailPlaceholder}
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          className={`${inputBase} ${errors.email ? "border-[hsl(var(--vp-danger))]" : ""}`}
                          autoComplete="email"
                        />
                        {errors.email && <p className={errorMsg}>{errors.email}</p>}
                      </div>
                    </div>

                    {/* Phone + Subject */}
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div>
                        <label className={labelBase} htmlFor="contact-phone">{form?.phone}</label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          placeholder={form?.phonePlaceholder}
                          value={formData.phone}
                          onChange={handleChange}
                          onFocus={() => setFocused("phone")}
                          onBlur={() => setFocused(null)}
                          className={inputBase}
                          autoComplete="tel"
                        />
                      </div>
                      <div>
                        <label className={labelBase} htmlFor="contact-subject">{form?.subject}</label>
                        <div className="relative">
                          <select
                            id="contact-subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            onFocus={() => setFocused("subject")}
                            onBlur={() => setFocused(null)}
                            className={`${inputBase} cursor-pointer appearance-none ${errors.subject ? "border-[hsl(var(--vp-danger))]" : ""}`}
                          >
                            <option value="" disabled>{form?.subjectPlaceholder}</option>
                            {Array.isArray(form?.subjectOptions) &&
                              form.subjectOptions.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[hsl(var(--vp-muted))]">
                            <ChevronDownIcon className="w-4 h-4" />
                          </div>
                        </div>
                        {errors.subject && <p className={errorMsg}>{errors.subject}</p>}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className={labelBase} htmlFor="contact-message">{form?.message}</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        placeholder={form?.messagePlaceholder}
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                        className={`${inputBase} h-auto py-4 ${errors.message ? "border-[hsl(var(--vp-danger))]" : ""}`}
                      />
                      {errors.message && <p className={errorMsg}>{errors.message}</p>}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={sending}
                      className="vp-button vp-button-primary w-full h-14 text-lg font-black rounded-2xl shadow-xl hover:shadow-[hsl(var(--vp-primary)/0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                    >
                      {sending ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                          {form?.sending}
                        </>
                      ) : (
                        <>
                          <SendIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          {form?.submit}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* ── Info Cards (2/5) ──────────────────────────── */}
            <div className="lg:col-span-2 space-y-6 vp-reveal" style={{ "--vp-reveal-delay": "100ms" } as React.CSSProperties}>
              <h2 className="text-2xl font-black text-[hsl(var(--vp-text))] mb-8 tracking-tight ml-1">{info?.title}</h2>

              {Array.isArray(info?.items) && info.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="vp-card p-6 flex items-center gap-5 group vp-card-hover cursor-default border-[hsl(var(--vp-border))] hover:border-[hsl(var(--vp-primary)/0.3)] bg-white/40 shadow-sm"
                >
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-[hsl(var(--vp-primary))] group-hover:text-white"
                    style={{
                      background: "hsl(var(--vp-primary) / 0.1)",
                      border: "1px solid hsl(var(--vp-primary) / 0.15)",
                      color: "hsl(var(--vp-primary))"
                    }}
                  >
                    <ContactIcon name={item.icon} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[hsl(var(--vp-muted))] mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-xs text-[hsl(var(--vp-muted-soft))] mb-1 font-medium">{item.description}</p>
                    <p className="font-bold text-[hsl(var(--vp-text))] text-base tracking-tight truncate">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Quick link card */}
              <div className="vp-card p-8 mt-10 relative overflow-hidden shadow-xl"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--vp-primary) / 0.08), hsl(var(--vp-accent) / 0.05))",
                  border: "1px solid hsl(var(--vp-primary) / 0.2)"
                }}>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full blur-3xl"
                  style={{ background: "hsl(var(--vp-primary) / 0.15)" }} />
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[hsl(var(--vp-primary)/0.2)] shadow-sm flex items-center justify-center mb-6">
                        <SparklesIcon className="w-6 h-6" style={{ color: "hsl(var(--vp-primary))" }} />
                    </div>
                    <h3 className="text-xl font-black text-[hsl(var(--vp-text))] mb-2 tracking-tight">
                    {demo?.title}
                    </h3>
                    <p className="text-[hsl(var(--vp-muted))] mb-8 leading-relaxed font-medium">
                    {demo?.subtitle}
                    </p>
                    <Link
                    href="/auth/register"
                    className="vp-button vp-button-primary h-12 w-full justify-center font-black rounded-xl shadow-lg"
                    >
                    {demo?.button}
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ──────────────────────────────────── */}
        <section className="py-24 sm:py-32 border-y border-[hsl(var(--vp-border))]"
          style={{ background: "hsl(var(--vp-bg-section))" }}>
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center mb-20 vp-reveal">
              <h2 className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-text))] mb-6 tracking-tight">{faq?.title}</h2>
              <p className="text-xl text-[hsl(var(--vp-muted))] max-w-xl mx-auto font-medium">{faq?.subtitle}</p>
            </div>
            <div className="space-y-4 vp-reveal">
              {Array.isArray(faq?.items) && faq.items.map((item: any, i: number) => (
                <FaqItem key={i} question={item.question} answer={item.answer} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────── */}
        <section className="py-32 vp-reveal">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-[3rem] border border-[hsl(var(--vp-border))] px-10 py-20 text-center shadow-[0_30px_100px_-20px_rgba(34,197,94,0.15)]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--vp-primary) / 0.12), hsl(var(--vp-surface)), hsl(var(--vp-primary) / 0.05))"
              }}>
              <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 rounded-full blur-[100px] -z-0"
                style={{ background: "hsl(var(--vp-primary) / 0.15)" }} />
              <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-80 h-80 rounded-full blur-[100px] -z-0"
                style={{ background: "hsl(var(--vp-primary) / 0.1)" }} />

              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="w-16 h-16 rounded-[1.25rem] mx-auto mb-8 flex items-center justify-center shadow-xl rotate-3 bg-white border border-[hsl(var(--vp-border))]">
                  <SparklesIcon className="w-8 h-8" style={{ color: "hsl(var(--vp-primary))" }} />
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-[hsl(var(--vp-text))] mb-6 tracking-tight leading-[1.1]">
                  {ready?.title}
                </h2>
                <p className="text-xl text-[hsl(var(--vp-muted))] mb-12 font-medium leading-relaxed max-w-2xl mx-auto">
                  {ready?.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/auth/register" className="vp-button vp-button-primary h-16 px-12 text-xl font-black rounded-2xl shadow-2xl hover:shadow-[hsl(var(--vp-primary)/0.4)] transition-all hover:scale-105">
                    {ready?.primaryCta}
                    <ArrowRightIcon className="w-6 h-6 ml-1" />
                  </Link>
                  <Link href="/features" className="vp-button h-16 px-12 text-xl font-black rounded-2xl border-[hsl(var(--vp-border))] bg-white/80 hover:bg-white transition-all shadow-sm">
                    {ready?.secondaryCta}
                  </Link>
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
