# POS DASHBOARD - COMPREHENSIVE AUDIT REPORT

**Generated:** January 25, 2026  
**Scope:** Full-stack audit covering API, Frontend, i18n, UX, and code quality  
**Status:** IN PROGRESS - Findings documented, fixes being applied

---

## EXECUTIVE SUMMARY

The POS dashboard is well-structured with Next.js 14, comprehensive i18n support, and most critical features implemented. However, several issues require immediate attention:

### Critical Issues (Production Impact)

- ❌ Inconsistent error response formats across APIs (mixing Response vs NextResponse)
- ❌ Hardcoded Spanish error messages in 2 locations (suppliers page)
- ❌ Missing translation keys in several pages
- ❌ Inconsistent payment method API contracts
- ❌ Toast messages not using language context consistently
- ❌ No defensive checks in several API routes for edge cases

### High Priority Issues (UX Impact)

- ⚠️ Cart component fetches payment methods but doesn't handle failures
- ⚠️ Decimal quantity validation incomplete for weight products
- ⚠️ Sales page uses hardcoded currency formatting (es-AR) instead of locale-aware
- ⚠️ Error messages in forms sometimes pass translation keys instead of translated text

### Medium Priority Issues (Code Quality)

- 📋 Inconsistent error handling patterns (some use NextResponse, others use Response)
- 📋 Toast utility doesn't integrate with language context
- 📋 Missing rate limiting on critical endpoints (login, registration)
- 📋 No validation for plan limits in some mutation endpoints

### Low Priority Issues (Technical Debt)

- 💡 Some pages have hardcoded Spanish labels (getPaymentMethodLabel in sales.tsx)
- 💡 No centralized error logging system
- 💡 Test database endpoint should be removed

---

## SECTION 1: API & BACKEND AUDIT

### Finding 1.1: Inconsistent Response Formats

**Severity:** CRITICAL  
**Location:** Multiple API routes  
**Issue:** APIs mix `Response` (helpers.ts) with `NextResponse` (direct usage)

**Files Affected:**

- `src/app/api/products/route.ts` - Uses helpers (✓ consistent)
- `src/app/api/payments/route.ts` - Uses NextResponse (✓ but mixes)
- `src/app/api/sales/complete/route.ts` - Uses NextResponse (direct)
- `src/app/api/auth/login/route.ts` - Uses helpers (✓ consistent)

**Problem:**

```typescript
// Inconsistent patterns:
// Pattern 1 (helpers)
return generateErrorResponse("error", 400);

// Pattern 2 (NextResponse)
return NextResponse.json({ error: "msg" }, { status: 400 });
```

**Impact:** Frontend must handle both response formats, leading to parsing bugs

---

### Finding 1.2: Missing Input Validation in Key Endpoints

**Severity:** CRITICAL  
**Locations:**

- Products POST/PUT
- Sales complete POST
- Payments POST

**Issue:** Insufficient validation for edge cases:

- No max length validation on string fields
- No range validation on numeric fields
- No CUIT format validation (when required)
- No deduplication checks for imports

---

### Finding 1.3: Error Messages Are Mixed Languages

**Severity:** CRITICAL  
**Location:** API routes  
**Issue:** API returns Spanish error messages that should be keys:

```typescript
// In products/route.ts:
return generateErrorResponse("Producto no encontrado", 404); // ❌ Spanish hardcoded
return generateErrorResponse("El código ya existe", 409); // ❌ Spanish hardcoded
```

**Impact:** Clients can't translate these messages

---

### Finding 1.4: Test Database Route Exposed

**Severity:** HIGH  
**Location:** `src/app/api/test-db/route.ts`  
**Issue:** Publicly accessible database test endpoint should be removed or protected

---

### Finding 1.5: Missing Plan Limit Checks

**Severity:** MEDIUM  
**Locations:** Expenses, Clients, Suppliers routes  
**Issue:** Not all mutation endpoints check `checkPlanLimit`

