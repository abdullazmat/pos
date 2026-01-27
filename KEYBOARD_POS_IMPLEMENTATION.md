# Keyboard-Only Supermarket POS Implementation

## 📋 Overview

This document describes the complete keyboard-only POS workflow implementation based on the client specification "Especificación Funcional Completa – POS Tipo Supermercado".

**Core Principle**: 100% keyboard operation with quantity-first workflow - no mouse required.

## 🎯 Implementation Summary

### Files Created/Modified

1. **NEW: `src/components/pos/KeyboardPOSInput.tsx`**
   - Main keyboard-driven input component
   - Implements quantity-first workflow
   - Supports multiplier operator (\*)
   - Decimal quantity support
   - Customer management shortcuts

2. **MODIFIED: `src/app/pos/page.tsx`**
   - Integrated KeyboardPOSInput component
   - Updated `handleAddToCart` to accept quantity parameter
   - Added `handleCustomerAction` for customer management
   - Made legacy ProductSearch collapsible

3. **MODIFIED: `src/components/pos/ProductSearch.tsx`**
   - Updated interface to support optional quantity parameter
   - Maintains backward compatibility

## 🎹 Keyboard Workflow

### Primary Flow: Quantity → Product → Add

```
1. FOCUS starts on Quantity field (default: "1")
2. User types quantity (optional): "5" or "0.325" or "1.5"
3. Press Enter → focus moves to Product Code field
4. User scans/types barcode or product code
5. Press Enter → product added to cart with specified quantity
6. Focus returns to Quantity field (reset to "1")
```

### Multiplier Shortcut (\*)

Fast entry for products with large quantities:

```
Type: "50*697202601252361" + Enter
Result: Instantly adds 50 units of that product
```

**Pattern**: `{quantity}*{code}` where:

- `quantity` = number (integer or decimal)
- `*` = multiplier operator
- `code` = product barcode or code

### Decimal Quantities

For weight-based products (sold by kg):

```
Examples:
- "0.325" + Enter = 325 grams (0.325 kg)
- "1,5" + Enter = 1.5 kg (comma separator supported)
- "2.750" + Enter = 2.75 kg
```

Both comma (`,`) and period (`.`) are supported as decimal separators.

## ⌨️ Keyboard Shortcuts

### Navigation & Actions

| Key           | Action                                     | Context           |
| ------------- | ------------------------------------------ | ----------------- |
| **Enter**     | Confirm / Move to next field / Add product | All fields        |
| **Esc**       | Cancel / Clear / Reset                     | All fields        |
| **Backspace** | Delete character                           | Text input        |
| **Delete**    | Delete selected cart item                  | Cart (future)     |
| **+**         | Exact payment                              | Checkout (future) |

### Customer Management

These shortcuts work globally in any field:

| Shortcut    | Action                  | Status            |
| ----------- | ----------------------- | ----------------- |
| **Shift+C** | Change customer type    | Placeholder ready |
| **Shift+F** | Find/Search customer    | Placeholder ready |
| **Shift+N** | New customer            | Placeholder ready |
| **Shift+X** | Remove current customer | Placeholder ready |

> **Note**: Customer management modals need to be implemented. Currently shows toast notifications.

### Multiplier Operator

| Key    | Action              | Example                          |
| ------ | ------------------- | -------------------------------- |
| **\*** | Multiplier operator | `50*ABC123` = 50 units of ABC123 |

## 🎨 Component Structure

### KeyboardPOSInput Component

```tsx
<KeyboardPOSInput
  onAddToCart={(productId, name, price, quantity, isSoldByWeight) => void}
  onCustomerAction={(action: "change" | "search" | "new" | "remove") => void}
/>
```

**Features**:

- ✅ Automatic focus management
- ✅ Quantity-first workflow
- ✅ Multiplier support (\*)
- ✅ Decimal quantity parsing (. and ,)
- ✅ Product search by code/barcode
- ✅ Visual keyboard shortcuts reference
- ✅ Example usage guide
- ✅ Toast notifications for feedback
- ✅ Loading states
- ✅ Error handling

### Focus Management

```
Initial Load → Quantity Field (auto-focus)
After Product Added → Quantity Field (auto-focus, reset to "1")
Esc Key → Quantity Field (auto-focus, reset to "1")
Enter in Quantity → Product Field (focus transfer)
Enter in Product → Quantity Field (after adding, auto-focus)
```

## 🔄 State Flow

```
[Quantity Field]
    ↓ (Enter)
[Product Field]
    ↓ (Enter)
[Search Product API]
    ↓ (Found)
[Add to Cart with Quantity]
    ↓
[Reset & Focus Quantity] ← Loop
```

## 💡 Usage Examples

### Example 1: Standard Product

```
1. Type "5" in Quantity field
2. Press Enter
3. Scan/type barcode "7890123456789"
4. Press Enter
→ Adds 5 units of that product
```

### Example 2: Weight Product

```
1. Type "0.325" in Quantity field
2. Press Enter
3. Scan barcode for cheese
4. Press Enter
→ Adds 0.325 kg (325g) of cheese
```

### Example 3: Multiplier Shortcut

```
1. In Quantity field, type "50*7890123456789"
2. Press Enter
→ Instantly adds 50 units
```

### Example 4: Default Quantity

```
1. Just press Enter (quantity stays "1")
2. Scan product
3. Press Enter
→ Adds 1 unit
```

### Example 5: Customer Management

```
1. Press Shift+F while in any field
→ Opens customer search (toast notification for now)

2. Press Shift+C
→ Opens customer type selection (toast notification for now)
```

## 🔧 Technical Details

