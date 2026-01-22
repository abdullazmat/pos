# 🎯 Premium Features - Complete System Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Dashboard      │  │   Upgrade Page   │  │   Reports    │ │
│  │  - Shows Plan    │  │  - Stripe        │  │  - Premium   │ │
│  │  - Renewal Date  │  │  - Mercado Pago  │  │    Tabs Lock │ │
│  │  - Upgrade Btn   │  │  - Plan Compare  │  │  - Features  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Products       │  │    Clients       │  │  Suppliers   │ │
│  │  - Limit Check   │  │  - Limit Check   │  │ - Limit Check│ │
│  │  - Add/Edit      │  │  - Add/Edit      │  │ - Add/Edit   │ │
│  │  - UpgradePrompt │  │  - UpgradePrompt │  │ - UpgradePrm │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                 │
│                  useSubscription() Hook                         │
│         (Fetches & Caches Subscription Data)                   │
│                                                                 │
└────────────────────────┬─────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   [HTTP Calls]    [State Mgmt]    [Error Handling]
        │                │                │
┌───────▼────────────────▼────────────────▼──────────────┐
│              BACKEND API LAYER                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GET /api/subscriptions/status                         │
│  └─→ Returns: planId, status, features, isPremium     │
│                                                         │
│  PUT /api/subscriptions/status (Webhooks)             │
│  └─→ Updates: planId, status, features                │
│                                                         │
│  GET /api/subscription/limits                         │
│  └─→ Returns: Usage vs Limits                         │
│                                                         │
│  POST /api/payments (Mercado Pago)                    │
│  └─→ Creates: Payment preference                      │
│                                                         │
│  POST /api/stripe/create-checkout (Stripe)            │
│  └─→ Creates: Checkout session                        │
│                                                         │
└────────┬──────────────────────────────────┬────────────┘
         │                                  │
         │                 Webhooks         │
         │                                  │
    [JWT Verify]                    [Signature Verify]
         │                                  │
┌────────▼──────────────────────────────────▼────────────┐
│          PAYMENT PROVIDER WEBHOOKS                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Stripe Webhook                                        │
│  ├─→ checkout.session.completed                       │
│  ├─→ customer.subscription.created/updated           │
│  ├─→ customer.subscription.deleted                   │
│  └─→ invoice.payment_failed/succeeded                │
│                                                         │
│  Mercado Pago Webhook                                 │
│  ├─→ payment.created                                  │
│  ├─→ payment.updated                                  │
│  └─→ subscription.updated                            │
│                                                         │
└────────┬──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│            DATABASE (MongoDB)                           │
├──────────────────────────────────────────────────────────┤
│                                                         │
│  Subscription Document:                               │
│  {                                                     │
│    _id,                                                │
│    businessId,          ← Unique per business        │
│    planId: "PROFESSIONAL",                            │
│    status: "active",                                  │
│    provider: "stripe",                                │
│    stripeSubscriptionId,                              │
│    stripeCustomerId,                                  │
│    currentPeriodStart,                                │
│    currentPeriodEnd,                                  │
│    features: {                                        │
│      maxProducts: 5000,                               │
│      maxUsers: 5,                                     │
│      maxClients: 100,                                 │
│      arcaIntegration: true,                           │
│      advancedReporting: true,                         │
│      ...                                              │
│    },                                                 │
│    failedPayments: 0,                                 │
│    autoRenew: true,                                   │
│    createdAt,                                         │
│    updatedAt                                          │
│  }                                                     │
│                                                         │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER ACTION                 COMPONENT                   API                    DATABASE
─────────────────────────────────────────────────────────────────────────────────────────

Register                    Register Component
   │                             │
   │                             └─→ POST /auth/register ─→ Create User + BASIC Sub ──→ DB
   │                                                        (Auto-assign BASIC plan)
   │◄──────────────────────────── Success + Token ◄────────────────────────────────────
   │
