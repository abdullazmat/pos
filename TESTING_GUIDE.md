# Complete Sales System - Testing Guide

## 🧪 Test Environment Setup

### Prerequisites

- ✅ Node.js running
- ✅ MongoDB connected
- ✅ Valid JWT token
- ✅ At least one product in database
- ✅ Business ID in token

### Get Your Access Token

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "password"
  }'

# Response will include accessToken
# Save it: export TOKEN="your_access_token_here"
```

---

## 🧪 Test Scenario 1: Simple Cash Sale

### Step 1: Check Available Products

```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response:**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Product A",
      "price": 100,
      "stock": 50,
      "business": "..."
    }
  ]
}
```

### Step 2: Create Cash Sale

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2,
        "unitPrice": 100,
        "discount": 0
      }
    ],
    "paymentMethod": "cash",
    "invoiceChannel": "INTERNAL",
    "customerName": "Cliente Efectivo",
    "customerEmail": "cliente@email.com",
    "discount": 0
  }'
```

**Expected Response (201 Created):**

```json
{
  "sale": {
    "id": "507f1f77bcf86cd799439020",
    "invoiceNumber": "2024-12-001",
    "invoiceId": "507f1f77bcf86cd799439021",
    "totalWithTax": 242,
    "tax": 21,
    "subtotal": 200,
    "discount": 0,
    "paymentMethod": "cash",
    "paymentStatus": "completed",
    "customerName": "Cliente Efectivo",
    "items": [
      {
        "productName": "Product A",
        "quantity": 2,
        "unitPrice": 100,
        "total": 200
      }
    ]
  },
  "message": "Sale completed successfully"
}
```

### Step 3: Get Receipt

```bash
curl http://localhost:3000/api/sales/receipt?saleId=507f1f77bcf86cd799439020&format=html \
  -H "Authorization: Bearer $TOKEN" > receipt.html

# Open in browser
open receipt.html
```

### Step 4: Verify in Sales List

```bash
curl "http://localhost:3000/api/sales/manage?type=list&limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected:** Your sale appears in the list

---

## 🧪 Test Scenario 2: ARCA Invoice Sale

### Create ARCA Sale with CUIT

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 1,
        "unitPrice": 500,
        "discount": 0
      }
    ],
    "paymentMethod": "card",
    "invoiceChannel": "ARCA",
    "customerName": "Empresa XYZ SRL",
    "customerCuit": "20-12345678-9",
    "ivaType": "RESPONSABLE_INSCRIPTO",
    "discount": 0
  }'
```

**Expected Response:**

```json
{
  "sale": {
    "id": "507f1f77bcf86cd799439022",
    "invoiceNumber": "2024-12-002",
    "invoiceId": "507f1f77bcf86cd799439023",
    "totalWithTax": 605,
    "tax": 105,
    "paymentMethod": "card",
    "paymentStatus": "completed"
  }
}
```

### Verify Invoice ARCA Channel

```bash
curl "http://localhost:3000/api/invoices?invoiceId=507f1f77bcf86cd799439023" \
  -H "Authorization: Bearer $TOKEN" | jq '.invoice | {channel, customerCuit, ivaType}'
```

**Expected Output:**

```json
{
  "channel": "ARCA",
  "customerCuit": "20-12345678-9",
  "ivaType": "RESPONSABLE_INSCRIPTO"
}
```

---

## 🧪 Test Scenario 3: Mercado Pago Payment

### Create Mercado Pago Sale

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 1,
        "unitPrice": 150,
        "discount": 0
      }
    ],
    "paymentMethod": "mercadopago",
    "invoiceChannel": "INTERNAL",
    "customerName": "Cliente MP",
    "customerEmail": "cliente@email.com",
    "discount": 0
  }'
```

**Expected Response:**

```json
{
  "sale": {
    "id": "507f1f77bcf86cd799439024",
    "invoiceNumber": "2024-12-003",
    "paymentStatus": "pending",
    "paymentLink": "https://www.mercadopago.com/checkout/...",
    "qrCode": "data:image/png;base64,...",
    "preferenceId": "507f1f77bcf86cd799439025"
  },
  "message": "Sale completed successfully"
}
```

### Verify Payment was Created

```bash
# This will check Payment model (if implementing)
curl "http://localhost:3000/api/payments?saleId=507f1f77bcf86cd799439024" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Simulate Customer Payment

