# Fiscal Reports Export - Verification Checklist

## ✅ Code Changes Completed

### Backend (route.ts)

- [x] POST handler receives { reportType, startDate, endDate, format, data }
- [x] Data validation checks for all required parameters
- [x] CSV generation functions properly format headers and rows
- [x] InvoiceAudit logging is non-blocking (try-catch wrapper)
- [x] Response headers set correctly:
  - Content-Type: text/csv;charset=utf-8
  - Content-Disposition: attachment; filename=...
- [x] Comprehensive logging added:
  - [EXPORT START] - user and business info
  - [EXPORT] Params - request parameters
  - [EXPORT VALIDATION] - validation errors
  - [EXPORT] CSV generated - byte size and line count
  - [EXPORT AUDIT] - logging success/failure
  - [EXPORT SUCCESS] - final confirmation
  - [EXPORT ERROR] - catch-all error logging
- [x] Status code 200 returned on success
- [x] No TypeScript compilation errors

### Frontend (page.tsx)

- [x] authenticatedFetch() helper correctly adds Authorization header
- [x] exportToCSV() validates data array is not empty
- [x] POST request sends correct payload structure
- [x] Error handling uses response.text() instead of response.json()
- [x] Comprehensive logging added:
  - [EXPORT] Preparing request - data structure validation
  - [EXPORT] Response received - status and headers
  - [EXPORT ERROR] - detailed error messages
  - [EXPORT] Success response received - blob generation
  - [EXPORT] Blob created - size and type verification
  - [EXPORT] Triggering download - filename and URL length
  - [EXPORT] Download completed successfully - final confirmation
- [x] Blob size check (detects empty CSV)
- [x] Download link properly created and triggered
- [x] Success toast shows translated message
- [x] Error toast shows translated message
- [x] No TypeScript compilation errors

### Translations (TRANSLATIONS object)

- [x] t.export.success - "Reporte generado exitosamente" (ES)
- [x] t.export.noData - "No hay datos para exportar" (ES)
- [x] t.errors.failedToExport - "Error al exportar el reporte" (ES)
- [x] t.configuracion.saveSuccess - "Configuración guardada exitosamente" (ES)
- [x] English translations added (EN)
- [x] Portuguese translations added (PT)

---

## 📋 Pre-Testing Verification

Before running tests, verify:

- [ ] Next.js server is running (`npm run dev`)
- [ ] Browser is open and logged in to the application
- [ ] Token exists in localStorage (check DevTools → Application → Local Storage)
- [ ] Fiscal Reports page loads without errors
- [ ] Sales Book tab shows data rows (not empty)
- [ ] Console is open (F12 → Console tab)

---

## 🧪 Test Case 1: Export Sales Book (Libro de Ventas)

### Setup:

1. Navigate to "Reportes Fiscales" page
2. Click "Libro de Ventas" tab
3. Verify data displays in the table (at least 1 row)
4. Open browser Console (F12)

### Execute:

1. Click the export button (may say "Generar Reporte" or "Export to CSV")
2. Watch console for [EXPORT] logs
3. Check if file downloads

### Expected Result:

- ✅ Console shows: `[EXPORT] Response received: status=200, ok=true`
- ✅ Console shows: `[EXPORT] Blob created: size=XXX bytes, type=text/csv`
- ✅ File downloads to Downloads folder with name like: `LIBRO_VENTAS_2024-01-01_2024-12-31.csv`
- ✅ Green toast shows: "Reporte generado exitosamente" (or English/Portuguese equivalent)
- ✅ CSV file opens in Excel with headers: Fecha, Tipo de Comprobante, Número, Cliente, CUIT, Neto, IVA, Total, CAE, Estado

### If It Fails:

- Check console for `[EXPORT ERROR]` log
- Note the status code (200 = success, 400 = bad data, 401 = auth, 500 = server error)
- Check Network tab for POST `/api/fiscal-reports/export` response
- See EXPORT_DEBUGGING_GUIDE.md for solutions

---

## 🧪 Test Case 2: Export VAT Book (Libro de IVA)

### Setup:

1. Click "Libro de IVA" tab
2. Verify data displays in the table (at least 1 row)
3. Open browser Console (F12)

### Execute:

1. Click the export button
2. Watch console for [EXPORT] logs
3. Check if file downloads

### Expected Result:

- ✅ Console shows: `[EXPORT] Response received: status=200, ok=true`
- ✅ File downloads with name like: `LIBRO_IVA_2024-01-01_2024-12-31.csv`
- ✅ CSV file opens in Excel with headers: Alícuota, Base Imponible, Monto IVA
- ✅ Data shows VAT rates (21%, etc.) with corresponding amounts

### If It Fails:

- Check console for error details
- Compare with Test Case 1 debugging steps
- Verify Libro IVA data is properly aggregated in the backend

---

## 🧪 Test Case 3: Language Switching

### Setup:

1. Note current language (check Settings or Language selector)
2. Export a report (note the toast message language)
3. Switch to different language

### Execute:

1. Repeat export with Spanish (ES)
2. Check toast says: "Reporte generado exitosamente"
3. Switch to English (EN)
4. Repeat export
5. Check toast says: "Report exported successfully"
6. Switch to Portuguese (PT)
7. Repeat export
8. Check toast says: "Relatório exportado com sucesso"

