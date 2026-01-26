# Quick Testing Guide - Fiscal Reports Component

## Component Location

**Page:** `http://localhost:3000/reportes-fiscales`
**Navigation:** Reports Sidebar → "Reportes Fiscales" (with FileText icon)

## Quick Test Steps

### 1. Navigation Test

- [ ] Click "Reportes Fiscales" in sidebar
- [ ] Page loads without errors
- [ ] Date range selector appears
- [ ] Four tabs visible: Resumen, Libro de Ventas, Libro de IVA, Configuración

### 2. Summary Tab Test

- [ ] Click "Resumen" tab (default)
- [ ] Select start date and end date (pick range with data)
- [ ] Click "Generar Reporte" button
- [ ] Wait for loading spinner to disappear
- [ ] Verify 4 KPI cards appear with data:
  - Invoice Count (blue number)
  - Total Sales (green currency)
  - Total Taxable Amount (yellow currency)
  - Total IVA (purple currency)
- [ ] Verify tax breakdown table below shows aliquots and amounts
- [ ] Success toast appears briefly at top

### 3. Sales Book Tab Test

- [ ] Click "Libro de Ventas" tab
- [ ] Verify section title and description display
- [ ] Click "Generar Reporte" button
- [ ] Wait for loading
- [ ] Verify table appears with columns:
  - Fecha (Date)
  - Tipo de Comprobante (Invoice Type)
  - Número (Invoice Number)
  - Cliente (Customer Name)
  - Monto Neto (Net Amount)
  - Monto IVA (Tax Amount)
  - Monto Total (Total)
  - CAE
- [ ] Verify data rows populate (if data exists in date range)
- [ ] If no data: "No hay datos disponibles" message shows

### 4. VAT Book Tab Test

- [ ] Click "Libro de IVA" tab
- [ ] Verify section description displays
- [ ] Click "Generar Reporte" button
- [ ] Wait for loading
- [ ] Verify table appears with columns:
  - Alícuota (Tax Rate %)
  - Monto Imponible (Taxable Amount)
  - Monto IVA (Tax Amount)
- [ ] Verify breakdown by tax rate appears (e.g., 21%, 10.5%, etc.)

### 5. Configuration Tab Test

- [ ] Click "Configuración" tab
- [ ] Verify form displays with fields:
  - Country (dropdown)
  - VAT Rate (number input)
  - Fiscal Regime (dropdown)
  - Fiscal ID (text input)
- [ ] Enter test data in each field
- [ ] Click "Guardar Configuración" button
- [ ] Verify success message appears

### 6. Export Test

- [ ] Go to "Resumen" tab with data loaded
- [ ] Click "Exportar CSV" button
- [ ] Verify file downloads (fiscal*report*\*.csv)
- [ ] Open CSV in Excel or text editor - verify headers and data
- [ ] Click "Exportar XLSX" button
- [ ] Verify file downloads (fiscal*report*\*.xlsx)
- [ ] Open XLSX - verify formatting and data

### 7. Theme Switch Test

- [ ] Click theme toggle (moon/sun icon) in top right
- [ ] Verify entire component changes colors:
  - Light mode: White backgrounds, dark text
  - Dark mode: Dark backgrounds, light text
- [ ] Verify all elements remain readable in both themes:
  - KPI cards
  - Tables
  - Buttons
  - Info section (blue background)
  - Form fields
- [ ] Data should remain the same after theme switch

### 8. Language Switch Test

- [ ] Click language selector (top right, flags or dropdown)
- [ ] Select "Español" (Spanish)
  - Verify all text in Spanish
  - Navigation shows "Reportes Fiscales"
  - Buttons say "Generar Reporte", "Exportar CSV"
  - Error messages in Spanish
- [ ] Select "English"
  - Verify all text in English
  - Navigation shows "Fiscal Reports"
  - Buttons say "Generate Report", "Export CSV"
  - Error messages in English
- [ ] Select "Português" (Portuguese)
  - Verify all text in Portuguese
  - Navigation shows "Relatórios Fiscais"
  - Buttons say "Gerar Relatório", "Exportar CSV"
  - Error messages in Portuguese

### 9. Date Range Test

- [ ] Clear current dates by clicking "Reset" (if available)
- [ ] Select future date range (no data)
- [ ] Click "Generar Reporte"
- [ ] Verify "No hay datos disponibles" message appears
- [ ] Select past date range with data
- [ ] Click "Generar Reporte"
- [ ] Verify data populates correctly

### 10. Error Handling Test

- [ ] (Requires intentional error setup)
- [ ] Disconnect internet while loading
- [ ] Verify error toast appears with message
- [ ] Message should be internationalized
- [ ] Reconnect and retry
- [ ] Verify report generates successfully

### 11. Tab Switching Test

- [ ] Switch between tabs rapidly
- [ ] Verify no error toasts appear during switches (silent mode working)
- [ ] Verify data loads for each tab without errors
- [ ] Manual button clicks should show success toasts
- [ ] Automatic tab-switch loads should not show toasts

### 12. Long Data Test

