# Business Configuration System - Complete Workflow

## Overview

Complete backend workflow for the business configuration form with database persistence, authentication, and real-time UI updates.

## System Architecture

```
FRONTEND (business-config/page.tsx)
    ↓
    ├─ User fills form
    ├─ Click "Guardar Configuración"
    └─ handleSaveConfig() called
        ↓
API ENDPOINT (/api/business-config)
    ↓
    ├─ Authentication check
    ├─ Validation
    ├─ Database operation (upsert)
    └─ Response with data
        ↓
FRONTEND (Response)
    ↓
    ├─ Toast notification
    ├─ Update form state
    ├─ Ticket preview updates
    └─ Button state reset
```

## Database Schema

### Business Collection

```typescript
{
  _id: ObjectId,
  name: string (required),           // Nombre del Negocio
  owner: ObjectId (ref: User),       // Link to user who owns this business
  email: string (required),          // Email del negocio
  phone?: string,                    // Teléfono
  address?: string,                  // Dirección
  website?: string,                  // Sitio Web
  cuitRucDni?: string,               // CUIT/RUC/DNI
  ticketMessage?: string,            // Mensaje de Pie de Ticket
  city?: string,                     // Ciudad
  country?: string,                  // País
  subscriptionId?: ObjectId (ref: Subscription),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoint Specifications

### GET /api/business-config

**Purpose:** Fetch current business configuration

**Authentication:** Required (Bearer token)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "businessName": "MI NEGOCIO",
    "address": "Av. San Martin 1234, CABA",
    "phone": "011 1234-5678",
    "email": "info@minegocio.com",
    "website": "www.minegocio.com",
    "cuitRucDni": "20-12345678-9",
    "ticketMessage": "¡GRACIAS POR SU COMPRA!\nVuelva pronto"
  }
}
```

**Behavior:**

- Fetches business config for authenticated user
- If no business exists, creates default config
- Default business auto-created with:
  - name: "MI NEGOCIO"
  - email: "info@minegocio.com"
  - Default placeholder values
- Returns all fields formatted for UI

### POST /api/business-config

**Purpose:** Save/Update business configuration

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "businessName": "string (required)",
  "address": "string",
  "phone": "string",
  "email": "string (required)",
  "website": "string",
  "cuitRucDni": "string",
  "ticketMessage": "string"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "businessName": "MI NEGOCIO",
    "address": "Av. San Martin 1234, CABA",
    "phone": "011 1234-5678",
    "email": "info@minegocio.com",
    "website": "www.minegocio.com",
    "cuitRucDni": "20-12345678-9",
    "ticketMessage": "¡GRACIAS POR SU COMPRA!\nVuelva pronto"
  }
}
```

**Error Responses:**

- **400:** Missing required fields (businessName or email)
- **401:** Unauthorized (no token or invalid token)
- **500:** Database error

**Behavior:**

- Validates required fields (businessName, email)
- Finds business by user
- Updates if exists, creates if doesn't (upsert)
- Updates timestamps
- Returns updated data

## Frontend Component State Management

### State Variables

```typescript
const [formData, setFormData] = useState<BusinessConfig>({
  businessName: "MI NEGOCIO",
  address: "Dirección del negocio",
  phone: "(sin teléfono)",
  email: "correo@ejemplo.com",
  website: "www.minegocio.com",
  cuitRucDni: "00-00000000-0",
  ticketMessage: "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
});