```bash
# In Mercado Pago sandbox, complete the payment manually
# Then webhook will be triggered (if set up)
# Check sale status changes to "completed"

curl "http://localhost:3000/api/sales/manage?type=detail&id=507f1f77bcf86cd799439024" \
  -H "Authorization: Bearer $TOKEN" | jq '.sale.paymentStatus'
```

**Expected:** Status changes to "completed" after payment

---

## 🧪 Test Scenario 4: Discounts & Tax Calculation

### Sale with Discounts

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2,
        "unitPrice": 100,
        "discount": 10
      },
      {
        "productId": "507f1f77bcf86cd799439012",
        "quantity": 1,
        "unitPrice": 200,
        "discount": 20
      }
    ],
    "paymentMethod": "cash",
    "invoiceChannel": "INTERNAL",
    "customerName": "Cliente Descuentos",
    "discount": 50
  }'
```

**Manual Calculation:**

```
Item 1: (2 × 100) - 10 = 190
Item 2: (1 × 200) - 20 = 180
Subtotal: 190 + 180 = 370
Sale Discount: -50
After Discount: 320
Tax (21%): 67.20
TOTAL: 387.20
```

**Expected Response:**

- subtotal: 370
- tax: 67.20
- totalWithTax: 387.20

---

## 🧪 Test Scenario 5: Analytics & Reporting

### Get Sales Analytics

```bash
curl "http://localhost:3000/api/sales/manage?type=analytics&startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response:**

```json
{
  "analytics": {
    "totalSales": 4,
    "totalRevenue": 1621.2,
    "totalTax": 271.2,
    "totalDiscount": 100,
    "averageTicket": 405.3,
    "byPaymentMethod": {
      "cash": 1,
      "card": 1,
      "check": 0,
      "online": 0,
      "mercadopago": 1
    },
    "byPaymentStatus": {
      "completed": 3,
      "pending": 1,
      "failed": 0,
      "partial": 0
    }
  }
}
```

### Get Sales by Date Range

```bash
curl "http://localhost:3000/api/sales/manage?type=list&startDate=2024-12-01&endDate=2024-12-31&limit=50" \
  -H "Authorization: Bearer $TOKEN" | jq '.sales | length'
```

### Filter by Payment Status

```bash
curl "http://localhost:3000/api/sales/manage?type=list&paymentStatus=pending" \
  -H "Authorization: Bearer $TOKEN" | jq '.sales[]."paymentStatus"'
```

---

## 🧪 Test Scenario 6: Error Handling

### Missing Customer Name

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 1,
      "unitPrice": 100
    }],
    "paymentMethod": "cash",
    "invoiceChannel": "INTERNAL",
    "customerName": ""
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "error": "Customer name is required"
}
```

### ARCA without CUIT

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{...}],
    "invoiceChannel": "ARCA",
    "customerName": "Cliente",
    "customerCuit": ""
  }'
```

**Expected Response (400):**

```json
{
  "error": "CUIT is required for ARCA invoices"
}
```

### Insufficient Stock

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 10000,
      "unitPrice": 100
    }],
    "paymentMethod": "cash",
    "customerName": "Cliente"
  }'
```

**Expected Response (400):**

```json
{
  "error": "Insufficient stock for Product A. Available: 48, Requested: 10000"
}
```

### Unauthorized (No Token)

```bash
curl -X POST http://localhost:3000/api/sales/complete \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected Response (401):**

```json
{
  "error": "Unauthorized"
}
```

---

## 🧪 Test Scenario 7: Receipt Generation

### Get Receipt as JSON

```bash
curl "http://localhost:3000/api/sales/receipt?saleId=507f1f77bcf86cd799439020&format=json" \
  -H "Authorization: Bearer $TOKEN" | jq .receipt
```

**Expected Response:**

```json
{
  "receipt": {
    "receiptNumber": "2024-12-001",
    "date": "19/12/2024 14:30:45",
    "items": [
      {
        "description": "Product A",
        "quantity": 2,
        "unitPrice": 100,
        "total": 200
      }
    ],
    "subtotal": 200,
    "discount": 0,
    "tax": 42,
    "total": 242,
    "paymentMethod": "cash",
    "paymentStatus": "completed",
    "customerName": "Cliente Efectivo",
    "customerCuit": null
  }
}
```

### Get Receipt as HTML

