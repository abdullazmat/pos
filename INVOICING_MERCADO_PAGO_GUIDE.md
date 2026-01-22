# POS System - Invoicing & Mercado Pago Integration

## Features Implemented

### 1. **Invoicing System with Dual Channels**

#### Two Invoice Channels

**ARCA Channel**

- Used for official tax declarations to ARCA (formerly AFIP)
- Requires customer CUIT and IVA type
- Stores all ARCA-required fields
- Marked as `reportedToArca = true` when submitted
- Includes ARCA status tracking (PENDING, SENT, APPROVED, REJECTED)

**INTERNAL Channel**

- For internal record-keeping only
- Does NOT export to ARCA
- No CUIT requirement
- Simpler data entry
- Marked as `reported ToArca = false`

#### Database Schema

```typescript
// Invoice Model (src/lib/models/Invoice.ts)
- invoiceNumber: string (unique per business)
- invoiceType: SALE | PURCHASE
- channel: ARCA | INTERNAL
- reportedToArca: boolean
- customerCuit: string (required for ARCA)
- ivaType: RESPONSABLE_INSCRIPTO | MONOTRIBUTISTA | NO_CATEGORIZADO
- items: Array of line items
- subtotal, taxAmount, discountAmount, totalAmount
- paymentStatus: PENDING | PARTIAL | PAID | CANCELLED
```

### 2. **Mercado Pago Integration**

#### Payment Provider Architecture

```
PaymentProvider (Interface)
  └── MercadoPagoService (Implementation)
      ├── createPaymentPreference()
      ├── getPaymentStatus()
      └── validateWebhook()
```

#### Features

- Create payment preferences with Mercado Pago API
- Generate checkout links for customers
- QR code support for mobile payments
- Webhook handling for payment notifications
- Payment status tracking (PENDING, APPROVED, REJECTED, CANCELLED)

#### Supported Payment Methods

- 💳 Credit Cards (Visa, MasterCard, American Express)
- 🏦 Debit Cards
- 📱 QR Code (Digital wallets)

### 3. **Subscription Management**

#### Plans Configuration

**BASIC Plan** ($9,990/month)

- 500 products
- 2 users
- 50 categories
- NO ARCA integration
- Invoice Channel: INTERNAL only

**PROFESSIONAL Plan** ($24,990/month)

- 5,000 products
- 5 users
- 200 categories
- 100 clients
- ✅ ARCA integration enabled
- ✅ Advanced reporting
- Invoice Channels: ARCA + INTERNAL

**ENTERPRISE Plan**

- Unlimited everything
- Custom branding
- Premium support
- Contact sales pricing

#### Subscription Model

```typescript
// Subscription (src/lib/models/Subscription.ts)
- businessId: ObjectId (unique)
- planId: BASIC | PROFESSIONAL | ENTERPRISE
- status: active | inactive | cancelled | expired
- provider: stripe | mercado_pago
- features: Object with plan-specific limits
- currentPeriodStart/End: Date
- autoRenew: boolean
```

### 4. **API Endpoints**

#### Invoicing

```
POST   /api/invoices              # Create invoice
GET    /api/invoices              # List invoices (with filters)
GET    /api/invoices/[id]         # Get invoice details
PUT    /api/invoices/[id]         # Update invoice
DELETE /api/invoices/[id]         # Delete invoice
```

Query Parameters for GET /api/invoices:

- `channel`: ARCA | INTERNAL
- `invoiceType`: SALE | PURCHASE

#### Payments

```
POST   /api/payments              # Create payment preference
GET    /api/payments              # List payments for business
POST   /api/webhooks/mercado-pago # Mercado Pago webhook handler
GET    /api/subscription/status   # Get subscription status
```

### 5. **Frontend Pages**

#### `/subscribe`

- Plan selection interface
- Plan comparison with features
- Payment method information
- Integrates with Mercado Pago checkout

#### `/payment`

- Success, failure, and pending payment status pages
- Automatic redirects from Mercado Pago
- Subscription activation on approval

#### Invoice Channel Selector (ready to integrate into POS)

