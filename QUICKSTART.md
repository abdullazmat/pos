# 🚀 Quick Start Commands

## Essential Commands

### Development

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### First Time Setup

```powershell
# 1. Install dependencies (already done)
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Edit .env.local with your MongoDB URI and secrets
# Use notepad or your preferred editor
notepad .env.local

# 4. Start development server
npm run dev

# 5. Open browser
start http://localhost:3000
```

### MongoDB Atlas Setup (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database password
7. Paste into `.env.local` as `MONGODB_URI`

### Generate JWT Secrets

```powershell
# Run in PowerShell to generate random secrets
$JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$JWT_REFRESH_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "JWT_SECRET=$JWT_SECRET"
Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"

# Copy these to your .env.local file
```

---

## Your First User Registration

### Via Browser (Recommended)

1. Visit http://localhost:3000
2. Click "Get Started"
3. Fill in:
   - Email: admin@yourcompany.com
   - Password: SecurePassword123!
   - Full Name: Admin User
4. Click "Register"
5. You're automatically logged in!

### Via API (Testing)

```powershell
# Using PowerShell
$body = @{
    email = "admin@test.com"
    password = "Test123!"
    fullName = "Test Admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## Create Your First Product

### Via Browser (Recommended)

1. Login at http://localhost:3000/auth/login
2. Go to http://localhost:3000/products
3. Click "+ Add Product"
4. Fill in:
   - Name: Coffee Mug
   - Code: MUG001
   - Cost: 5.00
   - Price: 10.00
   - Stock: 50
   - Category: Merchandise
5. Click "Create Product"
6. Product appears in list with auto-calculated margin (50%)

### Via API

```powershell
# Get your access token first (from browser localStorage or login response)
$token = "YOUR_ACCESS_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$product = @{
    name = "Coffee Mug"
    code = "MUG001"
    cost = 5.00
    price = 10.00
    stock = 50
    category = "Merchandise"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
    -Method Post `
    -Headers $headers `
    -Body $product
```

---

## Make Your First Sale

### Via POS Screen (Recommended)

1. Go to http://localhost:3000/pos
2. Search for "Coffee"
3. Click "Add" on Coffee Mug
4. Adjust quantity if needed
5. Apply discount if needed
6. Select payment method (Cash)
7. Click "Checkout"
8. Sale completed! Stock automatically reduced to 49

---

## Open Cash Register

1. Go to http://localhost:3000/cash-register
2. Enter opening balance: 100.00
3. Click "Open Register"
4. Cash register is now open for the day
5. All sales will be tracked to this register
6. At end of day, click "Close Register"

---

## View Reports

### Daily Sales Report

1. Go to http://localhost:3000/reports
2. Click "Daily Sales"
3. View today's total sales and revenue
4. See list of all transactions

### Product Analysis

1. Go to http://localhost:3000/reports
2. Click "Product Analysis"
3. View stock levels and profit potential
4. Identify low stock items

---

## Deploy to Production

### GitHub + Vercel (Easiest - 10 minutes)

#### 1. Push to GitHub

```powershell
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete SaaS POS system"

# Create GitHub repo at https://github.com/new
# Then add remote and push
git remote add origin https://github.com/YOUR_USERNAME/pos-saas.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - STRIPE_SECRET_KEY (optional for now)
   - STRIPE_PUBLIC_KEY (optional for now)
   - NEXT_PUBLIC_APP_URL (your vercel URL)
   - NEXT_PUBLIC_API_URL (your vercel URL + /api)
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your app is live! 🎉

#### 3. Test Production

```powershell
# Visit your Vercel URL
start https://your-app.vercel.app

# Register first user
# Create products
# Make test sale
# Verify everything works
```

---

## Common Tasks

### Add a New User (as Admin)

Currently manual via registration. Future enhancement: Admin user management UI.

### Backup Database

```powershell
# MongoDB Atlas automatic backups are included in free tier
# Manual backup via mongodump (requires MongoDB tools):
mongodump --uri="YOUR_MONGODB_URI" --out="./backup"
```

### Update Product Price

1. Go to Products page
2. Find product in list
3. Click "Edit" (future enhancement)
4. Or update via API:

```powershell
$token = "YOUR_ACCESS_TOKEN"
$productId = "PRODUCT_ID"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$update = @{
    price = 12.50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/products/$productId" `
    -Method Put `
    -Headers $headers `
    -Body $update
```

### Check Database Connection

```powershell
# Check logs when starting dev server
npm run dev

# Look for: "MongoDB connected successfully" message
# If error, check MONGODB_URI in .env.local
```

### Clear All Data (Start Fresh)

```javascript
// Run in MongoDB Atlas UI or Compass
// Connect to your database, then:

db.users.deleteMany({});
db.businesses.deleteMany({});
db.products.deleteMany({});
db.sales.deleteMany({});
db.purchases.deleteMany({});
db.subscriptions.deleteMany({});
db.plans.deleteMany({});
db.cashregisters.deleteMany({});
db.cashmovements.deleteMany({});
db.stockhistories.deleteMany({});
```

---

## Troubleshooting

### Port 3000 Already in Use

```powershell
# Stop the process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use different port
$env:PORT=3001; npm run dev
```

### Module Not Found Errors

```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build Fails

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Rebuild
npm run build
```

### Cannot Connect to MongoDB

1. Check `.env.local` file exists
2. Verify `MONGODB_URI` is correct
3. Ensure MongoDB Atlas allows connections
4. Check network connectivity
5. Verify database user has correct permissions

### Unauthorized API Errors

1. Check if logged in
2. Verify token in localStorage: `localStorage.getItem('accessToken')`
3. Token expired? Refresh page or login again
4. Check Authorization header format: `Bearer <token>`

---

## Testing Checklist

- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can create products
- [ ] Can search products in POS
- [ ] Can add products to cart
- [ ] Can complete sale
- [ ] Stock reduces after sale
- [ ] Can record purchase
- [ ] Stock increases after purchase
- [ ] Can open/close cash register
- [ ] Can view daily sales report
- [ ] Can view product analysis
- [ ] Admin can access admin panel
- [ ] Logout works correctly

---

## Performance Tips

### Development

```powershell
# Use turbopack for faster dev server (Next.js 14+)
npm run dev -- --turbo
```

### Production

- Enable Vercel Edge Caching
- Use MongoDB Atlas connection pooling
- Implement Redis for session storage (future)
- Add CDN for static assets
- Enable Vercel Analytics

---

## Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT tokens with expiration
- [x] Protected API routes
- [x] Role-based access control
- [x] Input validation
- [x] HTTPS in production (Vercel auto)
- [ ] Rate limiting (future enhancement)
- [ ] CORS configuration (future enhancement)
- [ ] Security headers (future enhancement)

---

## Support

### Documentation

- `README.md` - Project overview
- `API.md` - API endpoints
- `DEPLOYMENT.md` - Deployment guide
- `PROJECT_SUMMARY.md` - Complete feature list
- `TESTING.md` - Testing procedures
- `QUICKSTART.md` - This file

### Resources

- Next.js: https://nextjs.org/docs
- MongoDB: https://docs.mongodb.com
- Vercel: https://vercel.com/docs
- Stripe: https://stripe.com/docs

### Community

- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Stack Overflow: Tag with `nextjs` `mongodb` `pos`

---

## What's Next?

### Week 1: Get Comfortable

- [ ] Set up development environment
- [ ] Create test data
- [ ] Explore all features
- [ ] Customize branding

### Week 2: Production Ready

- [ ] Deploy to Vercel
- [ ] Set up MongoDB Atlas
- [ ] Configure domain
- [ ] Test with real products

### Week 3: Advanced Features

- [ ] Add Stripe integration
- [ ] Enhance reports
- [ ] Add user management
- [ ] Implement receipt printing

### Month 2+: Scale

- [ ] Add more products
- [ ] Train staff
- [ ] Monitor performance
- [ ] Collect feedback
- [ ] Plan enhancements

---

## Success! 🎉

You now have a complete, production-ready SaaS POS system!

**Start now:**

```powershell
cd c:\pos-saas
npm run dev
start http://localhost:3000
```

**Happy selling! 🛒💰📊**