### Expected Result:

- ✅ Toast messages appear in correct language for each export
- ✅ Console logs remain in English (expected - logs are for developers)
- ✅ No mix of languages in toast notifications

### If It Fails:

- Check that `currentLanguage` is being used in translation logic
- Verify `t = TRANSLATIONS[currentLanguage]` is set correctly
- Check that language switching updates `currentLanguage` state

---

## 🧪 Test Case 4: Error Scenarios

### Scenario 4a: No Data Selected

1. Change dates to a period with no sales
2. Click export
3. Expected: Toast shows "No hay datos para exportar" (or language equivalent)

### Scenario 4b: Network Error

1. Stop the Next.js server
2. Click export
3. Expected: Toast shows error message from [EXPORT ERROR] log

### Scenario 4c: Invalid Token

1. Open DevTools → Application → Local Storage
2. Delete the "accessToken" entry
3. Click export
4. Expected: Status 401 in console, error toast shown

---

## 📊 CSV Content Validation

### Sales Book (Libro de Ventas) - Expected Format:

```
Fecha,Tipo de Comprobante,Número,Cliente,CUIT,Neto,IVA,Total,CAE,Estado
2024-01-15,Factura B,123456,Client Name,20-12345678-9,10000.00,2100.00,12100.00,abc123def456,AUTORIZADO
2024-01-16,Factura B,123457,Another Client,20-87654321-0,5000.00,1050.00,6050.00,,AUTORIZADO
```

Verify:

- [ ] Headers present and correct
- [ ] Each row has 10 columns
- [ ] Dates in YYYY-MM-DD format
- [ ] Numbers without quotes (unless containing commas)
- [ ] Amounts with 2 decimal places
- [ ] No empty lines at end of file

### VAT Book (Libro de IVA) - Expected Format:

```
Alícuota,Base Imponible,Monto IVA
21,10000.00,2100.00
10.5,5000.00,525.00
```

Verify:

- [ ] Headers present and correct
- [ ] Each row has 3 columns
- [ ] Aliquot is a percentage (21, 10.5, etc.)
- [ ] Amounts with 2 decimal places
- [ ] All rows have data (no empty cells)

---

## 🔧 Performance Checks

### Memory/Performance:

- [ ] Exporting 100+ rows doesn't cause browser to hang
- [ ] CSV generation completes within 5 seconds
- [ ] No "Out of memory" errors in console
- [ ] Download triggers immediately after blob creation

### File Size:

- [ ] Libro Ventas CSV is reasonable size (< 5 MB for 10k rows)
- [ ] Libro IVA CSV is small (< 100 KB even with thousands of rates)
- [ ] No duplicate data or unnecessary rows in output

---

## 🔐 Security Checks

- [ ] Authorization header is sent with every request
- [ ] Auth token from localStorage is used correctly
- [ ] No credentials are logged or exposed in console
- [ ] No sensitive data in error messages shown to user
- [ ] Backend validates user has access to this business
- [ ] CSV contains only data for authenticated user's business

---

## 🎯 Final Sign-Off

All tests passed:

- [ ] Libro de Ventas export works
- [ ] Libro de IVA export works
- [ ] Languages switch correctly (ES/EN/PT)
- [ ] Toast messages are translated
- [ ] CSV content is correct and complete
- [ ] No errors in browser console (except expected logs)
- [ ] No errors in server logs
- [ ] Error handling works for edge cases
- [ ] Performance is acceptable
- [ ] Security requirements met

### Ready for Production:

- [ ] All code reviewed
- [ ] All tests passed
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Monitoring/logging in place

---

## 📝 Notes for QA Testing

**Export Button Location:**

- Fiscal Reports page → Libro de Ventas tab → "Generar Reporte" button at top
- Fiscal Reports page → Libro de IVA tab → "Generar Reporte" button at top

**Console Filter Tip:**

- Type `[EXPORT]` in console search/filter to see only export-related logs
- Type `[EXPORT ERROR]` to see only error logs

**Network Tab Tip:**

- Filter by "fetch/xhr" to see only API calls
- Click the POST `/api/fiscal-reports/export` request to see full details
- Response tab shows raw CSV content

**File Verification:**

- Check Downloads folder for `.csv` files
- Open in Excel/Sheets to verify formatting
- Encoding should be UTF-8 for special characters (ñ, á, etc.)

---

## 🆘 If All Tests Fail

1. **Collect Information:**
   - Full console log (screenshot or copy-paste)
   - Network response details
   - Server logs from terminal
   - Browser + OS version

2. **Check Basics:**
   - Is the data actually loading in the table?
   - Is the user logged in (token in localStorage)?
   - Is the server running (npm run dev)?

3. **Check Logs:**
   - Look for any error in console that's NOT [EXPORT] prefixed
   - Look for 404 errors for `/api/fiscal-reports/export` endpoint
   - Check server terminal for exception stack traces

4. **Next Steps:**
   - Refer to EXPORT_DEBUGGING_GUIDE.md for detailed troubleshooting
   - Check Code Locations section for file paths to review
   - Verify backend is returning correct CSV format

---

Last Updated: December 2024
Document Purpose: QA Testing and Verification of Export Functionality
Status: Ready for Testing
