# Quick Start: Testing Premium Features

## 🎯 5-Minute Quick Start

### 1. Setup (if not already done)

```bash
# Make sure MongoDB is connected
# Check .env.local has STRIPE and MERCADO_PAGO keys

npm run dev
# App runs at http://localhost:3000
```

### 2. Test BASIC User Flow

```bash
1. Open http://localhost:3000
2. Register with email & password
3. You're auto-assigned BASIC plan
4. Go to Dashboard - see "Actualizar a Pro" button
```

### 3. Test Feature Limits (BASIC)

```bash
1. Go to Products
2. Try to add 501+ products
3. You'll see "Límite de Plan Alcanzado" popup
4. Click "Upgrade" button - goes to /upgrade
```

### 4. Test Premium Access (PROFESSIONAL)

```bash
# Manually set in Database (for quick testing):
# 1. In MongoDB, find user's Subscription
# 2. Change planId from "BASIC" to "PROFESSIONAL"
# 3. Refresh page

# OR follow payment flow below
```

### 5. Test Payment - Stripe

```bash
1. Go to /upgrade
2. Click "Pagar con Stripe"
3. Use test card: 4242 4242 4242 4242
4. Exp: Any future date (e.g., 12/25)
5. CVC: Any 3 digits
6. Complete checkout
7. Page redirects to success page
8. Dashboard now shows PROFESSIONAL plan
```

### 6. Test Payment - Mercado Pago

```bash
1. Go to /upgrade
2. Click "Pagar con Mercado Pago"
3. Sandbox credentials:
   - Email: test_user_XXX@testuser.com
   - Password: Available in Mercado Pago Dashboard
4. Complete payment
5. Subscription updates via webhook
```

### 7. Test Premium Features (After Upgrade)

```bash
1. Go to Reports
2. Click "Por Categorías" tab - NOW ENABLED
3. Click "Rentabilidad" tab - NOW ENABLED
4. Click "Productos" tab - NOW ENABLED
5. Add 100+ clients - NOW ALLOWED
6. All premium features working!
```

---

## 🔍 Quick Debug Checks

### Check What Plan User Has

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/subscriptions/status | jq

# Output shows: planId, status, features
```

### Check Usage vs Limits

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/subscription/limits | jq

# Output shows: products (current/max), clients, features enabled
```

### Check if Webhook Worked

```bash
# 1. Check app console for webhook logs
# 2. In Stripe Dashboard:
#    - Go to Webhooks
#    - Find your endpoint
#    - Check Event Attempts
#    - Should show recent events with 200 status
```

---

## 📱 Common Test Scenarios

### Scenario 1: Free User Hits Product Limit

```
1. On BASIC plan
2. Add 500 products (just under limit)
3. Try to add 501st product
4. See: "Límite de productos alcanzado (500)"
5. See LimitReachedPrompt modal
6. Click "Upgrade" → goes to /upgrade
```

### Scenario 2: User Can't Create Clients on BASIC

```
1. On BASIC plan (maxClients = 0)
2. Go to Clients
3. Try to add a client
4. See: "Clientes no permitidos en tu plan"
5. See UpgradePrompt
```

### Scenario 3: Premium Reports Access

```
1. On BASIC plan
2. Go to Reports
3. Try to click "Por Categorías"
4. Tab is disabled with "Premium" badge
5. See: "Función Premium"
6. Click upgrade
7. After payment, all tabs enabled
```

### Scenario 4: Multi-Tab Payment

```
1. Open /upgrade in Tab 1
2. Start payment but don't complete
3. In Tab 2, navigate around app
4. Return to Tab 1, complete payment
5. Webhook processes and updates both tabs
6. Both tabs show updated plan
```

---

## 🧪 Automated Test Data

### Create Test User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "fullName": "Test User",
    "businessName": "Test Business"
  }'

# Response includes: accessToken, refreshToken
```

### Verify Subscription Created

```bash
# Get the token from above response
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/subscriptions/status | jq

# Should show: planId="BASIC", status="active"
```

---

## 🐛 Debugging Common Issues

### Issue: Webhook Not Firing

**Check:**

1. Is webhook secret in `.env.local`?
2. Is webhook registered in Stripe/Mercado Pago dashboard?
3. Do logs show webhook was received?
4. Is subscription being created in MongoDB?

**Fix:**

```bash
# Re-register webhook in Stripe:
# 1. Go to https://dashboard.stripe.com/webhooks
# 2. Add endpoint: YOUR_DOMAIN/api/stripe/webhook
# 3. Select events: checkout.session.completed, customer.subscription.*
# 4. Update .env.local with webhook secret
```

### Issue: Subscription Not Updating

**Check:**

1. Run: GET /api/subscriptions/status
2. Is planId still "BASIC"?
3. Check payment provider webhook logs
4. Check app server logs for webhook errors

**Fix:**

```bash
# Manually test webhook:
curl -X PUT http://localhost:3000/api/subscriptions/status \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "USER_BUSINESS_ID",
    "planId": "PROFESSIONAL"
  }'
```

### Issue: Features Not Appearing

**Check:**

1. Is planId actually "PROFESSIONAL"?
2. Are features in subscription.features object?
3. Is component checking hasFeature() correctly?
4. Clear browser cache/localStorage

**Fix:**

```bash
# In browser console:
localStorage.clear()
location.reload()

# Then check: /api/subscription/limits
```

---

## 📊 What to Monitor During Testing

1. **Subscription Status**: Should change from BASIC → PROFESSIONAL
2. **Plan Features**: Should update from false → true
3. **API Response**: Should include all plan features
4. **Dashboard**: Should show new plan name
5. **Feature Access**: Should enable/disable correctly

---

## 🎉 Success Indicators

✅ **Workflow is Complete When:**

1. New users get BASIC plan automatically
2. BASIC users can't exceed product limit
3. BASIC users see upgrade prompts
4. Payment completes successfully
5. Subscription updates via webhook
6. Dashboard shows new plan
7. Premium features become available
8. Premium users can exceed limits
9. All premium reports accessible
10. User can cancel/update subscription

---

## 🚀 Going Live Checklist

Before deploying to production:

- [ ] Stripe Live Keys configured
- [ ] Mercado Pago Live Keys configured
- [ ] Webhook endpoints registered in LIVE mode
- [ ] Database backups enabled
- [ ] Error monitoring (Sentry) setup
- [ ] Email notifications for subscription changes
- [ ] Terms of Service & Privacy Policy added
- [ ] Billing support email setup
- [ ] Test payment with real card (small amount)
- [ ] Cancel/refund test
- [ ] Monitor webhook delivery in production

---

**Need Help?**

- Check logs: `tail -f .next/server/logs`
- Check MongoDB: Connect to Atlas and check Subscription collection
- Check Stripe: https://dashboard.stripe.com/events
- Check Mercado Pago: Check webhook delivery status in settings
