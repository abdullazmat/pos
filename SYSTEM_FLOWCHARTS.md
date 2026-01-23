# Business Configuration System - Complete Flowcharts

## Overall System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS CONFIG                          │
│                   SUBSCRIPTION SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  business-config/page.tsx                              │ │
│  │  - Display plans                                       │ │
│  │  - Show ticket preview                                 │ │
│  │  - Handle subscribe                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  GET /api/plans                                        │ │
│  │  Returns: [FREE, PRO]                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  GET /api/subscription                                 │ │
│  │  Returns: Current subscription                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  POST /api/subscription/upgrade                        │ │
│  │  Body: { planId }                                      │ │
│  │  Returns: Updated subscription                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Subscription Collection                               │ │
│  │  - planId: "FREE" | "PRO"                              │ │
│  │  - features: { maxProducts, maxUsers, ... }            │ │
│  │  - currentPeriodStart/End                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## User Flow - Subscribe to Plan

```
START
  │
  ├─→ User visits /business-config
  │
  ├─→ Page loads
  │   ├─ fetchPlans() → setPlans([FREE, PRO])
  │   ├─ fetchSubscription() → setCurrentSubscription()
  │   └─ setLoading(false)
  │
  ├─→ Plans displayed
  │   ├─ Current plan shows "Plan Actual" badge
  │   ├─ Other plans show "Click para suscribirse →"
  │   └─ PRO shows "Popular" badge
  │
  ├─→ User clicks "Click para suscribirse →" on PRO
  │
  ├─→ Button state changes
  │   └─ "Procesando..." + disabled
  │
  ├─→ POST /api/subscription/upgrade
  │   ├─ Server validates token
  │   ├─ Server validates planId
  │   ├─ Updates Subscription in DB
  │   └─ Returns updated subscription
  │
  ├─→ Response handling
  │   ├─ Success:
  │   │  ├─ toast.success()
  │   │  ├─ fetchSubscription()
  │   │  └─ Button updates to "Plan Actual"
  │   │
  │   └─ Error:
  │      └─ toast.error()
  │
  ├─→ User sees confirmation
  │   ├─ Success message
  │   ├─ Button state updated
  │   └─ Page still responsive
  │
  └─→ END
```

## API Call Sequence

```
FRONTEND                           BACKEND                         DATABASE
   │                                 │                                │
   │─── GET /api/plans ────────────→ │                                │
   │                                 │─ Query plans from config ─────→│
   │                                 │←─ [FREE, PRO] ────────────────│
   │←─ [FREE, PRO] ─────────────────│                                │
   │                                 │                                │
   │─ setPlans([FREE, PRO])          │                                │
   │                                 │                                │
   ├─── GET /api/subscription ─────→ │                                │
   │                                 │─ Find subscription ───────────→│
   │                                 │←─ subscription doc ───────────│
   │←─ subscription object ─────────│                                │
   │                                 │                                │
   │─ setCurrentSubscription()       │                                │
   │                                 │                                │
   ├─── User clicks subscribe ──→    │                                │
   │                                 │                                │
   ├─ handleSubscribe()              │                                │
   │                                 │                                │
   ├─ setSubscribing(true)           │                                │
   │                                 │                                │
   ├─── POST /api/subscription ────→ │                                │
   │    /upgrade                     │─ Validate token ──────────────│
   │    { planId: "PRO" }            │                                │
   │                                 │─ Validate plan ─────────────→│
   │                                 │←─ Plan valid ───────────────│
   │                                 │                                │
   │                                 │─ Update subscription ────────→│
   │                                 │  { planId: "PRO",              │
   │                                 │    currentPeriodStart: ...,    │
   │                                 │    features: {...} }           │
   │                                 │                                │
   │                                 │←─ Updated doc ──────────────│
   │                                 │                                │
   │←─ subscription object ─────────│                                │
   │                                 │                                │
   │─ fetchSubscription()            │                                │
   │    (refresh data)               │                                │
   │                                 │                                │
   │─ setSubscribing(false)          │                                │
   │                                 │                                │
   │─ toast.success()                │                                │
   │                                 │                                │
   └─ Button updates ──────→ "Plan Actual"
```

## Button State Machine

```
┌─────────────────────┐
│   INITIAL STATE     │
│   (Page Loading)    │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  CHECK SUBSCRIPTION STATUS           │
├──────────────────────────────────────┤
│                                      │
├─ Is already subscribed to plan?      │
│  ├─ YES → [Plan Actual] (disabled)   │
│  └─ NO → [Click para suscribirse →]  │
│         (enabled)                    │
└──────────────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
User Clicks   Button Disabled
    │
    ├─→ setSubscribing(true)
    │
    ├─→ Button Text: "Procesando..."
    │   Button State: disabled
    │
    ├─→ POST /api/subscription/upgrade
    │
    ├─→ Response received
    │
    ├─→ setSubscribing(false)
    │
    ├─→ fetchSubscription()
    │
    └─→ Button Text: "Plan Actual"
        Button State: disabled
```

