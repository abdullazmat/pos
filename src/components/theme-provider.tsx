"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: any) {
  // Always render NextThemesProvider - removed conditional logic
  // to prevent DOM manipulation issues
  return (
    <NextThemesProvider {...props} suppressHydrationWarning>
      {children}
    </NextThemesProvider>
  );
}
