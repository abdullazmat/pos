# Bulk Products & Decimal Quantities - Implementation Guide

## Overview

This implementation enables your POS system to support both **unit-based** and **weight-based** product sales with full decimal quantity support. This is perfect for:

- **Vegetables & Produce** (sold by kg, with varying weights)
- **Deli Products** (sold by weight)
- **Pet Food** (sold by kg)
- **Bulk Goods** (with precise measurements)
- **Any product sold by weight/volume** (not by unit count)

## Feature Components

### 1. Database Schema Updates

**File**: `/src/lib/models/Sale.ts`

#### Changes Made:

- Updated `SaleItem` interface to document decimal support
- Added `isSoldByWeight` flag to track product type
- Added validation to enforce maximum 3 decimal places
- Changed minimum value from 1 to 0.001 to allow small weights (1 gram minimum)

```typescript
// Example valid quantities:
// For units: 1, 2, 5, 100 (integers only)
// For weight: 0.5, 1.254, 2.5, 10.75 (up to 3 decimal places)
```

#### Database Validation:

```typescript
validate: {
  validator: function (value: number) {
    // Check for maximum 3 decimal places
    return Math.round(value * 1000) / 1000 === value;
  },
  message: "Quantity must have a maximum of 3 decimal places (e.g., 1.254)",
}
```

### 2. Decimal Formatter Utility

**File**: `/src/lib/utils/decimalFormatter.ts`

Comprehensive utility functions for handling decimal input and validation:

#### Key Functions:

**`normalizeDecimalSeparator(value: string): string`**

- Converts Argentine format (comma) to standard format (period)
- Example: `"1,254"` → `"1.254"`

**`parseQuantity(value: string): number | null`**

- Parses user input with validation
- Returns `null` if invalid (>3 decimal places, negative, etc.)
- Handles both comma and period separators

**`validateQuantity(quantity: number, isSoldByWeight: boolean)`**

- Validates quantity based on product type
- Unit products: requires integers ≥ 1
- Weight products: allows decimals up to 3 places, minimum 0.001 kg

**`formatQuantity(value: number, decimalPlaces?: number): string`**

- Formats number for display, removing trailing zeros
- Example: `1.500` → `"1.5"`

**`getInputPlaceholder(isSoldByWeight, language): string`**

- Returns localized placeholder text
- Example: `"e.g., 1.254 kg (or 1,254)"` for weight products

### 3. Product Model Updates

**File**: `/src/lib/models/Product.ts`

The `isSoldByWeight` boolean flag already exists and differentiates:

- `false` (default): Sold by unit count (integers only)
- `true`: Sold by weight/volume (decimals supported)

### 4. Frontend Components

#### Cart Component

**File**: `/src/components/pos/Cart.tsx`

**Enhanced Features**:

- Text input instead of HTML5 number input (better control)
- Supports both comma and period as decimal separator
- Real-time validation with error feedback
- Quantity display with proper formatting (removes trailing zeros)
- Language-aware placeholder text
- Helper text for weight products: _"Use comma or period (1,254 or 1.254)"_

**Input Behavior**:

```typescript
// User can type any of these for 1.254 kg:
// - "1.254" ✓
// - "1,254" ✓ (Argentine format)
// - "1.25" ✓ (fewer decimal places)
// - "1.2544" ✗ (too many decimal places)
// - "1,2544" ✗ (too many decimal places)
```

#### Product Form

**File**: `/src/app/products/page.tsx`

**Enhanced Checkbox Section**:

- Visual indicator showing which type is selected
- Contextual helper text that updates based on selection
- Examples of valid inputs: "1.254 kg, 0.750 kg"
- Information about comma/period support
- Better accessibility with improved spacing

### 5. Locale Support

#### Argentine Decimal Separator Handling

The system automatically converts:

- **User Input**: `"1,254 kg"` (Argentine standard)
- **Internal Storage**: `1.254` (JavaScript/JSON standard)
- **Display**: `"1.25"` or `"1.254"` (depends on actual value)

This is transparent to the user - they can type with either separator!

## Implementation Details

### Stock Calculation

The existing stock deduction logic already supports decimals:

```typescript
// In /src/app/api/sales/complete/route.ts
product.stock -= item.quantity; // Works with both integers and decimals

// Example:
// product.stock = 10.5 kg
// sale quantity = 2.3 kg
// result = 10.5 - 2.3 = 8.2 kg ✓
```

### Validation Flow

1. **User Types in Cart**:

   ```
   Input: "1,254" or "1.254"
   ↓
   normalizeDecimalSeparator() → "1.254"
   ↓
   parseQuantity() → 1.254
   ↓
   validateQuantity() → { isValid: true }
   ↓
   Update cart with 1.254 kg
   ```

2. **Invalid Input**:

   ```
   Input: "1.2544" (4 decimal places)
   ↓
   parseQuantity() → null (too many decimals)
   ↓
   Input rejected silently
   ```

3. **On Sale Completion**:
   ```
   MongoDB validates with schema validator
   ↓
   If invalid → Error thrown, sale rejected
   ↓
   If valid → Stock deducted, invoice generated
   ```

