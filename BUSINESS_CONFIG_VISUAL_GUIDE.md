# Business Configuration Page - Visual & Architecture Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ [ Back Button ] [Navigation] [User Profile]                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Page Title & Description                                     │
│ 🏪 Configuración del Negocio                                 │
│ Personaliza la información que aparece en tus tickets        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────┐
│          LEFT COLUMN             │      RIGHT COLUMN        │
├──────────────────────────────────┼──────────────────────────┤
│                                  │                          │
│  ┌──────────────────────────┐   │  ┌─────────────────────┐ │
│  │ 🎨 Logo del Negocio      │   │  │ 👑 Vista Previa     │ │
│  │ [Premium Badge]          │   │  │    del Ticket       │ │
│  │                          │   │  │                     │ │
│  │ ┌──────────────────────┐ │   │  │ ┌─────────────────┐ │ │
│  │ │ 👑 Función Premium   │ │   │  │ │ Terminal Style  │ │ │
│  │ │ Personaliza ticket   │ │   │  │ │ Ticket Preview  │ │ │
│  │ │ con logo             │ │   │  │ │                 │ │ │
│  │ └──────────────────────┘ │   │  │ │ MI NEGOCIO      │ │ │
│  └──────────────────────────┘   │  │ │ Dirección...    │ │ │
│                                  │  │ │ Tel: ...        │ │ │
│  ┌──────────────────────────┐   │  │ │ Email: ...      │ │ │
│  │ 👑 Plan de Suscripción   │   │  │ │                 │ │ │
│  │                          │   │  │ │ TICKET: ...     │ │ │
│  │ ┌────────────────────┐   │   │  │ │ FECHA: ...      │ │ │
│  │ │ 🎯 Gratuito   $0   │   │   │  │ │ HORA: ...       │ │ │
│  │ │ /mes                │   │   │  │ │                 │ │ │
│  │ │ [100 productos]     │   │   │  │ │ Producto        │ │ │
│  │ │ [2 usuarios]        │   │   │  │ │ Total: $...     │ │ │
│  │ │ [Plan Actual]       │   │   │  │ │                 │ │ │
│  │ └────────────────────┘   │   │  │ │ GRACIAS ...     │ │ │
│  │                          │   │  │ └─────────────────┘ │ │
│  │ ┌────────────────────┐   │   │  └─────────────────────┘ │
│  │ │ ⭐ Pro        $19.990  │   │                          │
│  │ │ /mes                │   │                          │
│  │ │ [∞ productos]       │   │                          │
│  │ │ [∞ usuarios]        │   │                          │
│  │ │ [✓ Logo]            │   │                          │
│  │ │ [Popular]           │   │                          │
│  │ │ [Click para...]     │   │                          │
│  │ └────────────────────┘   │                          │
│  └──────────────────────────┘                          │
│                                  │                     │
└──────────────────────────────────┴──────────────────────┘
```

## Component Structure

```
BusinessConfigPage (Main Component)
├── useEffect (on mount)
│   ├── fetchPlans()
│   ├── fetchSubscription()
│   └── fetchBusinessConfig()
│
├── Header (Navigation)
│
├── Page Title Section
│
├── Grid Container (2 columns)
│   │
│   ├── LEFT COLUMN
│   │   ├── Logo Section
│   │   │   └── Premium Feature Card
│   │   │
│   │   └── Plans Section
│   │       └── Map plans.map((plan) => (
│   │           ├── Plan Card
│   │           ├── Plan Features
│   │           └── Subscribe Button
│   │
│   └── RIGHT COLUMN
│       └── Ticket Preview (Sticky)
│           └── Terminal Style Ticket
│
└── (End of component)
```

## State Flow Diagram

```
Initial Load
    │
    ├─→ [Loading State]
    │
    ├─→ fetchPlans()
    │   └─→ API: GET /api/plans
    │       └─→ setPlans(data)
    │
    ├─→ fetchSubscription()
    │   └─→ API: GET /api/subscription
    │       └─→ setCurrentSubscription(data)
    │
    ├─→ fetchBusinessConfig()
    │   └─→ API: GET /api/business-config
    │       └─→ setFormData(data)
    │
    └─→ setLoading(false)

User Interaction
    │
    ├─→ Click "Click para suscribirse →"
    │
    ├─→ handleSubscribe(planId)
    │   │
    │   ├─→ Check: already subscribed?
    │   │   └─→ Yes: toast.info()
    │   │   └─→ No: continue
    │   │
    │   ├─→ setSubscribing(true)
    │   │   └─→ Button shows "Procesando..."
    │   │
    │   ├─→ API: POST /api/subscription/upgrade
    │   │   ├─→ Success:
    │   │   │   ├─→ toast.success()
    │   │   │   ├─→ fetchSubscription()
    │   │   │   └─→ Button updates to "Plan Actual"
    │   │   │
    │   │   └─→ Error:
    │   │       └─→ toast.error()
    │   │
    │   └─→ setSubscribing(false)
    │       └─→ Button re-enabled
```

## Data Flow

### Plans Data Structure

```
plans: [
  {
    id: "FREE",
    name: "Gratuito",
    price: 0,
    icon: "🎯",
    popular: false,
    limits: ["100 productos", "2 usuarios"],
    features: {...}
  },
  {
    id: "PRO",
    name: "Pro",
    price: 19990,
    icon: "⭐",
    popular: true,
    limits: ["∞ productos", "∞ usuarios", "✓ Logo"],
    features: {...}
  }
]
```

### Current Subscription Data

```
currentSubscription: {
  planId: "FREE" | "PRO",
  status: "active",
  currentPeriodStart: "2026-01-23T...",
  currentPeriodEnd: "2026-02-23T...",
  features: {
    maxProducts: 100,
    maxUsers: 2,
    customBranding: false,
    ...
  }
}
```

### Business Config Data

```
formData: {
  businessName: "MI NEGOCIO",
  address: "Av. San Martín 1234",
  phone: "011 1234-5678",
  email: "info@minegocio.com",
  website: "www.minegocio.com",
  cuitRucDni: "20-12345678-9",
  ticketMessage: "¡GRACIAS!\nVuelva pronto"
}
```

## Button States

### Subscribe Button

```
STATE 1: Browsing Plans
├─ Not Subscribed → [Click para suscribirse →] (bg-purple-600)
└─ Already Subscribed → [Plan Actual] (bg-slate-700, disabled)

STATE 2: Subscribing
├─ All Plans → [Procesando...] (disabled)

STATE 3: Subscribed
├─ Current Plan → [Plan Actual] (bg-slate-700, disabled)
└─ Other Plans → [Click para suscribirse →] (bg-purple-600, enabled)
```

## Color Scheme

### Theme Colors

```
Background:       bg-slate-950 (Nearly black)
Surface:          bg-slate-900 (Dark)
Border Active:    border-purple-600/30 → border-purple-600/50 (hover)
Border Inactive:  border-slate-800
Text Primary:     text-white
Text Secondary:   text-slate-400
Accent:           bg-purple-600 (buttons)
Success:          bg-green-900/50 (badges)
Warning:          bg-yellow-900/50 (badges)

Ticket Preview:
Background:       bg-black
Text:             text-green-400
Border:           border-green-600/30
```

## Responsive Breakpoints

### Desktop (lg and above)

```
Grid: 2 columns (1fr 1fr)
─────────────────────────
│  Left (1fr)  │  Right (1fr) │
│              │              │
│  Logo        │  Ticket      │
│  Plans       │  (Sticky)    │
│              │              │
```

### Tablet (md and below)

```
Grid: 1 column (1fr)
─────────────────────
│   Full Width  │
│               │
│   Logo        │
│   Plans       │
│               │
│   Ticket      │
│               │
```

## Animation & Transitions

### Plan Cards

```
Hover: border-color transition (300ms)
       bg-color transition (150ms)

Selected: instant border change
          instant bg change
```

### Subscribe Button

```
Hover: bg-color transition (200ms)
       shadow-lg effect

Disabled: opacity 50%
          cursor-not-allowed
```

### Ticket Preview

```
Position: sticky top-20
          Stays 80px from top while scrolling
```

## Accessibility Features

### Semantic HTML

- Proper heading hierarchy (h1, h2)
- Button elements for interactions
- Section elements for layout
- Label elements for forms (if added)

### Visual Indicators

- Color not only indicator (badges with text)
- Clear button text labels
- High contrast (white on dark background)
- Focus states for keyboard navigation

### ARIA Labels (to consider adding)

- `aria-label` on icon buttons
- `aria-current="page"` on current plan
- `aria-disabled` on disabled buttons
- `role="region"` on sticky preview

## Performance Optimizations

### Current Implementation

- Single fetch per endpoint
- State updates batched
- No unnecessary re-renders
- Sticky positioning (GPU accelerated)

### Future Improvements

- Image lazy loading for logo (when added)
- Plan cache in localStorage
- Debounce if business info becomes editable
- Virtual scrolling if plans list grows

## Customization Points

### To Change Plan Features

```typescript
// File: /api/plans/route.ts
const PLANS = {
  PRO: {
    features: {
      maxProducts: 999999, // ← Change here
      maxUsers: 999999, // ← Change here
      customBranding: true, // ← Change here
      // ...
    },
  },
};
```

### To Change Colors

```typescript
// In page.tsx JSX
className = "bg-purple-600"; // ← Change to desired color
```

### To Change Plan Names/Descriptions

```typescript
// File: /api/plans/route.ts
{
  id: "PRO",
  name: "Pro",              // ← Change here
  description: "Todo...",   // ← Change here
}
```

### To Add New Plan

```typescript
// 1. Add to PLANS constant
// 2. It automatically appears in UI
// 3. All features inherited from constant
```
