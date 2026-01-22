# Complete Sales & POS System Implementation Guide

## Overview

This document outlines the complete end-to-end sales workflow integrated with invoicing and payment processing (Mercado Pago). The system handles:

- **POS Sales Creation** - From cart to completed sale
- **Invoice Generation** - ARCA/INTERNAL dual channels
- **Payment Processing** - Cash, Card, Check, Online, Mercado Pago
- **Receipt Generation** - Auto-printing thermal receipts
- **Sales Analytics** - Dashboard with KPIs and reporting

---

## Architecture

### Data Flow

```
POS Cart → Customer Info → Invoice Channel Selection
    ↓
Payment Method Selection (Cash/Card/MP)
    ↓
Sale Creation API (/api/sales/complete)
    ↓
Invoice Creation (ARCA/INTERNAL)
    ↓
Stock Deduction + History Tracking
    ↓
[If Mercado Pago]
    └→ Create Payment Preference → Return QR Link
    └→ Customer pays via MP
    └→ Webhook confirms payment → Update Sale/Invoice
[Else]
    └→ Immediately complete sale
    └→ Generate receipt
    └→ Auto-print
```

---

## API Endpoints

### 1. Complete Sale (Create)

**POST** `/api/sales/complete`

Creates a complete sale with integrated invoicing and payment handling.

**Request:**

```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "unitPrice": 100,
      "discount": 10
    }
  ],
  "paymentMethod": "mercadopago|cash|card|check|online",
  "invoiceChannel": "ARCA|INTERNAL",
  "customerName": "Cliente SA",
  "customerEmail": "cliente@empresa.com",
  "customerCuit": "20-12345678-9",
  "ivaType": "RESPONSABLE_INSCRIPTO|MONOTRIBUTISTA|NO_CATEGORIZADO",
  "discount": 50,
  "notes": "Delivery a domicilio"
}
```

**Response (Success):**

```json
{
  "sale": {
    "id": "507f1f77bcf86cd799439012",
    "invoiceNumber": "2024-12-001",
    "invoiceId": "507f1f77bcf86cd799439013",
    "totalWithTax": 231.0,
    "tax": 21.0,
    "subtotal": 180.0,
    "discount": 50,
    "paymentMethod": "mercadopago",
    "paymentStatus": "pending",
    "customerName": "Cliente SA",
    "items": [
      {
        "productName": "Producto 1",
        "quantity": 2,
        "unitPrice": 100,
        "total": 200
      }
    ],
    "paymentLink": "https://www.mercadopago.com/checkout/...",
    "qrCode": "data:image/png;base64,...",
    "preferenceId": "507f1f77bcf86cd799439014"
  },
  "message": "Sale completed successfully"
}
```

**Error Response:**

```json
{
  "error": "Insufficient stock for Producto 1. Available: 1, Requested: 2"
}
```

### 2. Get Sales List / Analytics

**GET** `/api/sales/manage`

Retrieve sales list or analytics data.

**Query Parameters:**

- `type`: `list` | `analytics` | `detail` (default: `list`)
- `id`: Sale ID (required for detail)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `paymentStatus`: `pending` | `completed` | `failed` | `partial`
- `limit`: 1-100 (default: 50)
- `skip`: 0+ (default: 0)

**Example:**

```
GET /api/sales/manage?type=analytics&startDate=2024-12-01&endDate=2024-12-31
GET /api/sales/manage?type=list&paymentStatus=pending&limit=20
GET /api/sales/manage?type=detail&id=507f1f77bcf86cd799439012
```

**Analytics Response:**

```json
{
  "analytics": {
    "totalSales": 45,
    "totalRevenue": 10350.0,
    "totalTax": 2100.0,
    "totalDiscount": 450.0,
    "averageTicket": 230.0,
    "byPaymentMethod": {
      "cash": 20,
      "card": 15,
      "check": 5,
      "online": 3,
      "mercadopago": 2
    },
    "byPaymentStatus": {
      "completed": 42,
      "pending": 2,
      "failed": 1,
      "partial": 0
    }
  }
}
```

### 3. Receipt Generation

**GET** `/api/sales/receipt`

Generates printable receipt in JSON or HTML format.

**Query Parameters:**

- `saleId`: Sale ID (required)
- `format`: `json` | `html` (default: `json`)

**Example:**

```
GET /api/sales/receipt?saleId=507f1f77bcf86cd799439012&format=html
```

Opens receipt in print-ready format that auto-triggers printer dialog.

### 4. Update Sale Status

**PUT** `/api/sales/manage?id={saleId}`

Update sale payment status or notes.

**Request:**

```json
{
  "paymentStatus": "completed|pending|failed|partial",
  "notes": "Updated notes"
}
```

**Response:**

```json
{
  "sale": { ...updated sale },
  "message": "Sale updated successfully"
}
```

### 5. Delete Sale

**DELETE** `/api/sales/manage?id={saleId}`

