# Testing Guide

## Local Testing Checklist

### Prerequisites

```bash
# Ensure MongoDB is running (MongoDB Atlas or local instance)
# Update .env.local with your MongoDB URI
```

### 1. Start Development Server

```bash
npm run dev
```

Expected output: `ready - started server on 0.0.0.0:3000`

### 2. Test Landing Page

- Visit: http://localhost:3000
- Verify: Landing page loads with pricing section
- Check: "Get Started" and "Contact Us" buttons are visible

### 3. Test User Registration

- Visit: http://localhost:3000/auth/register
- Fill in form:
  - Email: test@example.com
  - Password: Test123!
  - Full Name: Test User
- Click "Register"
- Expected: Redirect to dashboard
- Verify: localStorage has `user`, `accessToken`, `refreshToken`

### 4. Test User Login

- Logout (if logged in)
- Visit: http://localhost:3000/auth/login
- Enter credentials from step 3
- Click "Login"
- Expected: Redirect to dashboard

### 5. Test Dashboard

- Visit: http://localhost:3000/dashboard
- Verify:
  - Quick stats cards displayed
  - Navigation buttons visible
  - User name displayed in header
  - Logout button works

### 6. Test Product Creation

- Visit: http://localhost:3000/products
- Click "+ Add Product"
- Fill in form:
  - Name: Test Product
  - Code: TP001
  - Cost: 10.00
  - Price: 15.00
  - Stock: 100
  - Category: Electronics
- Click "Create Product"
- Expected: Product appears in list
- Verify: Margin calculated automatically (33.3%)

### 7. Test POS Screen (CORE MVP)

- Visit: http://localhost:3000/pos
- In search box, type: "Test"
- Expected: Test Product appears
- Click "Add" button
- Verify:
  - Product added to cart
  - Quantity: 1
  - Total: $15.00
- Change quantity to 2
- Verify: Total updates to $30.00
- Add discount: $5.00
- Verify: Total becomes $25.00
- Select payment method: "Cash"
- Click "Checkout"
- Expected: "Sale completed successfully!" alert
- Verify: Product stock reduced to 98

### 8. Test Purchase Recording

- Visit: http://localhost:3000/purchases
- Click "+ Record Purchase"
- Fill in form:
  - Product: Test Product
  - Quantity: 50
  - Cost Price: 9.00
  - Supplier: Test Supplier
  - Invoice Number: INV001
- Click "Record Purchase"
- Expected: Purchase recorded
- Verify in products page: Stock increased to 148

### 9. Test Cash Register

- Visit: http://localhost:3000/cash-register
- Verify: Status shows "CLOSED"
- Enter opening balance: 100.00
- Click "Open Register"
- Expected: Status changes to "OPEN"
- Click "Close Register"
- Expected: Status changes to "CLOSED"

### 10. Test Reports

- Visit: http://localhost:3000/reports
- Click "Daily Sales"
- Verify: Shows today's sales
- Expected: 1 sale of $25.00 from step 7
- Click "Product Analysis"
- Verify: Shows product with current stock (148)

### 11. Test Admin Panel

- Visit: http://localhost:3000/admin
- Expected: Admin panel loads (only if user role is 'admin')
- Verify: Management cards displayed

### 12. Test API Endpoints with cURL or Postman

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "Test123!",
    "fullName": "API Test User"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "Test123!"
  }'
```

#### Get Products (with token)

```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Sale

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 1,
        "unitPrice": 15.00,
        "discount": 0
      }
    ],
    "paymentMethod": "cash"
  }'