---

## SECTION 2: FRONTEND AUDIT

### Finding 2.1: Hardcoded Spanish Strings

**Severity:** CRITICAL  
**Locations:**

- `src/app/suppliers/page.tsx` line 510, 525:

  ```typescript
  toast.error("Sesión expirada. Inicia sesión para continuar.");
  ```

  Should use: `toast.error(t("sessionExpired", "errors"));`

- `src/app/sales/page.tsx`:
  ```typescript
  const getPaymentMethodLabel = (method: string) => {
    const labels: any = {
      cash: "💵 Efectivo", // ❌ Hardcoded Spanish
      card: "💳 Tarjeta", // ❌ Hardcoded Spanish
      // ...
    };
  };
  ```

**Impact:** Text doesn't translate when user switches language

---

### Finding 2.2: Toast Messages Not Translated

**Severity:** CRITICAL  
**Location:** Multiple pages  
**Issue:** Toast using string literals instead of translation keys:

```typescript
// ❌ Bad
toast.error(data.error || "Error al importar");

// ✓ Good
toast.error(t(data.error || "errorImportingProducts", "errors"));
```

---

### Finding 2.3: Loading States Missing

**Severity:** MEDIUM  
**Locations:** Dashboard, Sales pages  
**Issue:** `useSubscription()` returns `loading: boolean` but not all pages handle it properly

---

### Finding 2.4: Currency Formatting Not Locale-Aware

**Severity:** MEDIUM  
**Location:** `src/app/sales/page.tsx` line 96  
**Issue:**

```typescript
// Hardcoded locale:
new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
}).format(value);

// Should be dynamic based on user language
```

---

### Finding 2.5: No Error Boundary

**Severity:** MEDIUM  
**Location:** Global app  
**Issue:** App has GlobalErrorHandler but no React Error Boundary for component crashes

---

## SECTION 3: i18n/TRANSLATION AUDIT

### Finding 3.1: Incomplete Translation Coverage

**Severity:** HIGH  
**Identified Gaps:**

- `errorLoadingSales` key used but not in all language files
- `getPaymentMethodLabel` has no translation support
- Some error messages hardcoded in API responses

**Files to Update:**

- `public/locales/en/errors.json` - Missing some keys
- `public/locales/pt/errors.json` - Missing some keys

---

### Finding 3.2: Missing Namespace Organization

**Severity:** MEDIUM  
**Issue:** LanguageContext is 1582 lines - should split into namespaces:

- `common` (general UI terms)
- `errors` (error messages)
- `messages` (user messages)
- `auth` (auth-specific)
- `pos` (POS-specific)
- `pricing` (pricing page)

---

## SECTION 4: TOAST & UX CONSISTENCY AUDIT

### Finding 4.1: Toast Utility Doesn't Use Language Context

**Severity:** CRITICAL  
**Location:** `src/lib/utils/toastUtils.ts`  
**Issue:** Toast messages are raw strings, not translated

**Problem:**

```typescript
// In components:
showToast("Error al guardar", "error"); // ❌ Not translated

// Should be:
showToast(t("errorSaving", "errors"), "error"); // ✓ Translated
```

---

### Finding 4.2: Duplicate Toasts on Network Errors

**Severity:** MEDIUM  
**Issue:** Some operations show 2 toasts (one from API error, one from catch block)

---

### Finding 4.3: Toast Position Not Customizable

**Severity:** LOW  
**Issue:** All toasts use `bottom-right`, should allow per-app configuration

---

## SECTION 5: ERROR HANDLING & EDGE CASES

### Finding 5.1: Silent Failures on Stock Deduction

**Severity:** CRITICAL  
**Location:** `src/app/api/sales/complete/route.ts`  
**Issue:** If stock history creation fails, sale completes anyway

