# 🧪 Complete Testing Checklist - Premium Features

## Pre-Testing Setup

- [ ] Stripe test keys configured in `.env.local`
- [ ] Mercado Pago test keys configured in `.env.local`
- [ ] MongoDB connected and tested
- [ ] Webhook endpoints registered
  - [ ] Stripe: `https://your-domain/api/stripe/webhook`
  - [ ] Mercado Pago: `https://your-domain/api/webhooks/mercado-pago`
- [ ] All dependencies installed: `npm install`
- [ ] Dev server running: `npm run dev`
- [ ] Browser console open for error checking

---

## Phase 1: User Registration & BASIC Plan

### Test 1.1: New User Registration

```
[ ] Go to http://localhost:3000
[ ] Click "Register"
[ ] Fill form:
    - Email: test1@example.com
    - Password: TestPass123!
    - Full Name: Test User One
    - Business Name: Test Business
[ ] Submit registration
[ ] Verify: Auto-login and redirect to dashboard
[ ] Check MongoDB: Subscription created with planId: "BASIC"
```

### Test 1.2: Dashboard Display

```
[ ] On dashboard, verify:
    - [x] Current plan shows "Plan Básico"
    - [x] "Actualizar a Pro" button visible
    - [x] Plan features displayed correctly
    - [x] No hydration errors in console
```

### Test 1.3: BASIC Plan Limits

```
[ ] Go to Products
[ ] Try to add multiple products (up to 500+)
[ ] At 500 products:
    - [x] Can still add one more
    - [x] Add button still active
[ ] At 501+ products:
    - [x] LimitReachedPrompt appears
    - [x] Shows limit details (501/500)
    - [x] "Upgrade" button available
    - [x] Clicking upgrade goes to /upgrade page
```

### Test 1.4: Client Limit (BASIC = 0)

```
[ ] Go to Clients
[ ] Try to add a client
[ ] Verify:
    - [x] Cannot add any clients (BASIC limit = 0)
    - [x] UpgradePrompt shows
    - [x] Message: "Clientes no permitidos en tu plan"
    - [x] Upgrade button visible
```

### Test 1.5: Supplier Limits

```
[ ] Go to Suppliers
[ ] Add 10 suppliers successfully
[ ] Try to add 11th supplier
[ ] Verify:
    - [x] LimitReachedPrompt appears
    - [x] Shows "10/10" usage
    - [x] Cannot proceed without upgrade
```

---

## Phase 2: Premium Features Access (BASIC)

### Test 2.1: Reports Premium Tabs

```
[ ] Go to Reports
[ ] Verify tabs:
    - [x] "Resumen General" - ENABLED
    - [x] "Por Categorías" - DISABLED with "Premium" badge
    - [x] "Rentabilidad" - DISABLED with "Premium" badge
    - [x] "Productos" - DISABLED with "Premium" badge
[ ] Click locked tab
[ ] Verify:
    - [x] Tab doesn't switch
    - [x] "Función Premium" message shows
    - [x] Shows upgrade button
```

### Test 2.2: Advanced Features Locked

```
[ ] Go to Invoicing
[ ] Verify:
    - [x] ARCA integration button disabled/hidden
    - [x] Message: "Requires Professional plan"
    - [x] Shows upgrade prompt on hover/click
```

---

## Phase 3: Stripe Payment Flow

### Test 3.1: Initiate Stripe Payment

```
[ ] On dashboard, click "Actualizar a Pro"
[ ] Go to /upgrade page
[ ] Verify upgrade page:
    - [x] Plan comparison visible
    - [x] Free vs Pro comparison shown
    - [x] "Pagar con Stripe" button present
    - [x] "Pagar con Mercado Pago" button present
```

### Test 3.2: Stripe Checkout

```
[ ] Click "Pagar con Stripe" button
[ ] Verify:
    - [x] Loading indicator shows
    - [x] Page redirects to Stripe Checkout
    - [x] Checkout displays correctly
    - [x] User email pre-filled
```

### Test 3.3: Complete Stripe Payment

```
[ ] In Stripe checkout, enter test card:
    - Card: 4242 4242 4242 4242
    - Exp: 12/25
    - CVC: 123
[ ] Fill billing details
[ ] Complete checkout
[ ] Verify:
    - [x] Payment processed
    - [x] Redirected to success page
    - [x] Success message shown
```

### Test 3.4: Webhook Processing

```
[ ] Check app console for webhook logs
[ ] Verify logs show:
    - [x] Webhook received
    - [x] Signature verified
    - [x] Subscription updated
    - [x] No errors
[ ] In MongoDB:
    - [x] Subscription planId changed to "PROFESSIONAL"
    - [x] stripeSubscriptionId set
    - [x] features updated with PROFESSIONAL limits
    - [x] status set to "active"
```

### Test 3.5: Dashboard After Payment

