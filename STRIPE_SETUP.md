# Stripe Integration Setup Guide

## Features Implemented

✅ **Paid Plan Signup with Stripe**

- Users selecting "Paid Plan" during registration are redirected to Stripe Checkout
- Payment verification before account creation
- Automatic subscription management

✅ **Upgrade Page for Free Users**

- `/upgrade` route for free plan users to upgrade to Pro
- Beautiful comparison UI showing Free vs Pro features
- Secure Stripe checkout integration

✅ **Subscription Management**

- Webhook handling for subscription events
- Automatic subscription status updates
- Support for subscription cancellation and renewal

## Setup Instructions

### 1. Stripe Account Setup

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your API keys from the Stripe Dashboard
3. For testing, use **Test Mode** keys (they start with `sk_test_` and `pk_test_`)

### 2. Environment Variables

Update your `.env.local` file with your Stripe keys:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLIC_KEY=pk_test_your_actual_public_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL (use your actual domain in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your `.env.local`

For local testing, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 4. Test the Integration

#### Test Paid Plan Signup:

1. Go to `/auth/register`
2. Select "Paid Plan"
3. Fill in registration details
4. Click "Create Account"
5. You'll be redirected to Stripe Checkout
6. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
7. Complete payment
8. You'll be redirected to the dashboard with Pro plan active

#### Test Upgrade Flow:

1. Register with Free Plan
2. Login to dashboard
3. Click "Upgrade to Pro" button
4. Complete Stripe checkout
5. Subscription will be updated

### 5. Stripe Test Cards

For testing payments, use these cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Authentication Required**: `4000 0025 0000 3155`

Use any future expiration date and any 3-digit CVC.

## API Routes Created

### Payment Routes

- `POST /api/stripe/create-checkout-signup` - Create checkout for new signups
- `POST /api/stripe/create-checkout` - Create checkout for upgrades
- `GET /api/stripe/signup-success` - Handle successful signup payment
- `POST /api/stripe/webhook` - Handle Stripe webhook events

### Subscription Routes

- `GET /api/subscription` - Get user's subscription info

## Pages Created

- `/upgrade` - Upgrade page for free users to purchase Pro plan
- Updated `/auth/register` - Handles both free and paid signups

## Security Features

✅ Paid plan signup requires Stripe payment verification
✅ Direct API calls for paid plans are blocked
✅ Webhook signature verification
✅ Secure token-based authentication

## Pricing

**Free Plan**: $0/month

- Up to 100 products
- Basic features
- 1 user account

**Pro Plan**: $29/month

- Unlimited products
- All advanced features
- Unlimited users
- Priority support

## Next Steps

1. Set up your Stripe account
2. Configure environment variables
3. Test with Stripe test mode
4. Set up webhooks for production
5. Update pricing as needed in the code

## Support

If you encounter issues:

1. Check Stripe Dashboard logs
2. Check webhook event history
3. Verify environment variables are set correctly
4. Check server logs for errors
