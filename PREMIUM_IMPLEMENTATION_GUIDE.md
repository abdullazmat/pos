# Premium Features Implementation Guide

## Overview

The POS SAAS application now has a complete premium tier system with three subscription plans:

1. **BASIC** (Free) - Default plan for all users
2. **PROFESSIONAL** - Premium tier with advanced features
3. **ENTERPRISE** - Custom pricing for large organizations

## Premium Workflow

### 1. User Registration

- New users automatically get a **BASIC** plan
- No payment required to start
- Default plan features are active immediately

### 2. Upgrade to Premium

Users can upgrade from `/upgrade` page using two payment methods:

#### Stripe Payment

- Click "Pagar con Stripe"
- Redirects to Stripe checkout
- Subscription created on webhook confirmation

#### Mercado Pago

- Click "Pagar con Mercado Pago"
- Opens Mercado Pago preference
- Payment confirmed via webhook

### 3. Payment Webhook Processing

#### Stripe Webhook (`/api/stripe/webhook`)

- `checkout.session.completed` → Creates/Updates subscription
- `customer.subscription.created/updated` → Updates plan features
- `customer.subscription.deleted` → Cancels subscription
- `invoice.payment_failed` → Sets status to `past_due`
- `invoice.payment_succeeded` → Resets failed payments counter

#### Mercado Pago Webhook (`/api/webhooks/mercado-pago`)

- Processes payment notifications
- Updates subscription status
- Updates plan features

### 4. Subscription Status Management

#### API Endpoints

**GET `/api/subscriptions/status`**

- Returns current subscription for authenticated user
- Includes plan ID, status, and features

**PUT `/api/subscriptions/status`**

- Updates subscription (used by webhooks)
- Accepts: businessId, planId, status, features

**GET `/api/subscription/limits`**

- Returns current usage vs limits
- Useful for enforcing plan limits in UI

### 5. Feature Enforcement

#### Plan Features Configuration

Located in: `/lib/services/subscriptions/PlanConfig.ts`

```typescript
BASIC: {
  maxProducts: 500,
  maxUsers: 2,
  maxCategories: 50,
  maxClients: 0,
  maxSuppliers: 10,
  arcaIntegration: false,
  advancedReporting: false,
  customBranding: false,
}

PROFESSIONAL: {
  maxProducts: 5000,
  maxUsers: 5,
  maxCategories: 200,
  maxClients: 100,
  maxSuppliers: 100,
  arcaIntegration: true,
  advancedReporting: true,
  customBranding: false,
}
```

#### Usage in Components

**Check Subscription**

```typescript
import { useSubscription } from "@/lib/hooks/useSubscription";

function MyComponent() {
  const { subscription, loading } = useSubscription();

  if (subscription?.isPremium) {
    // Show premium features
  }
}
```

**Check Plan Features**

```typescript
import { hasFeature, isLimitReached } from "@/lib/utils/planFeatures";

const canUseAdvancedReports = hasFeature(
  subscription.planId,
  "advancedReporting",
);

const productsLimitReached = isLimitReached(
  subscription.planId,
  "maxProducts",
  currentProductCount,
);
```

**Show Upgrade Prompt**

```typescript
import { UpgradePrompt } from "@/components/common/UpgradePrompt";

function RestrictedFeature() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <button onClick={() => setShowUpgrade(true)}>
        Use Premium Feature
      </button>

      {showUpgrade && (
        <UpgradePrompt
          featureName="Advanced Reports"
          reason="This feature requires a Premium plan"
          onDismiss={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
```

## Implementation Checklist

### Dashboard

- ✅ Shows current plan name
- ✅ Shows subscription status
- ✅ Shows next renewal date
- ✅ Upgrade button for non-premium users

### Reports

- ⚠️ Advanced reports disabled for BASIC plan
- ⚠️ Premium badge shown on locked tabs
- TODO: Add UpgradePrompt when clicking locked tabs

### Products

- ✅ Enforces maxProducts limit per plan
- ✅ Shows LimitReachedPrompt when at limit
- ✅ Shows UpgradePrompt on click

### Clients

- ✅ Enforces maxClients limit (BASIC has 0)
- ✅ Shows upgrade prompt for BASIC users
- ✅ Unlimited for PROFESSIONAL

### Suppliers

- ✅ Enforces maxSuppliers limit per plan
- ✅ Shows upgrade prompts

### Invoicing

- TODO: Enforce invoiceChannels limit
- TODO: Show ARCA integration only for PROFESSIONAL+

## Testing Premium Workflow

### 1. Register New User

```bash
- Go to /auth/register
- Create account
- Auto-assigned BASIC plan
```

### 2. Test Plan Limits

```bash
- Go to /products
- Add 500+ products on BASIC (should hit limit)
- See UpgradePrompt when limit reached
```

### 3. Test Payment (Stripe)

```bash
- Go to /upgrade
- Click "Pagar con Stripe"
- Use test card: 4242 4242 4242 4242
- Complete checkout
- Webhook confirms subscription
- Dashboard shows PROFESSIONAL plan
```

### 4. Test Payment (Mercado Pago)

```bash
- Go to /upgrade
- Click "Pagar con Mercado Pago"
- Use sandbox credentials
- Complete payment
- Webhook confirms subscription
```

### 5. Test Feature Access

```bash
- On PROFESSIONAL plan
- Visit /reports
- Access all report types
- Switch to BASIC plan (via DB)
- Premium tabs disabled
- Advanced features show UpgradePrompt
```

## Environment Variables Required

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=...
MERCADO_PAGO_PUBLIC_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
JWT_SECRET=...
JWT_REFRESH_SECRET=...
```

## Common Issues & Solutions

### Issue: Subscription not updating after payment

**Solution:**

1. Check webhook secret is correct
2. Verify webhook endpoint is registered in payment provider
3. Check logs for webhook errors

### Issue: Features not enforcing limits

**Solution:**

1. Verify subscription is fetched correctly
2. Check plan configuration matches feature requirements
3. Call `/api/subscription/limits` to debug current state

### Issue: UpgradePrompt not showing

**Solution:**

1. Verify subscription hook returns data
2. Check component imports UpgradePrompt correctly
3. Ensure showUpgrade state is toggled

## Adding New Premium Features

1. Add to `PlanConfig.ts`:

```typescript
PROFESSIONAL: {
  // ... existing features
  myNewFeature: true,
}
BASIC: {
  // ... existing features
  myNewFeature: false,
}
```

2. Check in component:

```typescript
if (hasFeature(plan, "myNewFeature")) {
  // Show feature
}
```

3. Show upgrade if not available:

```typescript
if (!hasFeature(plan, "myNewFeature")) {
  return <UpgradePrompt featureName="My New Feature" />;
}
```

## Subscription Renewal

- Stripe handles automatic renewal
- Mercado Pago requires manual setup or webhooks
- Failed payments set status to `past_due`
- Manual renewals possible via `/api/subscriptions/status` PUT endpoint

## Support & Monitoring

### Check subscription status:

```bash
GET /api/subscriptions/status
Authorization: Bearer {token}
```

### Check plan usage:

```bash
GET /api/subscription/limits
Authorization: Bearer {token}
```

### Monitor webhooks:

- Stripe: https://dashboard.stripe.com/webhooks
- Mercado Pago: Check webhook logs in dashboard
