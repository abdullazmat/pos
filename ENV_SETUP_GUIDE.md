# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following:

### Languages (Optional - Auto-Detected)

```env
# No configuration needed for i18n
# System auto-detects browser language and saves preference
```

### Mercado Pago Integration

```env
# Get your access token from: https://www.mercadopago.com.ar/developers
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxxxxxxxxxx

# Your application URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://your-domain.com
```

### AFIP/ARCA Integration (For Production)

```env
# Environment: 'testing' or 'production'
AFIP_ENVIRONMENT=testing

# Your company CUIT (Código Único de Identificación Tributaria)
AFIP_CUIT=20123456789

# Path to AFIP digital certificate (PEM format)
AFIP_CERT_PATH=/path/to/afip_certificate.pem

# Path to AFIP private key (PEM format)
AFIP_KEY_PATH=/path/to/afip_private_key.pem

# Your company name as registered with AFIP
AFIP_COMPANY_NAME=Your Business Name Here

# Tax category: Monotributo, ResponsableInscripto, etc.
AFIP_INCOME_TAX_CATEGORY=Monotributo
```

## Mercado Pago Setup

### For Development/Testing:

1. Go to [Mercado Pago Developer Dashboard](https://www.mercadopago.com.ar/developers)
2. Create a seller account if you don't have one
3. Go to Settings > Credentials
4. Copy the **Access Token** from the Test environment
5. Add to `.env.local`:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR_test_token_here
   ```

### For Production:

1. After testing, go to Settings > Credentials
2. Copy the **Access Token** from the Production environment
3. Update `.env.local`:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR_production_token_here
   ```

### Testing Mercado Pago in Development:

- The webhook will automatically use the `NEXT_PUBLIC_APP_URL`
- For local testing, you may need to use a tunnel service like ngrok:
  ```bash
  ngrok http 3000
  ```
- Then update your Mercado Pago webhook URL to: `https://your-ngrok-url.ngrok.io/api/payment/mercadopago/webhook`

## AFIP/ARCA Setup

### Step 1: Get Your CUIT

1. Go to [AFIP.gob.ar](https://www.afip.gov.ar)
2. Register as Monotributista or Responsable Inscripto
3. You'll receive a CUIT number (format: XX-XXXXXXXX-X)
4. Add to `.env.local`: `AFIP_CUIT=20123456789`

### Step 2: Get Digital Certificate

1. Log into your AFIP account
2. Go to My Data > Digital Certificates
3. Download the certificate in PEM format
4. Store in a secure location (e.g., `/certs/afip_certificate.pem`)
5. Download the private key separately
6. Update `.env.local`:
   ```env
   AFIP_CERT_PATH=/absolute/path/to/afip_certificate.pem
   AFIP_KEY_PATH=/absolute/path/to/afip_private_key.pem
   ```

### Step 3: Test Environment

- Start with `AFIP_ENVIRONMENT=testing`
- Use AFIP's test servers to verify integration
- No real invoices are generated in test mode
- Test CUIT validation with: `20-12345678-9`

### Step 4: Production Deployment

- When ready, change to `AFIP_ENVIRONMENT=production`
- Ensure all certificates are installed and valid
- Update to your real CUIT
- Test thoroughly before going live

## Complete `.env.local` Example

```env
# ===== Database (if using MongoDB) =====
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/pos-saas

# ===== Authentication =====
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# ===== Application URL =====
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===== Stripe (if still using) =====
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx

# ===== Mercado Pago =====
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_test_xxxxxxxxxxxxxxxxxx

# ===== AFIP/ARCA (for production) =====
AFIP_ENVIRONMENT=testing
AFIP_CUIT=20123456789
AFIP_CERT_PATH=/absolute/path/to/certificate.pem
AFIP_KEY_PATH=/absolute/path/to/private_key.pem
AFIP_COMPANY_NAME=Your Business Name
AFIP_INCOME_TAX_CATEGORY=Monotributo

# ===== Vercel (if deploying) =====
VERCEL_URL=your-app.vercel.app
```

## Vercel Deployment

When deploying to Vercel:

1. Go to Project Settings > Environment Variables
2. Add all variables from above
3. For certificates, you have two options:

**Option A: Store certificate paths (recommended for security)**

- Use Vercel's file system and load from environment
- Store base64 encoded certificates

**Option B: Use Vercel's Secret Storage**

- Paste certificate content as environment variables
- Access within the application

Example for base64 approach:

```bash
# Local development
export AFIP_CERT_BASE64=$(cat certificate.pem | base64)

# Then in code:
const cert = Buffer.from(process.env.AFIP_CERT_BASE64, 'base64').toString();
```

## Validation Checklist

- ✅ `.env.local` file created
- ✅ `MERCADO_PAGO_ACCESS_TOKEN` added and valid
- ✅ `NEXT_PUBLIC_APP_URL` set correctly
- ✅ AFIP certificates (if using) paths verified
- ✅ AFIP_CUIT in correct format (XX-XXXXXXXX-X)
- ✅ Test payment flow with Mercado Pago
- ✅ Validate CUIT with AFIP test environment
- ✅ Check error messages display in selected language

## Troubleshooting

### "MERCADO_PAGO_ACCESS_TOKEN is not defined"

- Verify token is in `.env.local`
- Restart dev server: `npm run dev`
- Check for typos in variable name

### "Invalid AFIP Certificate"

- Verify file path exists and is readable
- Ensure certificate is in PEM format
- Check certificate hasn't expired
- Verify file permissions (readable by app)

### Webhook Not Receiving Payments

- Verify `NEXT_PUBLIC_APP_URL` is accessible
- Check webhook URL in Mercado Pago dashboard
- Use ngrok for local testing
- Check server logs for webhook errors

### CUIT Validation Fails

- Verify CUIT format: XX-XXXXXXXX-X
- Check that CUIT is registered with AFIP
- Ensure no extra spaces or characters

---

**Environment setup complete! Your system is ready for testing.** ✅