- [ ] Select date range with hundreds of transactions
- [ ] Click "Generar Reporte"
- [ ] Verify loading spinner shows appropriate time
- [ ] Verify all data displays without truncation
- [ ] Scroll through table - verify pagination/scrolling works
- [ ] Export large dataset - verify CSV/XLSX includes all rows

---

## Expected Behaviors

### Success Scenarios:

✓ Page loads → Shows date selector and tabs
✓ Select dates → Click button → Data loads → Toast shows "Reporte generado"
✓ Switch theme → UI updates, data remains
✓ Switch language → All text updates, functionality same
✓ Click export → Browser downloads file
✓ Switch tabs without error toasts (silent mode)
✓ Empty date range → Shows "no data" message

### Error Scenarios:

✗ API fails → Shows error toast in correct language
✗ No network → Shows error message
✗ Invalid date range → Shows validation error
✗ Export fails → Shows "Error al exportar" message

---

## Browser Console Checks

Open Developer Tools (F12) and check Console tab:

### Should See:

- API fetch logs (if enabled)
- React warnings (none expected)
- No JavaScript errors

### Should NOT See:

- Uncaught exceptions
- "Failed to parse" errors
- Network 500 errors
- Undefined reference errors
- TypeScript errors in compiled code

---

## File Checks

Before testing, verify these files exist:

### Components:

```
✓ src/app/reportes-fiscales/page.tsx (873 lines)
✓ src/components/layout/Header.tsx (contains fiscal reports nav item)
```

### Translations:

```
✓ src/lib/context/LanguageContext.tsx (contains es, en, pt translations)
✓ Check TRANSLATIONS object has 150+ keys
```

### Backend:

```
✓ src/app/api/fiscal-reports/route.ts (357 lines)
✓ Check GET endpoint implements reportType routing
✓ Check POST endpoint for export
```

### Database:

```
✓ MongoDB has Invoice collection
✓ Invoices have proper dates (within testable range)
✓ Invoices have fiscalData.taxBreakdown fields
✓ Sample data exists for testing
```

---

## Common Issues & Fixes

### Issue: KPI cards show 0 or undefined

**Check:**

- [ ] Database has invoices with status "AUTHORIZED"
- [ ] Date range includes those invoices
- [ ] API response has proper data structure
- [ ] Frontend accessing `data.data` not just `data`

### Issue: Theme not changing

**Check:**

- [ ] Theme toggle is working
- [ ] Tailwind dark mode is enabled in config
- [ ] Component has `dark:` variant classes
- [ ] Browser cache cleared

### Issue: Language not changing

**Check:**

- [ ] Language selector is working
- [ ] TRANSLATIONS object has all keys for that language
- [ ] useGlobalLanguage() hook is returning correct language
- [ ] Translation keys exist in TRANSLATIONS[language]

### Issue: Export button does nothing

**Check:**

- [ ] POST endpoint is accessible
- [ ] Export function is triggered (check console)
- [ ] Response is valid file stream
- [ ] Browser allows downloads from this domain

### Issue: "Failed to generate report" error appears

**Check:**

- [ ] API endpoint is accessible at /api/fiscal-reports
- [ ] Date parameters are valid (ISO format)
- [ ] Business ID is being passed in auth header
- [ ] Database connection is working
- [ ] Query is returning results

### Issue: Component appears dark in light mode

**Check:**

- [ ] All background classes have `dark:` variants
- [ ] Text colors have `dark:` variants
- [ ] No hardcoded `text-white` or `bg-gray-950` without light mode equivalent
- [ ] Tailwind dark mode CSS is being applied

---

## Performance Expectations

### Load Times:

- Page load: < 2 seconds
- Report generation (< 1000 rows): < 2 seconds
- Report generation (> 1000 rows): < 5 seconds
- Export CSV generation: < 3 seconds
- Export XLSX generation: < 5 seconds

### Interactions:

- Theme switch: < 100ms (instant visual update)
- Language switch: < 200ms
- Tab switch: < 500ms
- Button click to success toast: < 50ms

---

## Data Validation Checklist

When testing with real data, verify:

- [ ] Invoice count matches database count for date range
- [ ] Total sales = sum of all invoice totalAmount
- [ ] Total taxable = sum of all item quantities × unit prices
- [ ] Total IVA = sum of all invoice taxAmount
- [ ] Tax breakdown rates match configured aliquots
- [ ] Tax breakdown totals match grand totals
- [ ] Sales book shows all invoices in date range
- [ ] Sales book amounts match individual invoice details
- [ ] VAT book breakdown totals match summary totals
- [ ] CSV/XLSX exports contain all visible data
- [ ] Date formats consistent throughout

---

## Sign-Off Checklist

Component is ready for production when:

- [ ] All navigation works correctly
- [ ] All four tabs load without errors
- [ ] Data displays correctly in all three languages
- [ ] Theme switching works in all modes
- [ ] All buttons have proper styling and are clickable
- [ ] Loading states show appropriately
- [ ] Error messages display in correct language
- [ ] Export buttons generate valid files
- [ ] No errors in browser console
- [ ] Responsive design works on mobile
- [ ] Performance is acceptable
- [ ] All database queries return correct data

---

_Generated: Message 8_
_For testing Fiscal Reports component_
_Last Updated: During implementation completion_