```bash
curl "http://localhost:3000/api/sales/receipt?saleId=507f1f77bcf86cd799439020&format=html" \
  -H "Authorization: Bearer $TOKEN" > receipt.html

# Open in browser - should trigger print dialog
open receipt.html
```

---

## 🧪 Test Scenario 8: Stock Verification

### Check Stock Before Sale

```bash
curl "http://localhost:3000/api/products/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer $TOKEN" | jq '.product.stock'
```

**Example Output:** 50

### After Sale (Quantity: 2)

```bash
curl "http://localhost:3000/api/products/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer $TOKEN" | jq '.product.stock'
```

**Expected Output:** 48 (50 - 2)

### Check Stock History

```bash
curl "http://localhost:3000/api/stock-history?productId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer $TOKEN" | jq '.history[] | {type, quantity, reference}'
```

**Expected:** Entry with type: "sale", quantity: -2

---

## 🧪 Test Scenario 9: Update Sale Status

### Update Pending Sale to Completed

```bash
curl -X PUT "http://localhost:3000/api/sales/manage?id=507f1f77bcf86cd799439024" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "completed"
  }'
```

**Expected Response:**

```json
{
  "sale": {
    "_id": "507f1f77bcf86cd799439024",
    "paymentStatus": "completed"
  },
  "message": "Sale updated successfully"
}
```

### Verify Invoice Status Updated

```bash
curl "http://localhost:3000/api/invoices?invoiceId=507f1f77bcf86cd799439025" \
  -H "Authorization: Bearer $TOKEN" | jq '.invoice.paymentStatus'
```

**Expected:** "PAID"

---

## 🧪 Test Scenario 10: Delete Sale

### Delete Pending Sale

```bash
curl -X DELETE "http://localhost:3000/api/sales/manage?id=507f1f77bcf86cd799439024" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**

```json
{
  "message": "Sale deleted successfully"
}
```

### Try to Delete Completed Sale

```bash
curl -X DELETE "http://localhost:3000/api/sales/manage?id=507f1f77bcf86cd799439020" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (400):**

```json
{
  "error": "Can only delete pending or failed sales"
}
```

---

## 📊 Test Data Summary Table

| Scenario         | Method | Endpoint                           | Expected Status |
| ---------------- | ------ | ---------------------------------- | --------------- |
| Cash Sale        | POST   | `/api/sales/complete`              | 201             |
| ARCA Sale        | POST   | `/api/sales/complete`              | 201             |
| Mercado Pago     | POST   | `/api/sales/complete`              | 201             |
| Get Receipt      | GET    | `/api/sales/receipt`               | 200             |
| Get List         | GET    | `/api/sales/manage`                | 200             |
| Get Analytics    | GET    | `/api/sales/manage?type=analytics` | 200             |
| Update Status    | PUT    | `/api/sales/manage?id=...`         | 200             |
| Delete Pending   | DELETE | `/api/sales/manage?id=...`         | 200             |
| Missing Customer | POST   | `/api/sales/complete`              | 400             |
| No Token         | POST   | `/api/sales/complete`              | 401             |

---

## ✅ Validation Checklist

- [ ] Cash sale completes immediately
- [ ] Invoice created with correct number
- [ ] Stock deducted correctly
- [ ] Tax calculated at 21%
- [ ] ARCA invoices require CUIT
- [ ] Mercado Pago returns payment link
- [ ] Receipt HTML prints correctly
- [ ] Analytics calculations are accurate
- [ ] Discounts applied properly
- [ ] Error messages are helpful
- [ ] Unauthorized requests rejected
- [ ] Sales appear in dashboard
- [ ] Date filtering works
- [ ] Status filtering works

---

## 🐛 Debugging Tips

### Check Sale Details

```bash
curl "http://localhost:3000/api/sales/manage?type=detail&id=SALE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Check Invoice Details

```bash
curl "http://localhost:3000/api/invoices?id=INVOICE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Check Payment (if MP)

```bash
curl "http://localhost:3000/api/payments" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | select(.sale == "SALE_ID")'
```

### View Stock History

```bash
curl "http://localhost:3000/api/stock-history?productId=PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Check Business Data

```bash
echo $TOKEN | jq -R 'split(".")[1] | @base64d | fromjson | .businessId'
```

---

**Test Suite Created:** December 19, 2025  
**Status:** Ready for execution