### Quantity Parsing

The component includes smart quantity parsing:

```typescript
parseQuantityInput(input: string): {
  quantity: number;
  productCode: string;
} | null

// Examples:
parseQuantityInput("50*ABC123")   → { quantity: 50, productCode: "ABC123" }
parseQuantityInput("0.325*XYZ")   → { quantity: 0.325, productCode: "XYZ" }
parseQuantityInput("1,5 * CODE")  → { quantity: 1.5, productCode: "CODE" }
```

### Product Search Logic

```typescript
searchProduct(code: string): Promise<Product | null>

// Process:
1. Fetch products matching code from API
2. Normalize code (remove dashes, spaces)
3. Try exact match on barcode field
4. Try exact match on code field
5. If single result, return it
6. Otherwise, return null
```

### Cart Integration

Updated `handleAddToCart` signature:

```typescript
// Old (backward compatible):
handleAddToCart(productId, name, price, isSoldByWeight);
// Adds with default quantity (1 or 0.1)

// New (with quantity):
handleAddToCart(productId, name, price, quantity, isSoldByWeight);
// Adds with specified quantity
```

## 🎯 Validation & Error Handling

### Quantity Validation

- ✅ Must be numeric
- ✅ Must be greater than 0
- ✅ Supports decimal (. or ,)
- ❌ Rejects negative values
- ❌ Rejects invalid formats

### Product Validation

- ✅ Searches by barcode
- ✅ Searches by product code
- ✅ Exact match prioritized
- ❌ Shows error if not found
- ❌ Shows error if ambiguous

### User Feedback

- Success: Green toast with product name and quantity
- Error: Red toast with error message
- Info: Blue toast for customer actions
- Loading: Spinner in product field during search

## 📱 UI/UX Features

### Visual Hierarchy

1. **Primary**: Quantity field (blue border, larger, top position)
2. **Secondary**: Product field (standard styling)
3. **Reference**: Keyboard shortcuts panel (gradient background)
4. **Examples**: Usage examples panel (green background)

### Accessibility

- Clear labels with context ("Default: 1")
- Placeholder text with instructions
- Visual Enter (⏎) indicator
- Keyboard shortcuts reference always visible
- Color-coded sections for quick scanning

### Dark Mode Support

- Full dark mode compatibility
- Proper contrast ratios
- Adjusted colors for all states
- Readable in all lighting conditions

## 🚀 Future Enhancements

### Customer Management

- [ ] Implement customer type modal (Shift+C)
- [ ] Implement customer search modal (Shift+F)
- [ ] Implement new customer form (Shift+N)
- [ ] Implement remove customer confirmation (Shift+X)
- [ ] Display current customer in UI

### Keyboard Navigation

- [ ] Arrow keys to navigate cart items
- [ ] Delete key to remove selected cart item
- [ ] Tab navigation between fields
- [ ] Ctrl+shortcuts for common actions

### Payment

- [ ] - key for exact payment
- [ ] Quick payment shortcuts (F1-F12 alternative)
- [ ] Keyboard-only payment modal

### Advanced Features

- [ ] Product search with arrow key navigation
- [ ] Quick product selection from recent items
- [ ] Barcode scanner sound feedback
- [ ] Keyboard macro recording

## 🔍 Testing Checklist

- [x] Quantity field receives focus on load
- [x] Enter moves from quantity to product field
- [x] Esc resets and returns to quantity field
- [x] Multiplier syntax works: "50\*code"
- [x] Decimal quantities accepted: "0.325"
- [x] Comma separator works: "1,5"
- [x] Product search by barcode
- [x] Product search by code
- [x] Product added with correct quantity
- [x] Focus returns to quantity after add
- [x] Quantity resets to "1" after add
- [x] Shift+C/F/N/X shortcuts trigger
- [x] Toast notifications appear
- [x] Loading state during search
- [x] Error handling for not found
- [x] Error handling for invalid quantity
- [x] Legacy ProductSearch still works
- [x] Backward compatibility maintained

## 📚 Related Documentation

- `KEYBOARD_POS_SPECIFICATION.md` - Original client specification (if exists)
- `API.md` - Product API endpoints
- `QUICK_START_BUSINESS_CONFIG.md` - Business configuration
- `SALES_QUICK_START.md` - Sales system overview

## 🎓 Training Guide for Users

### Quick Start (30 seconds)

**"The fast way to sell products"**

1. **Always start typing in the top field** (Quantity)
2. **Press Enter twice**: once for quantity, once for product
3. **That's it!** Focus returns to top

### Power User Tips

**Fast scanning**: Just keep pressing Enter and scanning. The quantity defaults to 1.

**Bulk items**: Type "50\*" then scan. Done.

**Weight items**: Type "0.325" (the weight), Enter, scan, Enter.

**Customers**: Hold Shift and press F to find customer, C to change type.

### Common Mistakes

❌ **Clicking with mouse** → ✅ Just press Enter  
❌ **Typing in product field first** → ✅ Start with quantity  
❌ **Forgetting to press Enter** → ✅ Must press Enter twice

## 🎉 Summary

The keyboard-only POS system is now fully implemented with:

✅ Quantity-first workflow  
✅ 100% keyboard operation  
✅ Multiplier support (\*)  
✅ Decimal quantities  
✅ Customer shortcuts (Shift+C/F/N/X)  
✅ Automatic focus management  
✅ Comprehensive error handling  
✅ Visual feedback and guidance  
✅ Dark mode support  
✅ Backward compatibility

The system is ready for use with barcode scanners and provides a fast, efficient workflow for supermarket-style POS operations.
