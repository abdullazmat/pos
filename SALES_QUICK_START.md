# Complete Sales System - Quick Start Guide

## Overview

Your POS system now has a **complete end-to-end sales workflow** with:

- ✅ Invoice generation (ARCA/INTERNAL channels)
- ✅ Multi-payment methods (Cash, Card, Mercado Pago)
- ✅ Automatic tax calculation (21% IVA)
- ✅ Stock management & tracking
- ✅ Receipt generation & auto-printing
- ✅ Sales analytics dashboard
- ✅ Mercado Pago integration with QR codes

---

## What Was Implemented

### 1. Enhanced POS Page

**File:** `src/app/pos/page.tsx`

Now supports:

- Invoice channel selection (ARCA or INTERNAL)
- Customer information capture
- Dynamic CUIT field for ARCA invoices
- Payment method selection (5 options)
- Tax calculation display
- Mercado Pago QR payment

### 2. New Cart Component

**File:** `src/components/pos/CartWithInvoice.tsx`

Features:

- Customer name/email fields
- ARCA/INTERNAL invoice selector
- IVA type selection (for ARCA)
- Per-item and sale-level discounts
- Real-time tax calculation
- Payment method dropdown
- Form validation

### 3. Complete Sale API

**File:** `src/app/api/sales/complete/route.ts`

Handles the complete workflow:

- Creates invoice automatically
- Deducts stock
- Records stock history
- For Mercado Pago: Creates payment preference with QR
- For cash/card/check/online: Completes sale immediately
- Returns invoice number & payment details

### 4. Receipt Generation

**File:** `src/app/api/sales/receipt/route.ts`

Generates:

- HTML receipt (80mm thermal printer format)
- Auto-print trigger
- Professional formatting
- Full itemization
- Tax breakdown
- Payment details
- Customer info

### 5. Sales Management API

**File:** `src/app/api/sales/manage/route.ts`

Provides:

- Sales list with filters
- Analytics data (revenue, payment methods, status)
- Individual sale details
- Update sale status
- Delete pending/failed sales

### 6. Sales Dashboard

**File:** `src/app/sales/page.tsx`

Features:

- Sales list table with filters
- Date range picker
- Payment status filter
- Analytics overview (KPIs)
- Payment method breakdown
- Payment status breakdown
- Receipt viewing/printing

---

## File Structure

```
New/Updated Files:
├── src/app/api/sales/
│   ├── complete/route.ts          ← Complete sale workflow
│   ├── receipt/route.ts           ← Receipt generation
│   └── manage/route.ts            ← Sales management
├── src/components/pos/
│   ├── CartWithInvoice.tsx        ← Enhanced cart
│   └── Cart.tsx                   ← Original (deprecating)
├── src/app/pos/page.tsx           ← Updated POS page
├── src/app/sales/page.tsx         ← NEW: Sales dashboard
├── src/lib/models/
│   └── Sale-enhanced.ts           ← Enhanced Sale model
└── Documentation/
    └── COMPLETE_SALES_IMPLEMENTATION.md
```

---

## How to Use - Customer Flow

### Step 1: Add Products to Cart

1. Open POS page (`/pos`)
2. Search for products
3. Click product → add to cart
4. Adjust quantity/discount as needed

### Step 2: Provide Customer Info

1. Click "Agregar Cliente" in cart
2. Enter customer name (required)
3. Enter email (optional)
4. Select invoice type:
   - **Interna** = INTERNAL (for internal use)
   - **ARCA** = For tax reporting (requires CUIT)

### Step 3: ARCA Setup (if selected)

1. Enter CUIT (format: 20-12345678-9)
2. Select IVA type:
   - Responsable Inscripto (standard 21%)
   - Monotributista
   - No Categorizado

### Step 4: Choose Payment Method

1. Select payment method:
   - 💵 **Efectivo** (Cash)
   - 💳 **Tarjeta de Débito** (Debit Card)
   - 📋 **Cheque** (Check)
   - 🏦 **Transferencia** (Wire Transfer/Online)
   - 🟔 **Mercado Pago** (QR Code or Link)

### Step 5: Complete Sale

1. Click **"Completar Venta"**

**If Cash/Card/Check/Online:**

- Sale created immediately
- Invoice generated
- Stock deducted
- Receipt opens for printing

**If Mercado Pago:**

- Sale created with PENDING status
- Mercado Pago payment page opens
- Customer completes payment
- Webhook confirms payment
- Receipt becomes available

---

## API Usage Examples

### Create a Sale (Programmatic)