```

---

## Production Testing

### Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Stripe API keys configured (if using payments)
- [ ] JWT secrets are strong and unique
- [ ] Domain configured (if using custom domain)

### Post-Deployment Testing

1. Visit production URL
2. Repeat all tests from Local Testing section
3. Verify HTTPS is enabled
4. Test from mobile device
5. Check browser console for errors
6. Verify MongoDB connection works
7. Test all API endpoints with production URL

### Performance Testing

- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Search results appear instantly
- [ ] Cart updates smoothly
- [ ] No console errors

### Security Testing

- [ ] Cannot access protected routes without login
- [ ] JWT tokens expire correctly
- [ ] Admin panel restricted to admin users
- [ ] SQL injection attempts fail
- [ ] XSS attempts blocked

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution**:

- Check MongoDB URI in `.env.local`
- Verify MongoDB Atlas allows connections from your IP
- Ensure database credentials are correct

### Issue: "Unauthorized" on API calls

**Solution**:

- Check if accessToken is in localStorage
- Token may have expired (15 min), try refreshing or re-login
- Verify Authorization header format: `Bearer <token>`

### Issue: Build fails with TypeScript errors

**Solution**:

- Run `npm install` to ensure all dependencies installed
- Check for missing `@types/*` packages
- Set `strict: false` in tsconfig.json temporarily

### Issue: Products not appearing in search

**Solution**:

- Ensure products are created successfully
- Check MongoDB connection
- Verify businessId matches between user and products

### Issue: Stock not updating after sale

**Solution**:

- Check Sale creation response for errors
- Verify product has sufficient stock
- Check MongoDB for StockHistory records

---

## Test Data Generator

### Quick Setup Test Data

Run these in the browser console after registering:

```javascript
// Create 5 test products
for (let i = 1; i <= 5; i++) {
  fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify({
      name: `Product ${i}`,
      code: `PROD00${i}`,
      cost: 10 * i,
      price: 15 * i,
      stock: 100,
      category: "Test",
    }),
  })
    .then((r) => r.json())
    .then(console.log);
}
```

### Create Test Sales

```javascript
// Assuming you have a productId
const productId = "YOUR_PRODUCT_ID";
fetch("/api/sales", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  body: JSON.stringify({
    items: [
      {
        productId: productId,
        quantity: 2,
        unitPrice: 15.0,
        discount: 0,
      },
    ],
    paymentMethod: "cash",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## Performance Benchmarks

Expected performance metrics:

- **Landing Page Load**: < 2 seconds
- **Dashboard Load**: < 1.5 seconds
- **POS Screen Load**: < 2 seconds
- **Product Search**: < 300ms
- **API Response Time**: < 500ms
- **Sale Creation**: < 1 second
- **Build Time**: < 2 minutes

---

## Browser Compatibility

Tested and working on:

- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

Mobile:

- ✅ iOS Safari 17+
- ✅ Chrome Mobile 120+

---

## Monitoring & Logs

### View Logs in Development

```bash
# Terminal where `npm run dev` is running shows:
- API requests
- Build output
- Error messages
```

### Production Logs (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. View real-time logs

### MongoDB Logs (Atlas)

1. Go to MongoDB Atlas
2. Select your cluster
3. Click "Metrics" tab
4. View connection logs and performance

---

## Automated Testing Setup (Future)

### Install Testing Libraries

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

### Example Test File

```typescript
// src/__tests__/auth.test.tsx
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/auth/login/page";

describe("Login Page", () => {
  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
```

---

## Load Testing (Future)

Use tools like:

- **k6** - Load testing tool
- **Artillery** - Modern load testing toolkit
- **Apache JMeter** - Performance testing

Example k6 script:

```javascript
import http from "k6/http";

export default function () {
  http.get("https://your-app.vercel.app/api/products");
}
```

---

## End-to-End Testing (Future)

Use **Playwright** or **Cypress**:

```bash
npm install --save-dev @playwright/test
```

Example Playwright test:

```typescript
import { test, expect } from "@playwright/test";

test("user can login", async ({ page }) => {
  await page.goto("http://localhost:3000/auth/login");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "Test123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
```

---

## Deployment Verification

After deploying to Vercel:

### 1. Check Build Logs

```bash
# In Vercel dashboard, verify:
- Build completed successfully
- All routes generated
- No build errors
```

### 2. Test Production URLs

```bash
# Replace YOUR_APP with your Vercel URL
curl https://YOUR_APP.vercel.app
curl https://YOUR_APP.vercel.app/api/products
```

### 3. Monitor First User Session

- Register a test account in production
- Create a product
- Make a sale
- Check reports
- Verify all data persists in MongoDB Atlas

### 4. Set Up Monitoring

- Add Vercel Analytics
- Set up error tracking (Sentry)
- Configure uptime monitoring (UptimeRobot)

---

## Success Criteria

✅ All features working as expected  
✅ No console errors  
✅ API endpoints responding correctly  
✅ Database operations successful  
✅ Authentication flow smooth  
✅ Stock management accurate  
✅ Reports showing correct data  
✅ Mobile responsive  
✅ Fast page loads  
✅ Secure (HTTPS in production)

---

**Ready to test? Start with: `npm run dev`** 🚀