View Dashboard              Dashboard Component
   │                             │
   │                             └─→ useSubscription() ─→ GET /subscriptions/status ──→ DB
   │                                  (fetch subscription)  (returns BASIC plan)
   │◄──────────────────────────── Sub Data ◄────────────────────────────────────────────
   │
Try Premium Feature         Products Component
   │                             │
   │                             └─→ GET /subscription/limits ────────────────────→ DB
   │                                  (check if limit reached)
   │
   │◄──────────────────────────── Limit Reached ◄─────────────────────────────────────
   │                             (show UpgradePrompt)
   │
Click Upgrade               UpgradePrompt Component
   │                             │
   │                             └─→ Navigate to /upgrade
   │
Select Payment              Upgrade Page Component
   │                             │
   │                             ├─→ POST /api/payments ──────────────────────→ MP API
   │                             │   (Mercado Pago preference)
   │                             │
   │                             └─→ User completes payment on MP
   │                                  (payment confirmed)
   │
Webhook Received            MP Webhook Handler
   │                             │
   │                             └─→ PUT /subscriptions/status ──────────────→ DB
   │                                  (update to PROFESSIONAL)
   │
Dashboard Refreshes         Dashboard Component
   │                             │
   │                             └─→ useSubscription() ─→ GET /subscriptions/status ──→ DB
   │                                  (now shows PROFESSIONAL)
   │◄──────────────────────────── Updated Sub Data ◄──────────────────────────────────
   │
Access Premium Feature      Reports/Products Component
   │                             │
   │                             └─→ Check: hasFeature() ──→ PROFESSIONAL ✓
   │                                  (feature available)
   │◄──────────────────────────── Feature Rendered ◄──────────────────────────────────
```

---

## Component Hierarchy

```
App Root (layout.tsx)
│
├─ ThemeProvider (with mounted check)
│  │
│  ├─ ToastProvider (with mounted check)
│  │
│  └─ Child Routes
│     │
│     ├─ /auth/register
│     │  └─ Creates user + BASIC subscription
│     │
│     ├─ /dashboard
│     │  ├─ useSubscription() hook
│     │  ├─ Shows current plan
│     │  └─ Links to features
│     │
│     ├─ /upgrade
│     │  ├─ Stripe checkout button
│     │  ├─ Mercado Pago payment button
│     │  └─ Plan comparison
│     │
│     ├─ /products
│     │  ├─ useSubscription() hook
│     │  ├─ Checks maxProducts limit
│     │  ├─ Shows LimitReachedPrompt on limit
│     │  └─ Shows UpgradePrompt
│     │
│     ├─ /clients
│     │  ├─ useSubscription() hook
│     │  ├─ Checks maxClients limit (BASIC=0)
│     │  ├─ Shows LimitReachedPrompt on limit
│     │  └─ Shows UpgradePrompt
│     │
│     ├─ /suppliers
│     │  ├─ useSubscription() hook
│     │  ├─ Checks maxSuppliers limit
│     │  └─ Shows UpgradePrompt
│     │
│     └─ /reports
│        ├─ useSubscription() hook
│        ├─ Premium tabs locked
│        ├─ Shows UpgradePrompt on click
│        └─ Checks advancedReporting feature
│
└─ Header Component
   ├─ Shows user info
   ├─ Shows current plan badge
   └─ Logout button