- Dropdown to select ARCA vs INTERNAL
- Conditional fields based on channel
- CUIT input appears only for ARCA
- IVA type selector for ARCA

## Setup Instructions

### 1. **Environment Variables**

Create `.env.local` with:

```bash
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
MERCADO_PAGO_PUBLIC_KEY=your_public_key
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

Get Mercado Pago credentials from:
https://www.mercadopago.com/developers/panel

### 2. **Database Setup**

Models are automatically registered via Mongoose:

- Invoice
- Payment
- Subscription

Indexes are created automatically for:

- business + invoiceNumber
- business + channel
- business + date
- business + reportedToArca

### 3. **Start Development**

```bash
npm run dev
```

## Architecture Details

### Modular Design

```
src/
├── app/
│   ├── api/
│   │   ├── invoices/           # Invoice CRUD
│   │   ├── payments/           # Payment creation
│   │   ├── webhooks/
│   │   │   └── mercado-pago/   # Webhook handler
│   │   └── subscription/       # Subscription status
│   ├── subscribe/              # Plan selection page
│   └── payment/                # Payment status page
├── lib/
│   ├── models/
│   │   ├── Invoice.ts
│   │   ├── Payment.ts
│   │   └── Subscription.ts
│   └── services/
│       ├── payment/
│       │   ├── PaymentProvider.ts    # Interface
│       │   └── MercadoPagoService.ts # Implementation
│       └── subscriptions/
│           └── PlanConfig.ts         # Plan definitions
└── components/
    └── pos/
        └── InvoiceForm.tsx           # (Ready to implement)
```

### Payment Flow

```
1. User selects plan on /subscribe
2. Frontend calls POST /api/payments
3. Backend creates Mercado Pago preference
4. User redirected to Mercado Pago checkout
5. User completes payment
6. Mercado Pago sends webhook to /api/webhooks/mercado-pago
7. Backend verifies payment and activates subscription
8. User redirected to /payment/success
```

### Invoice Flow

```
1. User creates invoice via POS
2. Frontend sends invoice data with channel selection
3. Backend validates required fields based on channel
4. Invoice stored in MongoDB with channel metadata
5. If ARCA channel: invoice marked ready for export
6. Future: Batch export to ARCA system
```

## Security Considerations

✅ **Token Validation**

- All endpoints verify JWT token
- Business ID extracted from token
- User can only access their own data

✅ **Data Isolation**

- All queries filtered by business ID
- Prevents cross-business data leakage

✅ **Webhook Validation**

- Mercado Pago webhook signature validation
- Required fields check
- Transaction ID verification

✅ **Environment Variables**

- Credentials loaded from environment
- Never hardcoded secrets
- Example .env file provided

## Future Enhancements

1. **ARCA Integration**

   - Batch invoice export to ARCA
   - Status synchronization
   - Error handling and retries

2. **Advanced Features**

   - Invoice serialization (P-prefix)
   - Custom invoice numbering
   - Email delivery to customers
   - PDF generation

3. **Payment Methods**

   - Stripe integration (side-by-side with Mercado Pago)
   - Bank transfer
   - Cash on delivery

4. **Reporting**

   - ARCA vs Internal revenue comparison
   - Tax calculation reports
   - Payment reconciliation

5. **Automation**
   - Recurring invoices
   - Automatic subscription renewal
   - Payment reminders

## Testing

### Test Mercado Pago Payment Preferences

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "PROFESSIONAL",
    "email": "user@example.com",
    "businessName": "Mi Negocio"
  }'
```

### Test Invoice Creation

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "001-00001",
    "channel": "ARCA",
    "customerName": "Cliente SA",
    "customerCuit": "20-12345678-9",
    "ivaType": "RESPONSABLE_INSCRIPTO",
    "items": [{"description": "Producto", "quantity": 1, "unitPrice": 100}],
    "subtotal": 100,
    "taxAmount": 21,
    "totalAmount": 121
  }'
```

## Support & Contact

For issues or questions:

- Check logs: `npm run dev`
- Verify environment variables
- Ensure MongoDB is connected
- Check Mercado Pago dashboard for webhook status

---

**System Version**: 1.0.0  
**Last Updated**: December 2025