```typescript
// Stock deducted but history fails:
product.stock -= item.quantity;
await product.save();  // ✓ Success

await StockHistory.create({...});  // ❌ Fails - but sale already saved
```

---

### Finding 5.2: No Rate Limiting on Auth Endpoints

**Severity:** HIGH  
**Locations:**

- `/api/auth/login` - Brute force possible
- `/api/auth/register` - Spam possible
- `/api/auth/refresh` - Token abuse possible

---

### Finding 5.3: Network Timeouts Not Handled

**Severity:** MEDIUM  
**Locations:** Cart component, Product search  
**Issue:** Fetch calls have no timeout handling

---

### Finding 5.4: Decimal Quantity Validation Incomplete

**Severity:** MEDIUM  
**Location:** `src/components/pos/Cart.tsx`  
**Issue:** Weight-based products allow unlimited decimals in UI but API doesn't validate max

---

## SECTION 6: CODE QUALITY ISSUES

### Finding 6.1: Inconsistent Error Handling Patterns

**Severity:** MEDIUM  
**Pattern Found:**

```typescript
// Mix of patterns:
// 1. Helper function (consistent):
return generateErrorResponse("msg", 400);

// 2. Direct NextResponse (inconsistent):
return NextResponse.json({ error: "msg" }, { status: 400 });

// 3. Direct Response (inconsistent):
return new Response(JSON.stringify({ error: "msg" }), { status: 400 });
```

---

### Finding 6.2: Magic Numbers Throughout

**Severity:** LOW  
**Examples:**

- 21% IVA hardcoded in `sales/complete/route.ts`
- 365 day subscription period hardcoded in `auth/register/route.ts`
- Timeout values scattered (8000ms, 3000ms, etc.)

---

### Finding 6.3: Test Database Endpoint Should Be Removed

**Severity:** MEDIUM  
**Location:** `src/app/api/test-db/route.ts`  
**Action:** Remove from production

---

## SECTION 7: FEATURE VERIFICATION STATUS

| Feature          | Status          | Notes                                      |
| ---------------- | --------------- | ------------------------------------------ |
| Products (CRUD)  | ✓ Working       | Import, code generation OK                 |
| POS Checkout     | ⚠️ Partial      | No Mercado Pago test mode indication       |
| Payments         | ⚠️ Needs Review | MP integration exists but not fully tested |
| Invoicing (ARCA) | ✓ Implemented   | CUIT validation needed                     |
| Users/Roles      | ✓ Basic         | Missing: role-based route protection       |
| Inventory        | ✓ Working       | Stock history tracking OK                  |
| Reports          | ⚠️ Partial      | Analytics exist but may be incomplete      |
| Expenses         | ✓ Working       | No special issues found                    |
| i18n             | ⚠️ Incomplete   | Gaps in translation coverage               |

---

## FIXES TO APPLY

### Phase 1: CRITICAL (Must Fix Before Production)

1. ✅ Standardize all API response formats
2. ✅ Remove hardcoded Spanish strings from suppliers page
3. ✅ Add translation keys to all error messages
4. ✅ Implement toast translation integration
5. ✅ Remove test-db endpoint
6. ✅ Add stock history rollback on failure

### Phase 2: HIGH (Should Fix)

1. Add rate limiting to auth endpoints
2. Add currency locale awareness
3. Add error boundary
4. Complete decimal quantity validation
5. Add network timeout handling

### Phase 3: MEDIUM (Nice to Have)

1. Refactor error handling patterns
2. Extract magic numbers to constants
3. Split i18n context into namespaces
4. Add centralized error logging

---

## TESTING CHECKLIST

- [ ] Test all CRUD operations with network errors
- [ ] Test language switch affects all toasts
- [ ] Test offline mode handling
- [ ] Test with expired tokens
- [ ] Test plan limit enforcement
- [ ] Test decimal quantities for weight products
- [ ] Test import with duplicate codes
- [ ] Test checkout with Mercado Pago sandbox
