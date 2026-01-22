# Deployment Guide

## Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:

   - MONGODB_URI
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLIC_KEY
   - STRIPE_WEBHOOK_SECRET
   - MERCADO_PAGO_ACCESS_TOKEN
   - MERCADO_PAGO_PUBLIC_KEY
   - NEXT_PUBLIC_APP_URL
   - NEXT_PUBLIC_API_URL

3. Deploy:

```bash
vercel deploy --prod
```

## Render (Full-stack: Frontend + API routes)

> This project is a Next.js 14 app with built-in API routes. You only need **one** Render Web Service.

1. **Repository**: Push this project to GitHub (do **not** commit `.env.local`).
2. **Create Render Web Service**
   - Environment: `Node`
   - Region: choose closest to users
   - Branch: `main`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Instance type: start with Free or Starter
3. **Environment Variables (Render Dashboard)**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLIC_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_PUBLIC_KEY`
   - `NEXT_PUBLIC_APP_URL` → `https://<your-render-app>.onrender.com`
   - `NEXT_PUBLIC_API_URL` → `https://<your-render-app>.onrender.com/api`
   - `NODE_ENV` → `production`
4. **Webhooks**
   - Stripe: set endpoint to `https://<your-render-app>.onrender.com/api/stripe/webhook`
   - Mercado Pago: set endpoint to `https://<your-render-app>.onrender.com/api/webhooks/mercado-pago`
5. **Health Check** (optional)
   - Path: `/` or `/api/test-db`
6. **Auto Deploy**: Enable auto-deploy on push to main.

## GitHub Setup

```bash
# Initialize Git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Full POS SAAS system"

# Add remote
git remote add origin https://github.com/your-username/pos-saas.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and update with your values:

```bash
cp .env.local.example .env.local
```

### MongoDB Atlas Setup

1. Create MongoDB Atlas cluster
2. Create database user
3. Whitelist your IP
4. Copy connection string to MONGODB_URI

### Stripe Setup

1. Create Stripe account
2. Get API keys from Stripe Dashboard
3. Add webhook endpoint for subscription updates
4. Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLIC_KEY`

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Monitoring

- Set up monitoring with Vercel Analytics
- Set up error tracking with Sentry (optional)
- Monitor MongoDB with Atlas dashboard
- Monitor Stripe transactions

## Backup & Maintenance

- Regular MongoDB backups via Atlas
- Monitor error logs
- Track API usage
- Keep dependencies updated