Delete sale (only if status is pending or failed).

**Response:**

```json
{
  "message": "Sale deleted successfully"
}
```

---

## Frontend Components

### CartWithInvoice Component

**File:** `src/components/pos/CartWithInvoice.tsx`

Enhanced cart component with:

- Invoice channel selector (ARCA/INTERNAL)
- Customer information form
- CUIT validation for ARCA
- Payment method selection
- Real-time calculations (subtotal, tax, total)

**Props:**

```typescript
interface CartProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onApplyDiscount: (productId: string, discount: number) => void;
  onCheckout: (checkoutData: CheckoutData) => Promise<void>;
}
```

**Checkout Data:**

```typescript
interface CheckoutData {
  paymentMethod: "cash" | "card" | "check" | "online" | "mercadopago";
  invoiceChannel: InvoiceChannel;
  customerName: string;
  customerEmail?: string;
  customerCuit?: string;
  ivaType?: string;
  discount?: number;
  notes?: string;
}
```

### POS Page

**File:** `src/app/pos/page.tsx` (updated)

Main POS interface with:

- Product search
- Shopping cart with enhanced features
- Cash register status check
- Token refresh handling
- Receipt auto-printing

**Features:**

- ✅ Cash register open/closed state
- ✅ Product inventory search
- ✅ Multi-discount support per item
- ✅ Customer information capture
- ✅ Invoice channel selection
- ✅ Multiple payment methods
- ✅ Mercado Pago QR generation
- ✅ Auto-print receipts

### Sales Dashboard

**File:** `src/app/sales/page.tsx`

Comprehensive sales management interface with:

- Sales list with filters
- Analytics dashboard
- Payment method breakdown
- Payment status breakdown
- Receipt viewing/printing
- Date range filtering

**Tabs:**

1. **List** - Table view of sales with filters
2. **Analytics** - KPIs and statistics

---

## Database Models

### Sale Model

**File:** `src/lib/models/Sale-enhanced.ts`

```typescript
interface ISale {
  business: ObjectId; // Business reference
  user: ObjectId; // Sales person/user
  items: SaleItem[]; // Products sold
  subtotal: number; // Pre-tax, pre-discount
  tax: number; // Calculated 21% IVA
  totalWithTax: number; // Final amount including tax
  discount: number; // Sale-level discount
  total: number; // Subtotal - discount (pre-tax)
  paymentMethod: string; // cash|card|check|online|mercadopago
  paymentStatus: string; // pending|completed|failed|partial
  invoice?: ObjectId; // Link to Invoice document
  cashRegister?: ObjectId; // Cash register used
  paymentLink?: string; // Mercado Pago link
  notes?: string; // Sale notes
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**

- `business + createdAt` - Query by business and date
- `business + paymentStatus` - Filter by payment status
- `invoice` - Quick lookup of sales by invoice
- `user` - Sales person analytics

---

## Payment Integration

### Mercado Pago Flow

1. **Customer selects Mercado Pago** at checkout
2. **Create Payment Preference** via MercadoPagoService
   - Item details
   - Amount (including tax)
   - Customer email
   - Metadata (saleId, invoiceId, customerCuit)
3. **Return QR Code & Payment Link** to frontend
4. **Customer scans QR** or clicks link
5. **Completes payment** in Mercado Pago
6. **Webhook triggers** at `/api/webhooks/mercado-pago`
7. **Webhook updates:**
   - Payment status in Payment model
   - Sale status changes to "completed"
   - Invoice status changes to "PAID"

### Webhook Handler

**File:** `src/app/api/webhooks/mercado-pago/route.ts`

Listens for `payment.created` events and:

- Extracts payment info from webhook
- Updates Payment record status
- Auto-activates Sale
- Updates associated Invoice

**Webhook Verification:**

```
Signature verification implemented at:
X-Signature header check with MP public key
```

---

## Receipt Printing

### HTML Receipt Generation

**File:** `src/app/api/sales/receipt/route.ts`

Features:

- ✅ 80mm thermal printer format
- ✅ Item listing with quantities
- ✅ Tax breakdown (21% IVA)
- ✅ Discount display
- ✅ Payment method
- ✅ Customer info
- ✅ Auto-print trigger
- ✅ Professional formatting

**Styling:**

- Courier New monospace font (thermal printer compatible)
- Dashed borders for section separation
- Right-aligned totals
- Logo placeholder support

### Print Workflow

1. User completes sale
2. Receipt endpoint called with saleId
3. HTML generated server-side
4. Window.open() with print trigger
5. Browser print dialog appears
6. User selects printer
7. Receipt prints

---

## Tax Calculation

### IVA (21%) Calculation

**Current Implementation:** Fixed 21% on subtotal

```typescript
const tax = Math.round((subtotal - totalDiscount) * 0.21 * 100) / 100;
const totalWithTax = subtotal - discount + tax;
```

**Future Enhancement:** CUIT-based IVA type

- Responsable Inscripto: 21%
- Monotributista: Included in price
- No Categorizado: Per regulations

---

## Stock Management

### Stock Deduction Flow

1. **Verify stock availability** for each item
2. **If insufficient:** Return 400 error with available quantity
3. **If sufficient:** Deduct from Product.stock
4. **Record in StockHistory:**
   - Type: "sale"
   - Quantity: negative
   - Reference: Sale ID

**Stock Query:**

```typescript
const product = await Product.findOne({
  _id: item.productId,
  business: decoded.businessId,
});

