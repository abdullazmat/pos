import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/common/ToastProvider";
import { GlobalErrorHandler } from "@/components/common/GlobalErrorHandler";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { ThemeProvider as CustomThemeProvider } from "@/lib/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

// Enable Vercel-only integrations (analytics / speed insights) only when
// running on Vercel or when explicitly enabled via NEXT_PUBLIC_ENABLE_VERCEL.
const enableVercelIntegration =
  !!process.env.VERCEL || process.env.NEXT_PUBLIC_ENABLE_VERCEL === "1";

export const metadata: Metadata = {
  title: "VentaPlus",
  description: "VentaPlus SaaS POS",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/react-dom-patch.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GlobalErrorHandler />
        <CustomThemeProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="pos-theme"
            >
              <ToastProvider />
              {children}
              {enableVercelIntegration && <Analytics />}
              {enableVercelIntegration && <SpeedInsights />}
            </ThemeProvider>
          </LanguageProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