const [savingConfig, setSavingConfig] = useState(false);
const [configSaved, setConfigSaved] = useState(false);
```

### handleSaveConfig Function

```typescript
const handleSaveConfig = async () => {
  // 1. Validation
  if (!formData.businessName || !formData.email) {
    toast.error("El nombre del negocio y email son requeridos");
    return;
  }

  // 2. Set loading state
  setSavingConfig(true);

  try {
    // 3. Get auth token
    const token = localStorage.getItem("accessToken");

    // 4. Make API request
    const response = await fetch("/api/business-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    // 5. Handle response
    if (response.ok) {
      const data = await response.json();
      setFormData(data.data); // Update form with saved data
      setConfigSaved(true); // Show success indicator
      toast.success("✅ Configuración guardada exitosamente");
      setTimeout(() => setConfigSaved(false), 3000);
    } else {
      const error = await response.json();
      toast.error(error.error || "Error al guardar la configuración");
    }
  } catch (error) {
    console.error("Error saving config:", error);
    toast.error("Error al guardar la configuración");
  } finally {
    setSavingConfig(false); // Reset loading state
  }
};
```

## User Flow

### Step 1: Page Load

```
User navigates to /business-config
    ↓
useEffect triggers
    ├─ Check authentication
    ├─ fetchPlans()
    ├─ fetchSubscription()
    ├─ fetchBusinessConfig() ← Gets current config or creates default
    └─ setLoading(false)
    ↓
Page renders with form filled with:
    - Current business data if exists
    - OR default placeholder data
```

### Step 2: User Modifies Form

```
User types in form fields
    ↓
onChange handlers update state
    ├─ setFormData({ ...formData, field: value })
    └─ Ticket preview updates in real-time
```

### Step 3: User Saves Config

```
User clicks "Guardar Configuración"
    ↓
handleSaveConfig() called
    ├─ Validate: businessName and email required
    ├─ setSavingConfig(true)
    ├─ Button shows "Guardando..."
    ├─ POST to /api/business-config
    ├─ Wait for response
    ├─ setSavingConfig(false)
    ├─ Update form state with saved data
    ├─ Show success toast
    └─ Ticket preview reflects changes
```

### Step 4: Data Persistence

```
API receives POST request
    ↓
    ├─ Extract userId from token
    ├─ Find business by owner
    ├─ Upsert (update or insert):
    │   ├─ name: businessName
    │   ├─ email
    │   ├─ phone
    │   ├─ address
    │   ├─ website
    │   ├─ cuitRucDni
    │   ├─ ticketMessage
    │   └─ Update timestamps
    ├─ Save to MongoDB
    └─ Return updated data
    ↓
Response sent to frontend
    ↓
Frontend updates state
    ↓
UI reflects changes
```

## Field Mapping

### Form Fields → Database Fields → API Response

| Form Field               | Input Type | DB Field      | Required | Notes                 |
| ------------------------ | ---------- | ------------- | -------- | --------------------- |
| Nombre del Negocio       | text       | name          | ✅ YES   | Business name         |
| Dirección                | text       | address       | ❌       | Street address        |
| Teléfono                 | text       | phone         | ❌       | Phone number          |
| Email                    | email      | email         | ✅ YES   | Email address         |
| Sitio Web                | text       | website       | ❌       | Website URL           |
| CUIT/RUC/DNI             | text       | cuitRucDni    | ❌       | Tax ID                |
| Mensaje de Pie de Ticket | textarea   | ticketMessage | ❌       | Ticket footer message |

## Ticket Preview Integration

### Real-time Updates

The ticket preview on the right updates automatically as form values change:

```typescript
// In render section:
<div className="text-green-500">
  <p className="font-bold text-sm mb-1">
    {formData.businessName.toUpperCase()}
  </p>
</div>

<div className="text-xs text-green-600 space-y-0.5 mb-2">
  {formData.address && <p>{formData.address}</p>}
  {formData.phone && <p>Tel: {formData.phone}</p>}
  {formData.email && <p>{formData.email}</p>}
  {formData.website && <p>{formData.website}</p>}
  {formData.cuitRucDni && <p>CUIT: {formData.cuitRucDni}</p>}
</div>

<div className="text-xs text-green-600 whitespace-pre-wrap">
  {formData.ticketMessage}
</div>
```

Changes reflect immediately without saving.

## Error Handling

### Validation Errors

**Missing Required Fields:**

```
User clicks save with empty businessName or email
    ↓
Toast: "El nombre del negocio y email son requeridos"
    ↓
savingConfig remains false
    ↓
User can retry with valid data
```

### Network Errors

```
Network request fails
    ↓
catch block triggered
    ↓
Toast: "Error al guardar la configuración"
    ↓
savingConfig set to false
    ↓
Button re-enabled for retry
```

### Server Errors

```
API returns error response (400, 401, 500)
    ↓
Response parsed as JSON
    ↓
Toast: error.error message or generic message
    ↓
savingConfig set to false
    ↓
Button re-enabled for retry
```

## Authentication Flow

### Token Usage

```
1. User logs in → accessToken stored in localStorage
2. GET /api/business-config:
   - Extract token: localStorage.getItem("accessToken")
   - Pass in Authorization header: `Bearer ${token}`
   - authMiddleware extracts userId from token
   - API queries by owner: userId

3. POST /api/business-config:
   - Same token handling
   - Updates business owned by this userId
   - Prevents users from modifying others' configs
```

### Token Validation (Backend)

```typescript
const authResult = await authMiddleware(req);
if (!authResult.authorized) {
  return generateErrorResponse("Unauthorized", 401);
}
const { userId } = authResult.user!;
```

## Database Operations

### GET Operation

```typescript
// Find business by owner (userId from token)
let business = await Business.findOne({
  $or: [{ _id: businessId }, { owner: userId }],
}).lean();

// If not found, create default
if (!business) {
  const newBusiness = new Business({
    name: "MI NEGOCIO",
    owner: userId,
    email: "info@minegocio.com",
    // ... other defaults
  });
  await newBusiness.save();
}
```

### POST Operation (Upsert)

```typescript
// Update existing or create new (upsert)
let business = await Business.findOneAndUpdate(
  { $or: [{ _id: businessId }, { owner: userId }] },
  {
    name: businessName,
    email,
    phone: phone || "",
    address: address || "",
    website: website || "",
    cuitRucDni: cuitRucDni || "",
    ticketMessage: ticketMessage || "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
    owner: userId,
  },
  { new: true, upsert: true }, // Return new doc, create if not exists
);
```

## Testing Checklist

### Frontend Tests

- [ ] Form loads with default or saved data
- [ ] Each field updates in real-time
- [ ] Ticket preview updates with form changes
- [ ] Save button is enabled when form has data
- [ ] Save button shows "Guardando..." while saving
- [ ] Success toast appears after save
- [ ] Error toast appears if required fields empty
- [ ] Error toast appears if save fails

### Backend Tests

- [ ] GET returns 401 without token
- [ ] GET creates default business if none exists
- [ ] GET returns all business fields
- [ ] POST returns 401 without token
- [ ] POST returns 400 if businessName or email missing
- [ ] POST creates new business if none exists
- [ ] POST updates existing business
- [ ] POST only updates for authenticated user's business

### Integration Tests

- [ ] User can fill form and save changes
- [ ] Changes persist after page reload
- [ ] Multiple users don't interfere with each other's data
- [ ] Ticket preview shows saved data after reload

## Production Checklist

- [ ] All API endpoints have proper error handling
- [ ] Database indexes created for owner queries
- [ ] Authentication middleware properly validates tokens
- [ ] Input validation on both frontend and backend
- [ ] Toast notifications working correctly
- [ ] Form state properly reset after successful save
- [ ] Loading states prevent duplicate submissions
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Performance optimized (no N+1 queries)

## Future Enhancements

1. **Logo Upload** - Allow business logo upload and storage
2. **Multiple Locations** - Support multiple business locations
3. **Branding Customization** - Custom colors, fonts for tickets
4. **Invoice Templates** - Customize invoice layout
5. **Email Notifications** - Send config changes via email
6. **Audit Trail** - Track config changes history
7. **Team Permissions** - Control who can edit config
8. **Business Hours** - Set operating hours display on tickets
9. **Tax Settings** - Configure tax rates and calculations
10. **Multi-currency** - Support different currencies per location