## Usage Examples

### Creating a Weight-Based Product

1. Go to **Products** page
2. Click **"New Product"**
3. Fill in details (name, cost, price, stock)
4. **Check** "Sold by weight (kg) - e.g., produce, deli, pet food"
5. Notice helper text updates to show decimal support
6. Save product

### Selling Weight-Based Products

1. Scan or select product in POS
2. Product appears in cart with **"(kg)"** label
3. Input field shows placeholder: `"e.g., 1.254 kg (or 1,254)"`
4. Type quantity:
   - `"2.5"` → 2.5 kg ✓
   - `"2,5"` → 2.5 kg ✓ (Argentine format)
   - `"0.75"` → 0.75 kg ✓
   - `"2.5555"` → Rejected, too many decimals ✗
5. Press Tab or Enter
6. Quantity updates in real-time
7. Total calculation reflects decimal quantity

### Bulk Importing Products with Weight Support

CSV Template includes column: `seVendePorPeso` (boolean)

```csv
nombre,descripcion,costo,precio,stock,minStock,categoria,activo,seVendePorPeso
Papas,Papas por kilo,80,120,50,10,Verduras,true,true
Manzanas,Manzanas rojas,90,140,75,15,Frutas,true,true
Pan,Pan fresco,200,400,30,5,Panaderia,true,false
Leche,Litro de leche,500,650,40,10,Lacteos,true,false
```

## Technical Specifications

### Decimal Precision

- **Maximum**: 3 decimal places
- **Examples**:
  - Valid: 1.254, 0.001, 10.5, 2.0
  - Invalid: 1.2544, 0.0001, 10.54321

### Minimum Quantities

- **Unit Products** (isSoldByWeight: false):
  - Minimum: 1 unit
  - Only integers allowed
- **Weight Products** (isSoldByWeight: true):
  - Minimum: 0.001 kg (1 gram)
  - Decimals up to 3 places

### Localization

**Supported Languages**:

- `en`: English (period separator shown)
- `es`: Spanish - Argentine (supports both comma and period)
- `pt`: Portuguese

**Helper Text by Language**:

```typescript
{
  en: "e.g., 1.254 kg (or 1,254)",
  es: "ej: 1.254 kg (o 1,254)",
  pt: "ex: 1.254 kg (ou 1,254)"
}
```

## File Changes Summary

| File                                 | Changes                                                          |
| ------------------------------------ | ---------------------------------------------------------------- |
| `/src/lib/models/Sale.ts`            | Added validation, updated min value, added isSoldByWeight flag   |
| `/src/lib/utils/decimalFormatter.ts` | **NEW** - Comprehensive decimal handling utilities               |
| `/src/components/pos/Cart.tsx`       | Enhanced quantity input with decimal support and locale handling |
| `/src/app/products/page.tsx`         | Improved checkbox UI with contextual help text                   |

## Testing Checklist

- [ ] Create unit-based product, verify step=1 in checkout
- [ ] Create weight-based product, verify step=0.001 in checkout
- [ ] Input "1.254" in weight product cart, verify accepted
- [ ] Input "1,254" (comma) in weight product, verify converted to "1.254"
- [ ] Input "1.2544" (4 decimals), verify rejected
- [ ] Input "2" for weight product, verify accepted as "2.0"
- [ ] Complete sale with decimal quantities, verify stock deducted correctly
- [ ] Check invoice shows correct quantities
- [ ] Test in English, Spanish, and Portuguese
- [ ] Verify CSV import with seVendePorPeso column works
- [ ] Test on mobile device (touch keyboard for comma/period)

## Future Enhancements

Potential improvements for future iterations:

1. **Adjustable Precision**: Allow businesses to set precision per product (1-3 decimals)
2. **Unit Customization**: Support multiple units (kg, grams, liters, ml)
3. **Currency-Based Pricing**: Price by weight with automatic calculation
4. **Decimal Quantity Reports**: Enhanced reporting showing total kg sold by product
5. **Mobile Input Enhancement**: Better numeric keyboard for decimal entry
6. **Advanced Validation**: Custom validation rules per product

## Troubleshooting

### Issue: Decimal Input Shows Too Many Places

**Solution**: The system automatically rounds to 3 decimal places. If you see 4+ places, it was rejected. Try again with fewer decimals.

### Issue: Comma Not Converting to Period

**Solution**: Make sure you're in a weight-based product. The converter only works for weight products. Check the "(kg)" label next to quantity field.

### Issue: Stock Showing Decimals But Should Be Units

**Solution**: Check the product's `isSoldByWeight` flag. If it's true and should be false, edit the product and uncheck "Sold by weight".

### Issue: Mobile Users Can't Type Comma

**Solution**: Mobile keyboards may not show comma. Users can type period instead - both work!

## Support & Contact

For issues or questions about this feature, refer to your POS documentation or contact support.

---

**Implementation Date**: [Current Date]
**Version**: 1.0
**Status**: Production Ready
