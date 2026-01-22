# API Documentation

## Authentication

All API requests (except `/api/auth/*`) require an `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Register

- **POST** `/api/auth/register`
- Body: `{ email, password, fullName }`
- Returns: `{ user, business, accessToken, refreshToken }`

### Login

- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: `{ user, business, accessToken, refreshToken }`

### Refresh Token

- **POST** `/api/auth/refresh`
- Body: `{ refreshToken }`
- Returns: `{ accessToken, refreshToken }`

## Products

### Get All Products

- **GET** `/api/products`
- Query: `?search=name&category=category`
- Returns: `{ products: [] }`

### Create Product

- **POST** `/api/products`
- Body: `{ name, code, cost, price, stock?, barcode?, category? }`
- Returns: `{ product }`

### Update Product

- **PUT** `/api/products/[id]`
- Body: `{ name?, cost?, price?, stock?, category? }`
- Returns: `{ product }`

### Delete Product

- **DELETE** `/api/products/[id]`
- Returns: `{ message }`

## Sales

### Get Sales

- **GET** `/api/sales`
- Query: `?startDate=2024-01-01&endDate=2024-01-31`
- Returns: `{ sales: [] }`

### Create Sale

- **POST** `/api/sales`
- Body: `{ items: [{ productId, quantity, unitPrice, discount? }], discount?, paymentMethod, cashRegisterId? }`
- Returns: `{ sale }`

## Purchases

### Get Purchases

- **GET** `/api/purchases`
- Returns: `{ purchases: [] }`

### Create Purchase

- **POST** `/api/purchases`
- Body: `{ productId, quantity, costPrice, supplier?, invoiceNumber?, notes? }`
- Returns: `{ purchase }`

## Cash Register

### Open/Close Register

- **POST** `/api/cash-register`
- Body: `{ action: 'open'|'close', amount? }`
- Returns: `{ cashRegister }`

## Reports

### Get Reports

- **GET** `/api/reports`
- Query: `?type=daily|products`
- Returns: `{ type, sales, totalRevenue, totalSales }` or `{ type, products }`

## Subscriptions

### Get Subscription Status

- **GET** `/api/subscriptions/status`
- Returns: `{ subscription, plan, daysLeft }`

## Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "error": "Error message"
}
```

HTTP Status Codes:

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error