```bash
# Cash sale
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2,
        "unitPrice": 150.00,
        "discount": 0
      }
    ],
    "paymentMethod": "cash",
    "invoiceChannel": "INTERNAL",
    "customerName": "Juan García",
    "customerEmail": "juan@email.com",
    "discount": 0
  }'
```

### Get Sales Analytics

```bash
curl "http://localhost:3000/api/sales/manage?type=analytics&startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Sales List

```bash
curl "http://localhost:3000/api/sales/manage?type=list&paymentStatus=pending&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Receipt as HTML

```bash
curl "http://localhost:3000/api/sales/receipt?saleId=507f1f77bcf86cd799439012&format=html" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" > receipt.html
```

---

## Database Changes

### Sale Model Fields

New/Updated fields:

```typescript
{
  business: ObjectId,           // Business reference
  user: ObjectId,               // Sales person
  items: SaleItem[],            // Products sold
  subtotal: number,             // Pre-tax
  tax: number,                  // Calculated 21%
  totalWithTax: number,         // Final amount
  discount: number,             // Sale discount
  total: number,                // Subtotal - discount
  paymentMethod: string,        // cash|card|mercadopago|etc
  paymentStatus: string,        // pending|completed|failed
  invoice: ObjectId,            // Link to Invoice
  paymentLink: string,          // MP link
  notes: string,                // Sale notes
  createdAt: Date,
  updatedAt: Date
}
```

---

## Tax Calculation

### Current Implementation

- **IVA Rate:** Fixed 21%
- **Calculation:** `tax = (subtotal - discount) * 0.21`
- **Applied to:** Sale total includes tax

### Example

```
Subtotal:     $500.00
Discount:     -$50.00
Subtotal*:    $450.00
Tax (21%):    +$94.50
TOTAL:        $544.50
```

---

## Mercado Pago Integration

### What Happens

1. Customer selects "Mercado Pago"
2. Sale created with status "PENDING"
3. Payment preference generated on Mercado Pago
4. QR code returned
5. Customer scans QR or clicks link
6. Completes payment in Mercado Pago app/website
7. Payment confirmed → Webhook triggered
8. Sale status changes to "COMPLETED"
9. Invoice marked as PAID

### Testing (Sandbox Mode)

To test with Mercado Pago sandbox:

1. Create test account: https://www.mercadopago.com.ar/developers/es/tools
2. Get Sandbox API Token
3. Set in `.env.local`:
   ```
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR_XXXXXXX...  (from sandbox)
   MERCADO_PAGO_PUBLIC_KEY=APP_USR_XXXXXXX...    (from sandbox)
   ```
4. Use test card to complete payment
5. Check webhook delivery in Mercado Pago dashboard

---

## Stock Management

### How Stock Works

1. **Before Sale:** Verify stock availability for each item
2. **During Sale:** Check product.stock >= quantity requested
3. **If Insufficient:** Return error with available quantity
4. **If Sufficient:** Deduct stock immediately
5. **After Sale:** Record in StockHistory for audit trail

### Stock Query

```typescript
// Before deducting
if (product.stock < item.quantity) {
  return error: "Insufficient stock"
}

// Deduct
product.stock -= item.quantity
await product.save()

// Record
await StockHistory.create({
  business: businessId,
  product: productId,
  type: "sale",
  quantity: -item.quantity,
  reference: saleId
})
```

---

## Invoice Channels Explained

### INTERNAL Channel

- For internal business records only
- No tax reporting requirements
- Only requires customer name
- Faster processing
- Use case: Internal transfers, samples

### ARCA Channel

- For official tax reporting
- Requires CUIT & IVA type
- CUIT validation (format: XX-XXXXXXXX-X)
- Can be exported for ARCA submission
- Use case: Official sales to companies

**Field Requirements:**

| Field         | INTERNAL      | ARCA        |
| ------------- | ------------- | ----------- |
| Customer Name | ✅ Required   | ✅ Required |
| Email         | ❌ Optional   | ❌ Optional |
| CUIT          | ❌ Not needed | ✅ Required |
| IVA Type      | ❌ Not needed | ✅ Required |

---

## Error Handling

### Common Issues & Solutions

| Issue                    | Cause                      | Solution                         |
| ------------------------ | -------------------------- | -------------------------------- |
| "Customer name required" | Empty customer field       | Fill customer name               |
| "CUIT required for ARCA" | Selected ARCA without CUIT | Enter valid CUIT                 |
| "Insufficient stock"     | Not enough inventory       | Reduce quantity or check stock   |
| "Cash register closed"   | No open register           | Open cash register first         |
| Receipt won't print      | Popup blocked              | Check browser popup blocker      |
| MP payment link fails    | API token invalid          | Verify MERCADO_PAGO_ACCESS_TOKEN |