## Error Handling Flow

```
User Action
    │
    ├─ handleSubscribe()
    │   │
    │   ├─ Check if same plan
    │   │   ├─ YES → toast.info("Ya estás suscrito")
    │   │   │        RETURN (no API call)
    │   │   │
    │   │   └─ NO → Continue
    │
    ├─ setSubscribing(true)
    │
    ├─ Try POST /api/subscription/upgrade
    │   │
    │   ├─ Network Error
    │   │   └─ catch block
    │   │       └─ toast.error("Error al actualizar")
    │   │
    │   ├─ HTTP 401 (Unauthorized)
    │   │   └─ Error response
    │   │       └─ toast.error("Sesión expirada")
    │   │
    │   ├─ HTTP 400 (Bad Plan)
    │   │   └─ Error response
    │   │       └─ toast.error("Plan inválido")
    │   │
    │   └─ HTTP 200 (Success)
    │       └─ Success response
    │           ├─ toast.success()
    │           ├─ fetchSubscription()
    │           └─ UI Updates
    │
    └─ setSubscribing(false)
        └─ Button re-enabled
```

## Plan Selection Flow

```
User sees plans:

┌──────────────────────┐    ┌──────────────────────┐
│   FREE Plan          │    │   PRO Plan           │
│   $0/mes             │    │   $19,990/mes        │
│                      │    │   [Popular Badge]    │
│   [100 productos]    │    │   [∞ productos]      │
│   [2 usuarios]       │    │   [∞ usuarios]       │
│                      │    │   [✓ Logo]           │
│  ┌────────────────┐  │    │  ┌────────────────┐  │
│  │Click para sub→ │  │    │  │Click para sub→ │  │
│  └────────────────┘  │    │  └────────────────┘  │
└──────────────────────┘    └──────────────────────┘
         │                            │
         ├─ If currently on FREE      ├─ If currently on PRO
         │   └─ Button enabled        │   └─ Button disabled
         │                            │      Shows "Plan Actual"
         │                            │
         ├─ If currently on PRO       ├─ If currently on FREE
         │   └─ Button disabled       │   └─ Button enabled
         │      Shows "Plan Actual"   │

User clicks button
        │
        ├─ Calls handleSubscribe("PRO")
        │
        └─ Updates subscription
           └─ UI refreshes
```

## Data Flow - States

```
Component States:

const [plans, setPlans]                          ← [FREE, PRO]
const [currentSubscription, setCurrentSubscription] ← { planId: "FREE", ... }
const [subscribing, setSubscribing]              ← boolean
const [formData, setFormData]                    ← { businessName, ... }
const [user, setUser]                            ← { id, email, ... }
const [loading, setLoading]                      ← boolean

On Mount:
├─ Loading = true
├─ Fetch plans → setPlans()
├─ Fetch subscription → setCurrentSubscription()
├─ Fetch config → setFormData()
└─ Loading = false

On Subscribe Click:
├─ Subscribing = true
├─ POST to API
├─ Response received
├─ Subscribing = false
└─ Refresh subscription

UI Renders Based On:
├─ loading → Show loading screen
├─ plans → Display plan cards
├─ currentSubscription → Show current badge
├─ subscribing → Show button state
└─ formData → Update ticket preview
```

## Timeline Example

```
12:00 PM - User loads page
│
├─ 12:00:01 - fetchPlans() called
├─ 12:00:02 - Plans loaded in state
│
├─ 12:00:03 - fetchSubscription() called
├─ 12:00:04 - Subscription loaded ("FREE" plan)
│
├─ 12:00:05 - fetchBusinessConfig() called
├─ 12:00:06 - Business info loaded
│
├─ 12:00:07 - setLoading(false)
├─ 12:00:08 - Page fully rendered
│
├─ 12:02:00 - User clicks "PRO" subscribe button
├─ 12:02:01 - setSubscribing(true)
├─ 12:02:01 - POST /api/subscription/upgrade
├─ 12:02:02 - Button shows "Procesando..."
│
├─ 12:02:05 - API responds with success
├─ 12:02:06 - toast.success("¡Suscripción actualizada!")
├─ 12:02:07 - fetchSubscription()
├─ 12:02:08 - Subscription refreshed (PRO plan)
├─ 12:02:09 - setSubscribing(false)
├─ 12:02:10 - Button shows "Plan Actual"
│
└─ 12:02:11 - User sees PRO plan selected
```

## Summary

This system provides:

- ✅ Clean user flow
- ✅ Clear error handling
- ✅ Proper state management
- ✅ Secure backend validation
- ✅ Real-time UI updates
- ✅ Professional UX

All flows are tested and production-ready!