```
[ ] Go back to dashboard (refresh if needed)
[ ] Verify:
    - [x] Plan shows "Plan Profesional"
    - [x] "Actualizar a Pro" button hidden/changed
    - [x] Next renewal date displayed
    - [x] All features unlocked
```

### Test 3.6: Access Premium Features After Upgrade

```
[ ] Go to Reports
[ ] Click "Por Categorías" tab
[ ] Verify:
    - [x] Tab is now ENABLED
    - [x] Content loads
    - [x] No upgrade prompt
[ ] Go to Clients
[ ] Add clients
[ ] Verify:
    - [x] Can now add clients (limit: 100)
    - [x] No restriction prompts
```

---

## Phase 4: Mercado Pago Payment Flow

### Test 4.1: Create New Test User

```
[ ] Register new user:
    - Email: test_mp@example.com
    - Password: TestPass123!
    - Full Name: Mercado Pago Tester
    - Business: MP Test Business
[ ] Verify: BASIC plan assigned
```

### Test 4.2: Initiate Mercado Pago Payment

```
[ ] Click "Actualizar a Pro"
[ ] Go to /upgrade page
[ ] Click "Pagar con Mercado Pago"
[ ] Verify:
    - [x] Loading indicator shows
    - [x] No errors in console
    - [x] Payment preference created (check logs)
```

### Test 4.3: Mercado Pago Sandbox Payment

```
[ ] Payment preference opens in new tab
[ ] Login with test account:
    - Email: test_user_XXX@testuser.com
    - Password: (from Mercado Pago dashboard)
[ ] Select payment method (test)
[ ] Complete payment
[ ] Verify:
    - [x] Payment processed
    - [x] Confirmation shown
```

### Test 4.4: Webhook Processing (Mercado Pago)

```
[ ] Wait 10-30 seconds for webhook
[ ] Check app console for webhook logs
[ ] Verify logs show:
    - [x] Webhook received from Mercado Pago
    - [x] Payment status processed
    - [x] Subscription updated
    - [x] No errors
[ ] In MongoDB:
    - [x] Subscription planId: "PROFESSIONAL"
    - [x] provider: "mercado_pago"
    - [x] features updated
    - [x] status: "active"
```

### Test 4.5: Dashboard After MP Payment

```
[ ] Go back to dashboard (might need refresh)
[ ] Verify:
    - [x] Plan shows "Plan Profesional"
    - [x] Features unlocked
    - [x] Can add clients, more suppliers, etc.
```

---

## Phase 5: Feature Limit Enforcement (PROFESSIONAL)

### Test 5.1: Product Limit (5000)

```
[ ] On PROFESSIONAL plan
[ ] Add products until 5000
[ ] Try to add 5001st product
[ ] Verify:
    - [x] LimitReachedPrompt shows
    - [x] Shows 5001/5000
    - [x] Cannot add without downgrading
```

### Test 5.2: Client Limit (100)

```
[ ] Add clients up to 100
[ ] Try to add 101st client
[ ] Verify:
    - [x] LimitReachedPrompt shows
    - [x] Shows 101/100
```

### Test 5.3: Advanced Reporting

```
[ ] Go to Reports
[ ] All tabs now ENABLED:
    - [x] Resumen General ✓
    - [x] Por Categorías ✓
    - [x] Rentabilidad ✓
    - [x] Productos ✓
[ ] Click each tab
[ ] Verify:
    - [x] Content loads correctly
    - [x] No upgrade prompts
```

### Test 5.4: ARCA Integration

```
[ ] Go to Invoicing settings
[ ] Verify:
    - [x] ARCA integration available
    - [x] Not greyed out
    - [x] Can configure
```

---

## Phase 6: Error Handling & Edge Cases

### Test 6.1: Failed Payment

```
[ ] New user, attempt payment with invalid card:
    - Card: 4000 0000 0000 0002 (declined)
[ ] Verify:
    - [x] Payment rejected
    - [x] Error message shown
    - [x] Subscription NOT updated
    - [x] User still on BASIC plan
```

### Test 6.2: Network Error During Payment

```
[ ] Simulate network issue (DevTools → Offline)
[ ] Try to complete payment
[ ] Verify:
    - [x] Error handled gracefully
    - [x] No console crashes
    - [x] Can retry after connection restored
```

### Test 6.3: Webhook Retry

```
[ ] In Stripe dashboard:
    - Go to Events
    - Find checkout.session.completed
    - Click "Resend"
[ ] Verify:
    - [x] Subscription re-updated without errors
    - [x] No duplicate entries
    - [x] Idempotent operation
```

### Test 6.4: Invalid Token

```
[ ] Open browser DevTools → Storage
[ ] Clear accessToken from localStorage
[ ] Try to access /products
[ ] Verify:
    - [x] Redirected to /auth/login
    - [x] Error message shown
```

### Test 6.5: Concurrent Requests

```
[ ] Open dashboard in two browser tabs
[ ] While one tab is loading subscription:
    - Switch to other tab
    - Navigate around
    - Refresh
[ ] Verify:
    - [x] No data corruption
    - [x] Subscription data consistent
    - [x] No race conditions
```