---

## Sales Dashboard

### Access

Go to `/sales` page

### Tabs

#### 1. List Tab

- Table of all sales
- Date range filter
- Payment status filter
- Sortable columns
- View receipt button

#### 2. Analytics Tab

- Total sales count
- Total revenue
- Average ticket size
- Total tax collected
- Payment method breakdown
- Payment status breakdown

### Filters

- **Date From:** Select start date
- **Date To:** Select end date
- **Payment Status:** Filter by status
- **Search:** Find by receipt #

---

## Receipt Features

### What's Printed

- Receipt number
- Date & time
- Customer name (if provided)
- CUIT (if ARCA)
- Item listing with quantities
- Subtotal, discount, tax, total
- Payment method
- Status (if pending)
- Thank you message

### Print Format

- 80mm thermal printer compatible
- Monospace font for alignment
- Dashed section separators
- Auto-triggers print dialog
- Can save as PDF

### Access Receipt Later

1. Go to Sales dashboard (`/sales`)
2. Find sale in list
3. Click "Ver Comprobante"
4. HTML receipt opens for printing

---

## Environment Setup

### Required Environment Variables

Create `.env.local`:

```env
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_XXXXX...
MERCADO_PAGO_PUBLIC_KEY=APP_USR_XXXXX...

# Database (existing)
MONGODB_URI=mongodb+srv://...

# Authentication (existing)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
```

### Getting Mercado Pago Keys

1. Go to https://www.mercadopago.com.ar/developers/panel
2. Select your app
3. Go to "Credenciales"
4. Copy "Access Token" and "Public Key"
5. Paste into `.env.local`

---

## Next Steps

### To Go Live

1. ✅ Implement sales workflow (DONE)
2. ⏳ Test with real Mercado Pago account
3. ⏳ Connect thermal printer
4. ⏳ Train staff on new POS features
5. ⏳ Set up backup procedures
6. ⏳ Monitor sales data

### Future Features

- [ ] ARCA batch export (XML)
- [ ] PDF invoice generation
- [ ] Email receipt delivery
- [ ] Refund handling
- [ ] Multi-currency support
- [ ] Advanced reporting

---

## Support Commands

### Check Recent Sales

```bash
curl "http://localhost:3000/api/sales/manage?type=list&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

### View Sale Details

```bash
curl "http://localhost:3000/api/sales/manage?type=detail&id=SALE_ID" \
  -H "Authorization: Bearer TOKEN"
```

### Export Analytics (JSON)

```bash
curl "http://localhost:3000/api/sales/manage?type=analytics&startDate=2024-12-01" \
  -H "Authorization: Bearer TOKEN" | jq . > analytics.json
```

---

## Key Implementation Files

| File                                     | Purpose                   |
| ---------------------------------------- | ------------------------- |
| `src/app/api/sales/complete/route.ts`    | Main sales creation logic |
| `src/app/api/sales/receipt/route.ts`     | Receipt generation        |
| `src/app/api/sales/manage/route.ts`      | Sales management CRUD     |
| `src/components/pos/CartWithInvoice.tsx` | Cart with invoice fields  |
| `src/app/pos/page.tsx`                   | POS page with checkout    |
| `src/app/sales/page.tsx`                 | Sales dashboard           |
| `src/lib/models/Sale-enhanced.ts`        | Sale model                |
| `src/lib/models/Invoice.ts`              | Invoice model (existing)  |
| `src/lib/models/Payment.ts`              | Payment model (existing)  |

---

## Testing Checklist

### Local Testing

- [ ] Add product to cart
- [ ] Adjust quantity
- [ ] Apply discount
- [ ] Enter customer info
- [ ] Select INTERNAL invoice
- [ ] Complete with cash payment
- [ ] Receipt prints
- [ ] Sale appears in dashboard

### ARCA Testing

- [ ] Select ARCA channel
- [ ] Enter CUIT
- [ ] Select IVA type
- [ ] Complete sale
- [ ] Invoice has ARCA channel
- [ ] Can be filtered by channel

### Mercado Pago Testing

- [ ] Select Mercado Pago payment
- [ ] QR link appears
- [ ] Link opens in new window
- [ ] Can complete payment (sandbox)
- [ ] Webhook updates status
- [ ] Sale marked as completed

### Analytics Testing

- [ ] View sales list
- [ ] Filter by date
- [ ] Filter by payment status
- [ ] View analytics
- [ ] Check calculations
- [ ] Export data

---

Congratulations! Your complete sales system is ready. Start using it from the POS page at `/pos`.
