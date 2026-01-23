# Subscription & Business Configuration Backend Workflow

## Overview

This document describes the complete backend workflow for the business configuration and subscription management system.

## API Endpoints

### 1. Get Plans

**Endpoint:** `GET /api/plans`
**Authentication:** None required
**Response:**

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "FREE",
        "name": "Gratuito",
        "price": 0,
        "billing": "/mes",
        "description": "Perfecto para empezar y probar el sistema sin costo",
        "features": {
          "maxProducts": 100,
          "maxUsers": 2,
          "maxCategories": 10,
          ...
        },
        "limits": ["100 productos", "2 usuarios"],
        "icon": "🎯",
        "popular": false
      },
      {
        "id": "PRO",
        "name": "Pro",
        "price": 19990,
        "billing": "/mes",
        "description": "Todo lo que necesitas para administrar tu negocio profesionalmente",
        "features": {
          "maxProducts": 999999,
          "maxUsers": 999999,
          "maxCategories": 999999,
          "customBranding": true,
          ...
        },
        "limits": ["∞ productos", "∞ usuarios", "✓ Logo"],
        "icon": "⭐",
        "popular": true
      }
    ]
  }
}
```

### 2. Get Current Subscription

**Endpoint:** `GET /api/subscription`
**Authentication:** Required (Bearer Token)
**Query Parameters:** None
**Response:**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "_id": "60d5ec49f1234567890abcde",
      "businessId": "business-123",
      "planId": "FREE",
      "status": "active",
      "currentPeriodStart": "2026-01-23T00:00:00Z",
      "currentPeriodEnd": "2027-01-23T00:00:00Z",
      "features": {
        "maxProducts": 100,
        "maxUsers": 2,
        "arcaIntegration": false,
        "customBranding": false,
        ...
      }
    }
  }
}
```

### 3. Upgrade Subscription

**Endpoint:** `POST /api/subscription/upgrade`
**Authentication:** Required (Bearer Token)
**Request Body:**

```json
{
  "planId": "PRO"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Plan upgraded to Pro",
    "subscription": {
      "_id": "60d5ec49f1234567890abcde",
      "businessId": "business-123",
      "planId": "PRO",
      "status": "active",
      "currentPeriodStart": "2026-01-23T10:30:00Z",
      "currentPeriodEnd": "2026-02-23T10:30:00Z",
      "features": {
        "maxProducts": 999999,
        "maxUsers": 999999,
        "arcaIntegration": true,
        "customBranding": true,
        ...
      }
    }
  }
}
```

### 4. Get Business Configuration

**Endpoint:** `GET /api/business-config`
**Authentication:** Required (Bearer Token)
**Response:**

```json
{
  "success": true,
  "data": {
    "businessName": "MI NEGOCIO",
    "address": "Av. San Martín 1234, CABA",
    "phone": "011 1234-5678",
    "email": "info@minegocio.com",
    "website": "www.minegocio.com",
    "cuitRucDni": "20-12345678-9",
    "ticketMessage": "¡GRACIAS POR SU COMPRA!\nVuelva pronto"
  }
}
```

### 5. Update Business Configuration

**Endpoint:** `PUT /api/business-config`
**Authentication:** Required (Bearer Token)
**Request Body:**

```json
{
  "businessName": "MI NEGOCIO",
  "address": "Av. San Martín 1234, CABA",
  "phone": "011 1234-5678",
  "email": "info@minegocio.com",
  "website": "www.minegocio.com",
  "cuitRucDni": "20-12345678-9",
  "ticketMessage": "¡GRACIAS POR SU COMPRA!\nVuelva pronto"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Business configuration updated successfully",
    "config": { ...configuration }
  }
}
```

## Database Models

### Subscription Model

```typescript
{
  _id: ObjectId,
  businessId: String,
  planId: "FREE" | "PRO",
  status: "active" | "cancelled" | "suspended",
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  features: {
    maxProducts: Number,
    maxCategories: Number,
    maxClients: Number,
    maxSuppliers: Number,
    maxUsers: Number,
    arcaIntegration: Boolean,
    advancedReporting: Boolean,
    customBranding: Boolean,
    invoiceChannels: Number,
    apiAccess: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### BusinessConfig Model

```typescript
{
  _id: ObjectId,
  businessId: String,
  businessName: String,
  address: String,
  phone: String,
  email: String,
  website: String,
  cuitRucDni: String,
  ticketMessage: String,
  logoUrl?: String, // For Premium users
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Workflow

### Business Configuration Page

1. **Load Data on Mount:**
   - Fetch available plans from `/api/plans`
   - Fetch current subscription from `/api/subscription`
   - Fetch business config from `/api/business-config`

2. **Display Current State:**
   - Show current subscription plan with "Plan Actual" badge
   - Display business info in ticket preview
   - Highlight "Popular" badge for PRO plan

3. **Subscription Actions:**
   - Click "Click para suscribirse →" button
   - Send POST to `/api/subscription/upgrade`
   - Show loading state ("Procesando...")
   - Update UI on success
   - Show success toast notification

4. **Disable State Logic:**
   - Disable subscribe button if already on that plan
   - Show "Plan Actual" instead of subscribe text
   - Prevent form editing while subscribing

## Error Handling

### Common Errors

1. **Unauthorized (401):** User session expired, redirect to login
2. **Bad Request (400):** Invalid plan ID
3. **Internal Server Error (500):** Database or server error

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

## Security Considerations

1. **Authentication:** All endpoints require Bearer token except `/api/plans`
2. **Authorization:** Users can only access their own business config/subscription
3. **Plan Validation:** Server validates plan ID before updating
4. **Automatic Defaults:** Creates free plan if no subscription exists

## Features by Plan

### FREE Plan ($0/mes)

- 100 productos
- 2 usuarios
- 10 categorías
- 5 proveedores
- No custom branding
- No ARCA integration
- No advanced reporting

### PRO Plan ($19,990/mes)

- Unlimited productos
- Unlimited usuarios
- Unlimited categorías
- Unlimited proveedores, clientes
- Custom branding (logo)
- ARCA integration
- Advanced reporting
- API access
- Multiple invoice channels

## Future Enhancements

1. **Stripe Integration:** Payment processing
2. **Billing History:** Track subscription changes
3. **Usage Limits:** Enforce feature limits per plan
4. **Downgrade Handling:** Grace period for downgrading
5. **Invoice Generation:** Automatic billing invoices
6. **Team Management:** User roles per plan
