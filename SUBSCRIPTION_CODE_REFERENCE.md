# Subscription System - Code Reference & Maintenance Guide

## File Locations

### Frontend

```
src/app/business-config/page.tsx          - Main page component
```

### Backend

```
src/app/api/plans/route.ts                - GET plans
src/app/api/subscription/route.ts         - GET current subscription (existing)
src/app/api/subscription/upgrade/route.ts - POST plan upgrade
src/app/api/business-config/route.ts      - GET/PUT business config (existing)
```

## Key Functions

### Frontend - BusinessConfigPage Component

#### 1. fetchPlans()

Fetches all available plans from the server

```typescript
const fetchPlans = async () => {
  const response = await fetch("/api/plans");
  const data = await response.json();
  setPlans(data.data.plans);
};
```

#### 2. fetchSubscription()

Gets the user's current subscription status

```typescript
const fetchSubscription = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch("/api/subscription", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  setCurrentSubscription(data.data.subscription);
};
```

#### 3. handleSubscribe(planId)

Upgrades or downgrades the subscription plan

```typescript
const handleSubscribe = async (planId: string) => {
  if (currentSubscription?.planId === planId) {
    toast.info("Ya estás suscrito a este plan");
    return;
  }

  setSubscribing(true);
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch("/api/subscription/upgrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId }),
    });

    if (response.ok) {
      const plan = plans.find((p) => p.id === planId);
      toast.success(`¡Suscripción actualizada a ${plan?.name}!`);
      fetchSubscription(); // Refresh subscription state
    }
  } finally {
    setSubscribing(false);
  }
};
```

### Backend - API Routes

#### 1. /api/plans Route

Returns available subscription plans

```typescript
// GET /api/plans
const PLANS = [
  {
    id: "FREE",
    name: "Gratuito",
    price: 0,
    features: { maxProducts: 100, maxUsers: 2, ... },
    limits: ["100 productos", "2 usuarios"],
    popular: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: 19990,
    features: { maxProducts: 999999, maxUsers: 999999, ... },
    limits: ["∞ productos", "∞ usuarios", "✓ Logo"],
    popular: true,
  },
];

export async function GET(req: NextRequest) {
  return generateSuccessResponse({ plans: PLANS });
}
```

#### 2. /api/subscription/upgrade Route

Handles plan upgrades/downgrades

```typescript
// POST /api/subscription/upgrade
// Body: { planId: "PRO" }

export async function POST(req: NextRequest) {
  const authResult = await authMiddleware(req);
  if (!authResult.authorized) {
    return generateErrorResponse("Unauthorized", 401);
  }

  const { businessId } = authResult.user!;
  const { planId } = await req.json();

  // Validate plan
  if (!PLANS[planId]) {
    return generateErrorResponse("Invalid plan ID", 400);
  }

  // Update subscription in DB
  const subscription = await Subscription.findOneAndUpdate(
    { businessId },
    {
      planId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      features: PLANS[planId].features,
    },
    { upsert: true, new: true },
  );

  return generateSuccessResponse({
    message: `Plan upgraded to ${PLANS[planId].name}`,
    subscription,
  });
}
```

## UI Components Breakdown

### Plans Section

```tsx
<div className="p-5 space-y-4">
  {plans.map((plan) => (
    <div
      key={plan.id}
      className={`p-4 rounded-lg border-2 transition-all ${
        currentSubscription?.planId === plan.id
          ? "border-purple-600/60 bg-purple-900/30"
          : "border-slate-700/50 bg-slate-800/30"
      }`}
    >
      {/* Plan content */}
      <button onClick={() => handleSubscribe(plan.id)}>
        {currentSubscription?.planId === plan.id
          ? "Plan Actual"
          : "Click para suscribirse →"}
      </button>
    </div>
  ))}
</div>
```

### Ticket Preview

```tsx
<div className="w-80 bg-black text-green-400 rounded-lg font-mono p-4">
  <p className="font-bold text-sm">{formData.businessName.toUpperCase()}</p>
  <div className="text-xs text-green-600 space-y-0.5">
    {formData.address && <p>Dirección del negocio</p>}
    {formData.phone && <p>Tel: {formData.phone}</p>}
    {formData.email && <p>{formData.email}</p>}
    {formData.website && <p>{formData.website}</p>}
    {formData.cuitRucDni && <p>CUIT: {formData.cuitRucDni}</p>}
  </div>
  {/* More ticket details */}
  <div className="text-xs text-green-600 whitespace-pre-wrap">
    {formData.ticketMessage}
  </div>
</div>
```