if (product.stock < item.quantity) {
  throw new Error(`Insufficient stock`);
}

product.stock -= item.quantity;
await product.save();
```

---

## Error Handling

### Common Errors

| Error                | Status | Cause                      | Solution                   |
| -------------------- | ------ | -------------------------- | -------------------------- |
| Unauthorized         | 401    | Missing/invalid token      | Login again, refresh token |
| No items in sale     | 400    | Empty cart                 | Add products to cart       |
| Insufficient stock   | 400    | Not enough inventory       | Reduce quantity            |
| CUIT required        | 400    | ARCA selected without CUIT | Enter valid CUIT           |
| Cash register closed | 400    | Register not open          | Open register first        |
| Sale not found       | 404    | Invalid sale ID            | Check ID parameter         |
| Mercado Pago error   | 500    | API failure                | Try again, check API key   |

---

## Security Considerations

1. **Business Isolation**

   - All queries filter by `business` field
   - Users can only access their business data

2. **Token Validation**

   - JWT verified on every API call
   - businessId extracted from decoded token
   - Token refresh on expiry

3. **Payment Security**

   - Mercado Pago handles card data (PCI-DSS compliant)
   - Amount validation before payment creation
   - Webhook signature verification (configurable)

4. **Data Protection**
   - Sensitive fields indexed for privacy
   - CUIT never exposed in API responses
   - Payment links expire

---

## Configuration

### Environment Variables

```env
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_-12345...
MERCADO_PAGO_PUBLIC_KEY=APP_USR_-67890...

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key

# Tax (future)
DEFAULT_IVA_RATE=0.21
```

---

## Testing

### Test Scenarios

#### 1. Cash Sale

```
1. Add product to cart
2. Enter customer name
3. Select "Efectivo" payment
4. Click "Completar Venta"
5. Receipt prints automatically
6. Sale appears in dashboard
```

#### 2. Mercado Pago Sale

```
1. Add product to cart
2. Enter customer name & CUIT
3. Select "Mercado Pago" payment
4. Click "Completar Venta"
5. MP payment link opens in new tab
6. Customer completes payment
7. Webhook confirms
8. Sale status changes to "completed"
9. Receipt available in dashboard
```

#### 3. ARCA Invoice

```
1. Add product to cart
2. Select "ARCA" invoice channel
3. Enter CUIT (required validation)
4. Select IVA type
5. Complete sale
6. Invoice created with ARCA channel
7. Ready for batch export
```

### cURL Examples

**Create Sale (Cash):**

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "...", "quantity": 1, "unitPrice": 100}],
    "paymentMethod": "cash",
    "invoiceChannel": "INTERNAL",
    "customerName": "Cliente"
  }'
```

**Get Sales Analytics:**

```bash
curl http://localhost:3000/api/sales/manage?type=analytics&startDate=2024-12-01&endDate=2024-12-31 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Receipt HTML:**

```bash
curl http://localhost:3000/api/sales/receipt?saleId=...&format=html \
  -H "Authorization: Bearer YOUR_TOKEN" > receipt.html
```

---

## Future Enhancements

1. **ARCA Batch Export**

   - Group invoices by date
   - Generate XML export file
   - Auto-upload to ARCA

2. **PDF Invoice Generation**

   - Full invoice as PDF
   - Email delivery to customer
   - Archive in cloud storage

3. **Payment Reconciliation**

   - Automatic bank import
   - Match transactions to sales
   - Discrepancy alerts

4. **Multi-Currency**

   - USD support
   - Crypto payments (future)

5. **Advanced Reporting**

   - Profit margins by product
   - Salesperson performance
   - Customer lifetime value
   - Inventory turnover

6. **Stripe Integration**
   - Alternative payment provider
   - Subscription invoices
   - International payments

---

## Troubleshooting

### Sale Not Appearing

- Check business ID matches
- Verify date range in filters
- Confirm payment status value

### Receipt Not Printing

- Check popup blocker
- Verify printer is online
- Test with `format=json` first

### Mercado Pago Link Failing

- Verify API token is valid
- Check amount > 0
- Confirm webhook URL is public

### Invoice Channel Not Saving

- Ensure CUIT provided for ARCA
- Check IVA type is valid value
- Verify invoice channel is uppercase

---

## Support

For issues or questions:

1. Check error message in API response
2. Review logs in browser console
3. Verify all environment variables set
4. Check Mercado Pago dashboard for payment status