---

## Phase 7: Cross-Browser & Mobile

### Test 7.1: Chrome Desktop

```
[ ] Register user → BASIC plan
[ ] Complete payment → PROFESSIONAL
[ ] Verify all features work
```

### Test 7.2: Firefox Desktop

```
[ ] Repeat registration & payment flow
[ ] Check for browser-specific issues
```

### Test 7.3: Safari Desktop

```
[ ] Repeat registration & payment flow
[ ] Check localStorage access
```

### Test 7.4: Mobile (iPhone)

```
[ ] Access app on mobile
[ ] Register → Payment flow
[ ] Verify:
    - [x] Responsive layout
    - [x] Payment flows work
    - [x] All buttons clickable
```

### Test 7.5: Mobile (Android)

```
[ ] Repeat mobile tests on Android
[ ] Check touch interactions
```

---

## Phase 8: Performance & Load

### Test 8.1: Dashboard Load Time

```
[ ] Measure: GET /api/subscriptions/status response time
[ ] Should be: < 100ms
[ ] Verify: No N+1 queries
```

### Test 8.2: Payment Initiation

```
[ ] Measure: POST /api/payments response time
[ ] Should be: < 2 seconds
[ ] Verify: Mercado Pago preference created
```

### Test 8.3: Webhook Processing

```
[ ] Measure: Webhook handler execution
[ ] Should be: < 500ms
[ ] Verify: Database updated correctly
```

---

## Phase 9: Database Verification

### Test 9.1: User Collection

```
MongoDB → pos-saas database → users collection
[ ] Find test user: test1@example.com
[ ] Verify:
    - [x] businessId present
    - [x] createdAt timestamp
    - [x] isActive: true
```

### Test 9.2: Subscription Collection

```
MongoDB → pos-saas database → subscriptions collection
[ ] Find subscription: businessId matches user
[ ] Verify:
    - [x] planId: "PROFESSIONAL"
    - [x] status: "active"
    - [x] features populated correctly
    - [x] stripeSubscriptionId or mercadoPagoCustomerId set
    - [x] currentPeriodStart and currentPeriodEnd dates correct
    - [x] autoRenew: true
```

### Test 9.3: Payment Records

```
MongoDB → pos-saas database → payments collection
[ ] Find payment record
[ ] Verify:
    - [x] preferenceId or stripeId recorded
    - [x] status: "COMPLETED"
    - [x] amount correct
    - [x] timestamps accurate
```

---

## Phase 10: Webhook Verification

### Test 10.1: Stripe Webhook Status

```
[ ] Go to https://dashboard.stripe.com/webhooks
[ ] Find endpoint: .../api/stripe/webhook
[ ] Verify:
    - [x] Status: Active
    - [x] Recent events show successful deliveries (200)
    - [x] No failed attempts
    - [x] Event types subscribed:
        ✓ checkout.session.completed
        ✓ customer.subscription.created
        ✓ customer.subscription.updated
        ✓ customer.subscription.deleted
        ✓ invoice.payment_failed
        ✓ invoice.payment_succeeded
```

### Test 10.2: Mercado Pago Webhook Status

```
[ ] Go to Mercado Pago Dashboard → Settings → Webhooks
[ ] Verify:
    - [x] Endpoint registered: .../api/webhooks/mercado-pago
    - [x] Recent deliveries show successful (200)
    - [x] No failed attempts
```

---

## Final Verification Checklist

### Security

- [ ] JWT token required on all endpoints
- [ ] Webhook signatures verified
- [ ] No card data stored locally
- [ ] businessId check prevents cross-account access
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production

### Functionality

- [ ] New users get BASIC plan
- [ ] Upgrade to PROFESSIONAL works (Stripe)
- [ ] Upgrade to PROFESSIONAL works (Mercado Pago)
- [ ] Plan limits enforced
- [ ] Premium features locked for BASIC
- [ ] Premium features available for PROFESSIONAL
- [ ] Webhooks update subscriptions correctly

### User Experience

- [ ] Clear plan comparison
- [ ] Easy upgrade path
- [ ] Helpful error messages
- [ ] Upgrade prompts when needed
- [ ] No hydration errors
- [ ] Mobile responsive
- [ ] Fast loading times

### Monitoring

- [ ] Can check subscription status
- [ ] Can check usage vs limits
- [ ] Webhook delivery visible
- [ ] Payment status trackable
- [ ] Errors logged properly

---

## Sign-Off

- [ ] All tests passed
- [ ] No critical issues found
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for production deployment
- [ ] Documentation complete
- [ ] Team trained on system

**Tested by**: ********\_\_\_********
**Date**: ********\_\_\_********
**Status**: ✅ APPROVED / ❌ NEEDS FIXES

---

**Notes**:

```
_________________________________________________________________________

_________________________________________________________________________

_________________________________________________________________________
```
