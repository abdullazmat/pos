# POS SAAS System

A complete, production-ready SaaS Point of Sale system built with Next.js 14, MongoDB, Mongoose, Stripe integration, JWT authentication, and comprehensive role-based access control.

## Features

- **Authentication & Authorization**
  - JWT-based authentication (access + refresh tokens)
  - Multi-role user system (Admin, Supervisor, Cashier)
  - Password hashing with bcryptjs

- **Plan System**
  - Free plan: 1 user, 50 products max
  - PRO plan: unlimited users and products
  - Backend enforces plan limits

- **POS Fast Sale Screen** (Core MVP)
  - **NEW: Keyboard-Only Supermarket Mode** 🎹
    - Quantity-first workflow (no mouse required)
    - Multiplier support: `50*CODE` for bulk items
    - Decimal quantities for weight-based products
    - Customer management shortcuts (Shift+C/F/N/X)
    - Auto-focus management for rapid scanning
    - [Quick Reference](KEYBOARD_POS_QUICK_REFERENCE.md) | [Full Documentation](KEYBOARD_POS_IMPLEMENTATION.md)
  - Real-time product search (by name, code, barcode)
  - Shopping cart with quantity management
  - Per-product and order discounts
  - Multiple payment methods (cash, card, check, online)
  - Instant stock reduction
  - Quick checkout workflow

- **Products Management**
  - CRUD operations
  - Stock tracking with low-stock alerts
  - Automatic margin calculation
  - Barcode support

- **Stock & Purchases**
  - Automatic stock reduction on sales
  - Purchase orders to increase stock
  - Cost updates on purchases
  - Stock movement history

- **Cash Register (Caja)**
  - Open/Close cash register
  - Cash in/out tracking
  - Movement history
  - User-linked transactions

- **Reports**
  - Daily sales summary (Free plan)
  - Advanced reports (PRO plan):
    - Sales by day/week/month
    - Best-selling products
    - Profit margin analysis
    - Sales by user
    - CSV export

- **Subscription System**
  - Stripe integration
  - Auto-renewal management
  - Failed payment detection
  - Automatic downgrade on expiration

- **Admin Panel**
  - User management
  - Plan and subscription overview
  - System logs
  - Usage analytics

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (Access + Refresh tokens)
- **Payments**: Stripe
- **Validation**: Zod
- **Forms**: React Hook Form

## Installation

```bash
# Clone repository
git clone <repo>
cd pos-saas

# Install dependencies
npm install

# Create .env.local file (copy from .env.local.example)
cp .env.local.example .env.local

# Add your MongoDB URI and API keys to .env.local

# Run development server
npm run dev
```

## 🎹 Keyboard POS Documentation

The system includes a complete keyboard-only supermarket POS mode for maximum efficiency:

- **[Quick Reference Card](KEYBOARD_POS_QUICK_REFERENCE.md)** - Print and keep at workstation
- **[Implementation Guide](KEYBOARD_POS_IMPLEMENTATION.md)** - Technical documentation
- **[Testing Guide](KEYBOARD_POS_TESTING_GUIDE.md)** - 37 comprehensive test cases
- **[Visual Workflow](KEYBOARD_POS_VISUAL_GUIDE.md)** - Diagrams and animations
- **[Summary](KEYBOARD_POS_SUMMARY.md)** - Complete feature overview

**Key Features:**

- ⌨️ 100% keyboard operation (no mouse)
- 📊 Quantity-first workflow
- ✖️ Multiplier support: `50*CODE`
- ⚖️ Decimal quantities for weight products
- 👥 Customer shortcuts: Shift+C/F/N/X
- 🎯 Auto-focus management
- 🌍 Multi-language support

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── refresh/route.ts
│   │   ├── products/route.ts
│   │   ├── sales/route.ts
│   │   ├── purchases/route.ts
│   │   ├── cash-register/route.ts
│   │   ├── reports/route.ts
│   │   └── subscriptions/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   ├── pos/
│   ├── products/
│   ├── admin/
│   └── reports/
├── components/
│   ├── pos/
│   ├── products/
│   ├── admin/
│   ├── cash-register/
│   └── reports/
├── lib/
│   ├── db/
│   │   └── connect.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Sale.ts
│   │   ├── Purchase.ts
│   │   ├── CashRegister.ts
│   │   ├── CashMovement.ts
│   │   ├── Subscription.ts
│   │   ├── Plan.ts
│   │   ├── Business.ts
│   │   └── StockHistory.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── helpers.ts
│   └── services/
├── styles/
│   └── globals.css
└── types/
    └── index.ts
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Products

- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Sales

- `GET /api/sales` - Get sales history
- `POST /api/sales` - Create sale
- `GET /api/sales/[id]` - Get sale details

### Purchases

- `GET /api/purchases` - Get purchases
- `POST /api/purchases` - Create purchase

### Cash Register

- `POST /api/cash-register/open` - Open register
- `POST /api/cash-register/close` - Close register
- `POST /api/cash-register/movement` - Record movement

### Reports

- `GET /api/reports/sales` - Get sales reports
- `GET /api/reports/products` - Get product reports
- `GET /api/reports/export` - Export to CSV

### Subscriptions

- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/status` - Get subscription status

## Deployment

### Deploy to Vercel (Frontend)

```bash
vercel deploy
```

### Deploy Backend to Render

- Connect GitHub repository
- Set environment variables
- Deploy from main branch

## Environment Variables

See `.env.local.example` for all required variables.

## License

MIT
