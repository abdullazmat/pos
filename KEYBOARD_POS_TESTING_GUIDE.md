# 🧪 Keyboard POS - Testing Guide

## Overview

This guide provides comprehensive testing procedures for the keyboard-only supermarket POS system.

## 🎯 Test Environment Setup

### Prerequisites

- [ ] Cash register is open
- [ ] Test products in database with barcodes
- [ ] Test products with weight-based pricing
- [ ] Barcode scanner connected (or keyboard for manual entry)
- [ ] Browser console open for debugging

### Test Products Required

Create these test products:

| Type     | Code     | Barcode         | Price     | Weight-based |
| -------- | -------- | --------------- | --------- | ------------ |
| Standard | TEST001  | 7890123456789   | $10.00    | No           |
| Weight   | CHEESE01 | 697202601252361 | $15.00/kg | Yes          |
| Bulk     | RICE50   | 1234567890123   | $1.50     | No           |

## ✅ Test Cases

### Test Suite 1: Basic Workflow

#### TC1.1: Default Quantity (1 unit)

**Steps:**

1. Open POS page
2. Verify focus is in Quantity field (blue border)
3. Press Enter (don't type anything)
4. Verify focus moves to Product field
5. Type or scan: `TEST001`
6. Press Enter
7. Verify product added with quantity 1
8. Verify focus returns to Quantity field
9. Verify Quantity field reset to "1"

**Expected:** ✅ 1 unit of TEST001 in cart

---

#### TC1.2: Custom Quantity (5 units)

**Steps:**

1. Type `5` in Quantity field
2. Press Enter
3. Type/scan `TEST001`
4. Press Enter

**Expected:** ✅ 5 units of TEST001 added to cart (or added to existing)

---

#### TC1.3: Decimal Quantity (Weight Product)

**Steps:**

1. Type `0.325` in Quantity field
2. Press Enter
3. Type/scan `CHEESE01`
4. Press Enter

**Expected:** ✅ 0.325 kg of CHEESE01 in cart, total = $15.00 \* 0.325 = $4.875

---

#### TC1.4: Decimal with Comma Separator

**Steps:**

1. Type `1,5` in Quantity field
2. Press Enter
3. Type/scan `CHEESE01`
4. Press Enter

**Expected:** ✅ 1.5 kg of CHEESE01 in cart

---

### Test Suite 2: Multiplier Operator

#### TC2.1: Basic Multiplier

**Steps:**

1. Type `50*TEST001` in Quantity field
2. Press Enter

**Expected:** ✅ 50 units of TEST001 added instantly (no need to go to product field)

---

#### TC2.2: Multiplier with Barcode

**Steps:**

1. Type `10*7890123456789` in Quantity field
2. Press Enter

**Expected:** ✅ 10 units added by barcode match

---

#### TC2.3: Multiplier with Decimal

**Steps:**

1. Type `0.5*CHEESE01` in Quantity field
2. Press Enter

**Expected:** ✅ 0.5 kg of CHEESE01 added

---

#### TC2.4: Multiplier with Spaces

**Steps:**

1. Type `25 * TEST001` in Quantity field (with spaces)
2. Press Enter

**Expected:** ✅ 25 units added (spaces should be handled)

---

### Test Suite 3: Keyboard Shortcuts

#### TC3.1: Escape Key in Quantity Field

**Steps:**

1. Type `99` in Quantity field
2. Press Esc

**Expected:** ✅ Quantity field clears to "1", focus stays in Quantity

---

#### TC3.2: Escape Key in Product Field

**Steps:**

1. Type `5` in Quantity field
2. Press Enter
3. Type `ABC` in Product field
4. Press Esc

**Expected:** ✅ Both fields reset, focus returns to Quantity field (reset to "1")

---

#### TC3.3: Shift+F (Find Customer)

**Steps:**

1. Press and hold Shift
2. Press F
3. Release both keys

**Expected:** ✅ Toast notification: "Search customer" appears

---

#### TC3.4: Shift+C (Change Customer Type)

**Steps:**

1. Press Shift+C

**Expected:** ✅ Toast notification: "Change customer type" appears

---

#### TC3.5: Shift+N (New Customer)

**Steps:**

1. Press Shift+N

**Expected:** ✅ Toast notification: "New customer" appears

---

#### TC3.6: Shift+X (Remove Customer)

**Steps:**

1. Press Shift+X

**Expected:** ✅ Toast notification: "Customer removed" appears

---

### Test Suite 4: Error Handling

#### TC4.1: Product Not Found

**Steps:**

1. Press Enter in Quantity field
2. Type `INVALIDCODE` in Product field
3. Press Enter

**Expected:** ✅ Red toast: "Product not found", Product field clears, focus stays in Product field

---

#### TC4.2: Invalid Quantity (Negative)

**Steps:**

1. Type `-5` in Quantity field
2. Press Enter
3. Type `TEST001`
4. Press Enter

**Expected:** ✅ Red toast: "Invalid quantity" or quantity rejected

---

#### TC4.3: Invalid Quantity (Zero)

**Steps:**

1. Type `0` in Quantity field
2. Press Enter
3. Type `TEST001`
4. Press Enter

**Expected:** ✅ Red toast: "Invalid quantity"

---

#### TC4.4: Empty Product Code

**Steps:**

1. Press Enter in Quantity field
2. Press Enter in Product field (without typing)

**Expected:** ✅ Toast: "Please enter a product code"

---

### Test Suite 5: Focus Management

#### TC5.1: Initial Focus

**Steps:**

1. Navigate to POS page
2. Observe which field is active

**Expected:** ✅ Quantity field has focus (blue border, cursor blinking)

---

#### TC5.2: Focus After Add

**Steps:**

1. Complete any product addition
2. Observe focus immediately after

**Expected:** ✅ Focus returns to Quantity field automatically

---

#### TC5.3: Focus Flow

**Steps:**

1. Tab key should NOT work (keyboard-only shortcuts instead)
2. Only Enter and Esc for navigation

**Expected:** ✅ Tab is ignored, Enter moves forward, Esc goes back

---

### Test Suite 6: Integration Tests

#### TC6.1: Add Multiple Products

**Steps:**

1. Add product A (qty 2)
2. Add product B (qty 1)
3. Add product A again (qty 3)

**Expected:** ✅ Cart shows:

- Product A: quantity = 5 (2+3)
- Product B: quantity = 1

---

#### TC6.2: Mixed Input Methods

**Steps:**

1. Add product using keyboard workflow
2. Add same product using legacy search (expanded)
3. Verify quantities combine

**Expected:** ✅ Both methods add to same cart item

---

#### TC6.3: Rapid Scanning

**Steps:**

1. Scan 10 products in quick succession (Enter, Scan, Enter, repeat)

**Expected:** ✅ All 10 products added correctly with quantity 1 each

---

#### TC6.4: Bulk Entry with Multiplier

**Steps:**

1. Type `100*TEST001` + Enter
2. Type `50*CHEESE01` + Enter (should fail - not weight product)
3. Type `2.5*CHEESE01` + Enter

**Expected:** ✅ First adds 100 units, third adds 2.5 kg

---

### Test Suite 7: Visual Feedback

#### TC7.1: Loading State

**Steps:**

1. Enter slow network mode (throttle to 3G)
2. Add product
3. Observe Product field during search

**Expected:** ✅ Spinner appears in Product field, field disabled during search

---

#### TC7.2: Success Toast

**Steps:**

1. Add any product successfully

**Expected:** ✅ Green toast appears with: "{ProductName} × {Qty} added to cart"

---

#### TC7.3: Field Highlighting

**Steps:**

1. Observe Quantity field when focused
2. Observe Product field when focused

**Expected:** ✅

- Quantity: Blue border (primary)
- Product: Green border on focus
- Clear visual distinction

---

### Test Suite 8: Edge Cases

#### TC8.1: Very Large Quantity

**Steps:**

1. Type `9999` in Quantity field
2. Add product

**Expected:** ✅ Accepts and adds 9999 units (or system max)

---

#### TC8.2: Very Small Decimal

**Steps:**

1. Type `0.001` in Quantity field
2. Add weight product

**Expected:** ✅ Accepts 0.001 kg (1 gram)

---

#### TC8.3: Long Barcode

**Steps:**

1. Scan/type 20-digit barcode

**Expected:** ✅ Handles correctly, searches and adds

---

#### TC8.4: Special Characters in Code

**Steps:**

1. Type `TEST-001` (with dash)
2. Product exists with code `TEST001` (without dash)

**Expected:** ✅ Normalizes and finds product (dash ignored)

---

#### TC8.5: Multiplier without Quantity

**Steps:**

1. Type `*TEST001` (star without number)

**Expected:** ✅ Treats as invalid or defaults to 1

---

#### TC8.6: Multiple Asterisks

**Steps:**

1. Type `5**TEST001`

**Expected:** ✅ Rejects or handles gracefully

---

### Test Suite 9: Compatibility

#### TC9.1: Legacy ProductSearch Still Works

**Steps:**

1. Expand "Advanced Search"
2. Use old search field
3. Click product card
4. Verify added to cart

**Expected:** ✅ Both new and old methods work

---

#### TC9.2: Cart Edit Compatibility

**Steps:**

1. Add product via keyboard
2. Edit quantity in cart manually
3. Add same product again via keyboard

**Expected:** ✅ Quantities combine correctly

---

### Test Suite 10: Performance

#### TC10.1: Response Time

**Steps:**

1. Measure time from Enter press to product added
2. With local products (no network delay)

**Expected:** ✅ < 100ms for product search and add

---

#### TC10.2: Consecutive Adds

**Steps:**

1. Add 50 different products rapidly

**Expected:** ✅ No lag, no missed entries, all products in cart

---

## 🐛 Bug Report Template

When you find a bug, report it like this:

```
**Bug ID:** KB-XXX
**Test Case:** TC2.3 - Multiplier with Decimal
**Severity:** High / Medium / Low
**Description:** [What went wrong]
**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:** [What should happen]
**Actual Result:** [What actually happened]
**Console Errors:** [Any errors in browser console]
**Screenshot:** [Attach if visual issue]
**Environment:**
- Browser: Chrome 121
- OS: Windows 11
- POS Version: 1.0
```

## 📊 Test Results Summary

| Suite            | Total  | Passed | Failed | Blocked | Pass Rate |
| ---------------- | ------ | ------ | ------ | ------- | --------- |
| Basic Workflow   | 4      | -      | -      | -       | -%        |
| Multiplier       | 4      | -      | -      | -       | -%        |
| Shortcuts        | 5      | -      | -      | -       | -%        |
| Error Handling   | 4      | -      | -      | -       | -%        |
| Focus Management | 3      | -      | -      | -       | -%        |
| Integration      | 4      | -      | -      | -       | -%        |
| Visual Feedback  | 3      | -      | -      | -       | -%        |
| Edge Cases       | 6      | -      | -      | -       | -%        |
| Compatibility    | 2      | -      | -      | -       | -%        |
| Performance      | 2      | -      | -      | -       | -%        |
| **TOTAL**        | **37** | -      | -      | -       | -%        |

## 🎯 Acceptance Criteria

The system is ready for production when:

- [ ] All HIGH priority test cases pass (100%)
- [ ] At least 95% of MEDIUM priority test cases pass
- [ ] No CRITICAL bugs remain
- [ ] Performance meets targets (< 100ms response)
- [ ] All keyboard shortcuts work as specified
- [ ] Focus management is flawless
- [ ] Error messages are clear and helpful
- [ ] Visual feedback is consistent
- [ ] Works in all supported browsers
- [ ] Documentation is complete

## 🚀 Testing Checklist

Before releasing to production:

- [ ] Run all 37 test cases
- [ ] Test with real barcode scanner
- [ ] Test with high-volume product database (1000+ products)
- [ ] Stress test with rapid scanning (100 products/minute)
- [ ] Test in Chrome, Firefox, Edge
- [ ] Test in light and dark mode
- [ ] Test with slow network (3G)
- [ ] Test keyboard layouts (EN, ES, PT)
- [ ] Verify all translations display correctly
- [ ] User acceptance testing with real cashiers

## 📝 Notes

- Always test with browser console open to catch JavaScript errors
- Clear browser cache between test runs
- Use incognito/private mode to test fresh sessions
- Document any unexpected behavior, even if minor
- Compare performance with legacy system
- Get feedback from actual users/cashiers

---

**Testing Version:** 1.0  
**Last Updated:** January 27, 2026  
**Next Review:** After first production week