```

---

## Plan Feature Matrix

```
FEATURE                    │  BASIC  │ PROFESSIONAL │ ENTERPRISE
──────────────────────────┼─────────┼──────────────┼───────────
Max Products              │   500   │     5,000    │ Unlimited
Max Users                 │    2    │       5      │ Unlimited
Max Categories            │   50    │      200     │ Unlimited
Max Clients               │    0    │      100     │ Unlimited
Max Suppliers             │   10    │      100     │ Unlimited
───────────────────────────┼─────────┼──────────────┼───────────
ARCA Integration          │   ✗     │       ✓      │     ✓
Advanced Reporting        │   ✗     │       ✓      │     ✓
Custom Branding           │   ✗     │       ✗      │     ✓
Invoice Channels          │    1    │       2      │     2
───────────────────────────┼─────────┼──────────────┼───────────
Price/Month               │ FREE    │   AR$24,990  │ Custom
Billing Cycle             │ N/A     │    Monthly   │ Custom
```

---

## State Management Flow

```
useSubscription Hook
├─ State:
│  ├─ subscription: SubscriptionData | null
│  ├─ loading: boolean
│  └─ error: string | null
│
├─ useEffect (on mount):
│  └─ Fetch /api/subscriptions/status
│
└─ Return: { subscription, loading, error }
   │
   └─ Used by:
      ├─ Dashboard
      ├─ Products
      ├─ Clients
      ├─ Suppliers
      ├─ Reports
      └─ Any feature-gated component
```

---

## Error Handling Flow

```
API Call
├─ No Token
│  └─ Redirect to /auth/login
│
├─ Invalid Token
│  └─ Clear localStorage, redirect to login
│
├─ Network Error
│  └─ Show toast error, fallback to BASIC plan
│
├─ Webhook Signature Invalid
│  └─ Log error, don't update subscription
│
├─ Payment Failed
│  └─ Set subscription status to "past_due"
│
├─ Limit Reached
│  └─ Show LimitReachedPrompt
│
└─ Feature Not Available
   └─ Show UpgradePrompt
```

---

## Integration Points

```
PAYMENT PROVIDERS              OUR SYSTEM              DATABASE
        │                            │                    │
Stripe  │  checkout.session.       │                    │
        │  completed               │ Webhook Handler    │
        ├─────────────────────────→├───────────────────→├─ Update planId
        │                          │                    │
        │  customer.subscription.  │                    │
        │  updated                 │ Webhook Handler    │
        ├─────────────────────────→├───────────────────→├─ Update features
        │                          │                    │
        │  invoice.payment_        │                    │
        │  succeeded               │ Webhook Handler    │
        ├─────────────────────────→├───────────────────→├─ Reset failedPayments
        │                          │                    │
        │                          │                    │
Mercado │  payment.created         │                    │
Pago    │  payment.updated         │ Webhook Handler    │
        ├─────────────────────────→├───────────────────→├─ Update planId
        │                          │                    │
        │  subscription.updated    │ Webhook Handler    │
        ├─────────────────────────→├───────────────────→├─ Update features
        │                          │                    │
```

---

## Security Layers

```
Request
  │
  ├─ Layer 1: HTTPS Transport
  │  └─ All communication encrypted
  │
  ├─ Layer 2: Token Verification
  │  └─ JWT token validated on every API call
  │
  ├─ Layer 3: Webhook Signature
  │  └─ Stripe: HMAC-SHA256 verification
  │  └─ Mercado Pago: Signature verification
  │
  ├─ Layer 4: Database Query
  │  ├─ businessId check (no cross-account access)
  │  └─ Rate limiting on sensitive endpoints
  │
  └─ Layer 5: PCI Compliance
     └─ Card data handled by payment providers only
```

---

## Monitoring Points

```
1. Webhook Delivery
   └─ Check payment provider dashboards for webhook status

2. Subscription Updates
   └─ Monitor: GET /api/subscriptions/status response times

3. Payment Processing
   └─ Track: Stripe/Mercado Pago success rates

4. Feature Enforcement
   └─ Audit: Plan limits being enforced

5. Error Rates
   └─ Alert on: Failed webhook deliveries

6. Performance
   └─ Track: API response times < 100ms
```

---

This complete system ensures:
✅ **Reliability**: Subscription always reflects payment state
✅ **Security**: Multiple layers of verification
✅ **Performance**: Cached subscription data
✅ **User Experience**: Smooth upgrade flow
✅ **Scalability**: Webhook-based updates
✅ **Monitoring**: Multiple tracking points
