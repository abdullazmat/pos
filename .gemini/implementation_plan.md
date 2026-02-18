# Goods Receipt & Supplier Returns – Implementation Plan

## Current State Analysis

### Already Exists (Backend)
- **GoodsReceipt model** – Schema with items, status (DRAFT/CONFIRMED/PENDING_BILLING/BILLED/CANCELLED), supplier bill link
- **GoodsReceipt API** – GET/POST list+create (route.ts), GET/PUT [id] for confirm/cancel/link_bill
- **SupplierReturn model** – Schema with return type (PHYSICAL_RETURN/ECONOMIC_ADJUSTMENT), reason enum, credit note link
- **SupplierReturn API** – GET/POST list+create, GET/PUT [id] for confirm/cancel
- **StockHistory model** – Movement records (sale/purchase/adjustment)
- **SupplierDocument model** – Bills/credit notes with balance tracking & status computation
- **SupplierDocument API** – CRUD + apply-credit endpoint
- **Product model** – Single stock field, cost, margin

### Already Exists (Frontend)
- **goods-receipts/page.tsx** – Full page with form+list (1638 lines), keyboard shortcuts, scan/search modes
- **supplier-returns/page.tsx** – Full page with form+list (1329 lines), localized COPY for 3 langs

### What Needs Enhancement

#### Backend Gaps:
1. **Supplier Returns POST** – Missing `reason` field mapping (`reason` sent but `returnType` derived wrong in some cases). Also missing the `physicalExit` toggle field in API: it accepts `physicalStockExit` but the frontend sends it inconsistently.
2. **StockHistory model** – Type enum only has `sale | purchase | adjustment`. Need to add `supplier_receipt` and `supplier_return` for proper traceability.
3. **Goods Receipt confirm** – Stock movement type is `purchase` not `supplier_receipt`.
4. **Navigation** – Goods Receipts not in the nav bar items.

#### Frontend Gaps:
1. **Supplier Returns page** – Missing the `reason` dropdown, `physicalStockExit` toggle, and `receiptId/supplierBillId` reference fields in the form
2. **Supplier Returns page** – The save draft sends `documentNumber` but API expects `creditNoteNumber` for CN reference
3. **Goods Receipts page** – Not accessible from navigation (no link in Header.tsx)

## Implementation Steps

### Phase 1: Backend Model & API Enhancements

1. Update StockHistory type enum to include `supplier_receipt` and `supplier_return`
2. Update goods receipt confirm to use `supplier_receipt` type
3. Update supplier return confirm to use `supplier_return` type
4. Fix supplier return POST to properly handle all required form fields

### Phase 2: Navigation & Translations

1. Add `goodsReceipts` nav item to Header.tsx
2. Add translations for `goodsReceipts` in LanguageContext.tsx

### Phase 3: Supplier Returns Frontend Enhancement

1. Add Reason dropdown
2. Add Physical Stock Exit toggle
3. Add Receipt Reference selector
4. Add Credit Note Number/Date fields
5. Fix the API call payload mapping
