# i18n (Internationalization) Implementation Guide

## Overview

Your POS SaaS system now has comprehensive multi-language support (Spanish, English, Portuguese) with Spanish as the default language. The i18n system covers:

- **All UI text** (buttons, labels, navigation)
- **Error messages** (validation, API errors)
- **Toast notifications** (success, warning, error, info)
- **Form labels and placeholders**

## How It Works

### 1. Language Context

The `LanguageContext` provides access to translations throughout your app:

```tsx
"use client";

import { useLanguage } from "@/lib/context/LanguageContext";

export default function MyComponent() {
  const { t, currentLanguage, setLanguage } = useLanguage();

  return (
    <div>
      <p>{t("loginButton", "common")}</p>
      <button onClick={() => setLanguage("en")}>Switch to English</button>
    </div>
  );
}
```

### 2. Translation Structure

Translations are organized by namespace:

```
common     - General UI text (buttons, navigation, common terms)
errors     - Error messages (validation, API errors)
messages   - Toast/notification messages
pricing    - Pricing page content
navigation - Navigation menu items
```

### 3. Using Translations

#### For Regular Text:

```tsx
const { t } = useLanguage();
<button>{t("save", "common")}</button>;
```

#### For Arrays (like feature lists):

```tsx
const features = t("freeFeatures", "pricing");
{
  features.map((feature) => <li>{feature}</li>);
}
```

#### For Translated Toast Notifications:

```tsx
"use client";

import { useTranslatedToast } from "@/lib/hooks/useTranslatedToast";

export default function MyComponent() {
  const toast = useTranslatedToast();

  const handleSave = async () => {
    try {
      // ... save logic
      toast.success("productCreated"); // Uses 'messages' namespace by default
    } catch (error) {
      toast.error("errorCreatingProduct"); // Uses 'errors' namespace by default
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

#### For Translated Error Handling:

```tsx
"use client";

import { useTranslatedError } from "@/lib/hooks/useTranslatedError";

export default function MyComponent() {
  const { getErrorMessage, handleError } = useTranslatedError();

  const fetchData = async () => {
    try {
      // ... fetch logic
    } catch (error) {
      const message = handleError(error, "generic", true); // Shows toast automatically
      console.log(message);
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## File Structure

```
src/
├── lib/
│   ├── context/
│   │   └── LanguageContext.tsx          # Main language provider
│   ├── hooks/
│   │   ├── useLang.ts                   # Access translations by namespace
│   │   ├── useTranslatedToast.ts        # Translated toast notifications
│   │   └── useTranslatedError.ts        # Translated error handling
│   └── utils/
│       ├── toastUtils.ts                # Toast display utilities
│       └── errorUtils.ts                # Error transformation utilities
└── components/
    ├── Header.tsx                        # Updated with translations
    ├── Footer.tsx                        # Updated with translations
    └── LanguageSelector.tsx              # Language switcher component
```

## Default Language

**Spanish (es)** is set as the default throughout the entire application.

## Supported Languages

- **es** - Español (Spanish)
- **en** - English
- **pt** - Português (Portuguese)

## Adding New Translations

### To add a new translation key:

1. Open `src/lib/context/LanguageContext.tsx`
2. Add the key to all three language objects:

```tsx
const translationsEs = {
  common: {
    // ... existing keys
    newKey: "Nueva Traducción en Español",
  },
};

const translationsEn = {
  common: {
    // ... existing keys
    newKey: "New Translation in English",
  },
};

const translationsPt = {
  common: {
    // ... existing keys
    newKey: "Nova Tradução em Português",
  },
};
```

### To add a new namespace:

1. Add the namespace object to all three language objects
2. Use it in components: `t('key', 'newNamespace')`

Example for a 'reports' namespace:

```tsx
const translationsEs = {
  reports: {
    title: "Reportes",
    exportPdf: "Exportar PDF",
    // ... more report translations
  },
};
```

## Updated Components

The following components now use the i18n system:

- ✅ **Header.tsx** - Navigation buttons, branding
- ✅ **Footer.tsx** - Footer links and copyright
- ✅ **PricingSection.tsx** - Pricing page content
- ✅ **LanguageSelector.tsx** - Language switching

## Usage in API Routes

For error responses, you can use the translation keys in your error payloads:

```tsx
// api/products/route.ts
if (!productName) {
  return NextResponse.json(
    { errorKey: "productNameRequired", message: "Product name is required" },
    { status: 400 },
  );
}
```

Then handle in the client:

```tsx
const { handleError } = useTranslatedError();
try {
  const response = await fetch("/api/products", { method: "POST" });
  if (!response.ok) {
    const data = await response.json();
    handleError(data.errorKey, "errors", true);
  }
} catch (error) {
  handleError(error);
}
```

## Best Practices

1. **Use namespaces consistently** - Keep related translations grouped
2. **Default to Spanish** - All missing keys will fall back to the key name itself
3. **Always wrap translated content with `String()`** when using arrays to avoid React warnings
4. **Use hooks in client components** - Mark components with `'use client'` when using i18n
5. **Test all three languages** - Use the language selector in the header to verify translations

## Testing i18n

1. Load the site and use the **Language Selector** in the header
2. Select different languages (ES, EN, PT)
3. Verify that:
   - Header text changes (Login, Sign Up)
   - Footer text changes (Features, Pricing, Legal links)
   - Pricing section updates
   - Default is always Spanish on page load

## localStorage

Language preference is saved to localStorage as `'language'` with values 'es', 'en', or 'pt'.

To reset: `localStorage.removeItem('language')`

---

**Complete i18n coverage is now active throughout your POS SaaS application with Spanish as the default language!**