## State Management

### Key States

```typescript
const [plans, setPlans] = useState<Plan[]>([]);
const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
const [subscribing, setSubscribing] = useState(false);
const [formData, setFormData] = useState<BusinessConfig>({...});
```

### State Update Flow

```
Component Mounts
    ↓
fetchPlans() → setPlans()
fetchSubscription() → setCurrentSubscription()
fetchBusinessConfig() → setFormData()
    ↓
Render with data
    ↓
User clicks Subscribe
    ↓
handleSubscribe() → setSubscribing(true)
    ↓
POST /api/subscription/upgrade
    ↓
fetchSubscription() → setCurrentSubscription(updated)
setSubscribing(false)
    ↓
Button updates to "Plan Actual"
```

## Common Modifications

### Adding a New Plan

1. Add to `PLANS` constant in `/api/plans/route.ts` and `/api/subscription/upgrade/route.ts`:

```typescript
{
  id: "BUSINESS",
  name: "Negocio",
  price: 49990,
  billing: "/mes",
  description: "Para negocios en crecimiento",
  features: { maxProducts: 999999, maxUsers: 50, ... },
  limits: ["∞ productos", "50 usuarios"],
  popular: false,
}
```

2. Plan will automatically show in the UI

### Changing Plan Pricing

1. Update `price` in `PLANS` object
2. Changes reflect immediately on next page load

### Modifying Plan Features

1. Update `features` object in `PLANS`
2. Features automatically used in subscription creation
3. Use `currentSubscription.features` in other parts of app to enforce limits

### Adding Feature Enforcement

```typescript
// Check if user's plan allows feature
const userPlan = currentSubscription?.planId;
const canCustomizeBranding = currentSubscription?.features?.customBranding;

if (!canCustomizeBranding) {
  toast.error("Esta funcionalidad requiere el plan Pro");
  return;
}
```

## Error Scenarios & Handling

### Scenario 1: User Not Authenticated

```
GET /api/subscription (no token)
↓
Response: { error: "Unauthorized", code: 401 }
↓
Frontend: Redirect to /auth/login
```

### Scenario 2: Invalid Plan ID

```
POST /api/subscription/upgrade { planId: "INVALID" }
↓
Response: { error: "Invalid plan ID", code: 400 }
↓
Frontend: toast.error("Error al actualizar suscripción")
```

### Scenario 3: Already on Same Plan

```
User on PRO, clicks PRO subscribe again
↓
handleSubscribe checks: currentSubscription?.planId === plan.id
↓
Shows: toast.info("Ya estás suscrito a este plan")
↓
No API call made
```

## Performance Considerations

### Optimization Already Implemented

- Single API call per plan load
- Subscription cached in state
- Button disabled during request
- No duplicate API calls

### Future Optimizations

- Cache plans in localStorage (rarely change)
- Debounce any form inputs
- Consider React Query for state management

## Testing

### Manual Test Cases

1. Load page → All plans visible
2. Check current subscription shows correctly
3. Click subscribe → Updates button
4. Refresh page → Plan persists
5. Switch to different plan → Updates
6. No network → Error toast shows

### API Testing (cURL)

```bash
# Get plans
curl http://localhost:3000/api/plans

# Get subscription
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:3000/api/subscription

# Upgrade plan
curl -X POST http://localhost:3000/api/subscription/upgrade \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"planId":"PRO"}'
```

## Troubleshooting

### Problem: Plans not showing

**Solution:** Check if `/api/plans` endpoint is responding correctly

```bash
curl http://localhost:3000/api/plans
```

### Problem: Subscription not updating

**Solution:** Check authentication token in localStorage

```javascript
console.log(localStorage.getItem("accessToken"));
```

### Problem: Button stuck in "Procesando..."

**Solution:** Check browser console for API errors, check network tab

### Problem: Ticket preview not updating

**Solution:** Check if formData state is being set correctly

```javascript
console.log(formData);
```

## Related Documentation

- See `SUBSCRIPTION_WORKFLOW.md` for complete API documentation
- See `BUSINESS_CONFIG_IMPLEMENTATION.md` for implementation summary
