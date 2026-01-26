# Fiscal Reports Export - Debugging Guide

## Status

- ✅ Backend data fetching: Working (Sales Book shows real data)
- ✅ Configuration save: Working (green toast visible)
- ❌ Export functionality: Failing with "Failed to export report"
- 🔄 Root cause: Unknown - comprehensive logging added to diagnose

---

## What Was Just Enhanced

### Frontend Changes (page.tsx, lines 530-610)

Enhanced error handling with detailed console logging at every step:

```
[EXPORT] Preparing request - shows reportType, dates, data sample
[EXPORT] Response received - shows HTTP status, Content-Type, Content-Disposition headers
[EXPORT ERROR] - detailed error message with status code and response text
[EXPORT] Success response received - preparing to generate blob
[EXPORT] Blob created - shows blob size and type
[EXPORT] Triggering download - shows filename and download URL
[EXPORT] Download completed successfully
```

### Backend Changes (route.ts, POST handler)

Added comprehensive server-side logging with non-blocking error handling:

```
[EXPORT START] - User email and businessId
[EXPORT] Params - reportType, format, data array length
[EXPORT VALIDATION] - shows what fields are missing/invalid
[EXPORT] Connected to DB, generating CSV
[EXPORT] CSV generated - shows byte size and line count
[EXPORT AUDIT] - logs success or failure (non-blocking)
[EXPORT SUCCESS] - final confirmation before response
[EXPORT ERROR] - catches and logs any exceptions
```

---

## How to Debug Export Failure

### Step 1: Open Browser Developer Tools

1. Press `F12` in your browser
2. Go to **Console** tab
3. Keep this open while testing

### Step 2: Trigger Export

1. Navigate to Reportes Fiscales page
2. Verify data shows in Sales Book or VAT Book table
3. Click the **"Generar Reporte"** button (or **"Generate Report"** in English)

### Step 3: Check Console Logs

Look for logs starting with `[EXPORT]` prefix in the Console tab:

**If you see:** `[EXPORT] Response status: 200, ok: true`

- ✅ Request reached backend successfully
- Move to Step 4 (check blob creation)

**If you see:** `[EXPORT] Response status: 400, ok: false`

- ❌ Backend data validation failed
- Check the error message in `[EXPORT ERROR]` logs
- Common causes: missing dates, no data in array, wrong reportType

**If you see:** `[EXPORT] Response status: 401, ok: false`

- ❌ Authentication failed
- Check if token exists in localStorage
- Run in console: `localStorage.getItem('accessToken')`
- Should return a long JWT token, not empty/null

**If you see:** `[EXPORT] Response status: 500, ok: false`

- ❌ Server error during CSV generation
- Check server logs for `[EXPORT ERROR]` messages
- The error message will be in the response body

**If NO logs appear at all:**

- ❌ Request might not be reaching the endpoint
- Check Network tab (see Step 4)

### Step 4: Check Network Tab

1. Open **Network** tab in Developer Tools
2. Click export button again
3. Look for POST request to `/api/fiscal-reports/export`
4. Click on that request to view details:
   - **Status:** Should be 200 for success
   - **Response Preview:** Should show CSV content (Fecha,Tipo de Comprobante,...)
   - **Response Headers:** Should include:
     - `Content-Type: text/csv`
     - `Content-Disposition: attachment; filename=...`

### Step 5: Verify Data Structure

Run this in browser console to check what data is being sent:

For Sales Book:

```javascript
// These logs appear when you click export
// Check the [EXPORT] Preparing request log to see sampleRow
// It should look like:
// {
//   date: "2024-01-15",
//   invoiceType: "Factura B",
//   invoiceNumber: "123456",
//   customerName: "Cliente Name",
//   customerCuit: "20-12345678-9",
//   neto: 10000,
//   iva: 2100,
//   total: 12100,
//   cae: "abc123",
//   status: "AUTORIZADO"
// }
```

---

## Common Issues and Solutions

### Issue 1: "Failed to export report" (No detailed error)

**Most Likely:** Backend returned 500 error

**Check Server Logs:**

```bash
# In your terminal running the Next.js server
# Look for: [EXPORT START], [EXPORT VALIDATION], [EXPORT SUCCESS] or [EXPORT ERROR]
```

**Solution:**

1. Check Network tab → Response body for actual error message
2. Look for [EXPORT ERROR] in server console
3. Verify CSV generation functions (generateLibroVentasCSV, generateLibroIVACSV) work correctly

---

### Issue 2: Response is 200 but download doesn't trigger

**Most Likely:** Blob creation or download link issue

**Check Console:**

1. Look for `[EXPORT] Blob created:` log
2. If blob.size is 0, CSV generation produced empty content
3. If no blob log appears, error happens during `response.blob()`

**Solution:**

1. Verify CSV has content: Check Network tab → Response tab
2. If CSV is empty, check data being passed to CSV generation functions
3. Verify sample row structure matches expected fields

---

### Issue 3: Empty CSV generated

**Most Likely:** Data fields don't match CSV generation function expectations

**Expected Sales Book Data Structure:**

```javascript
{
  date: string,           // ISO date: "2024-01-15"
  invoiceType: string,    // "Factura B"
  invoiceNumber: string,  // "123456"
  customerName: string,   // "Cliente"
  customerCuit: string,   // "20-12345678-9"
  neto: number,          // 10000
  iva: number,           // 2100
  total: number,         // 12100
  cae: string,           // "abc123" or null
  status: string         // "AUTORIZADO"
}
```

**Expected VAT Book Data Structure:**

```javascript
{
  aliquot: string,       // "21"
  baseAmount: number,    // 10000
  taxAmount: number      // 2100
}
```

**Solution:**

1. Print first row of data in console before export
2. Check all field names match exactly (case-sensitive)
3. Verify no undefined/null values that should have data

---

## Real-Time Debugging: Step-by-Step Walkthrough

### Open Console and Run This:

```javascript
// Check 1: Is auth token present?
console.log(
  "Auth Token:",
  localStorage.getItem("accessToken") ? "✓ Present" : "✗ Missing",
);

// Check 2: Check current page state (once you're on fiscal reports page)
// The page will log [EXPORT] messages when you click export
```

### Then Click Export Button and Watch For:

```
[EXPORT] Preparing request {
  reportType: "LIBRO_VENTAS",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  dataLength: 5,
  sampleRow: { date: "2024-01-15", ... }
}
```

**This tells you:**

- ✓ Frontend can access data
- ✓ Date range is correct
- ✓ Array has rows to export

```
[EXPORT] Response received: status=200, ok=true, headers={
  contentType: "text/csv;charset=utf-8",
  contentDisposition: "attachment; filename=LIBRO_VENTAS_2024-01-01_2024-12-31.csv"
}
```

**This tells you:**

- ✓ Backend received request and processed it
- ✓ CSV was generated successfully
- ✓ Response headers are correct

```
[EXPORT] Blob created: size=2048 bytes, type=text/csv
[EXPORT] Triggering download: LIBRO_VENTAS_2024-01-01_2024-12-31.csv, url length=200
[EXPORT] Download completed successfully
```

**This tells you:**

- ✓ Blob creation succeeded
- ✓ Download link was triggered
- ✓ File should appear in Downloads folder

---

## If Export Still Fails After Checking

### Collect This Information:

1. **Full console log** (copy all [EXPORT] messages)
2. **Network tab response** (click the request, copy Response body)
3. **Server logs** (find [EXPORT START] and [EXPORT ERROR] lines)
4. **Browser/OS info** (Chrome/Firefox/Safari + Windows/Mac/Linux)

### Then Share:

- Screenshot of console with [EXPORT] logs
- Screenshot of Network tab response
- Error message from [EXPORT ERROR]

---

## Code Locations for Reference

**Frontend Export Logic:**

- File: [src/app/reportes-fiscales/page.tsx](src/app/reportes-fiscales/page.tsx)
- Function: `exportToCSV()` at line ~530
- Key logs: [EXPORT] prefix in all console.log statements

**Backend Export Logic:**

- File: [src/app/api/fiscal-reports/route.ts](src/app/api/fiscal-reports/route.ts)
- Function: `POST handler` at line ~180
- Key logs: [EXPORT START], [EXPORT SUCCESS], [EXPORT ERROR] prefix

**CSV Generation Functions:**

- `generateLibroVentasCSV()` - creates Sales Book CSV
- `generateLibroIVACSV()` - creates VAT Book CSV

**Authentication:**

- Helper function: `authenticatedFetch()` at line ~348 in page.tsx
- Gets token from localStorage, adds Authorization header
- Used by all three API calls (GET reports, POST export, POST config save)

---

## Success Indicators

When export works correctly, you should see:

1. ✅ `[EXPORT] Response status: 200, ok: true`
2. ✅ `[EXPORT] CSV generated: XXX bytes`
3. ✅ `[EXPORT] Blob created: size=XXX bytes`
4. ✅ File downloads to your Downloads folder
5. ✅ Green toast: "Report exported successfully"
6. ✅ CSV file has correct headers and data rows

---

## Next Steps

1. **Test Export Now:**
   - Open Fiscal Reports page
   - Ensure Sales Book shows data
   - Click "Generar Reporte" button
   - Check console for [EXPORT] logs

2. **Share Results:**
   - Copy all [EXPORT] console logs
   - Share Network tab response status and body
   - Share any error messages shown

3. **Once Fixed:**
   - Verify CSV file opens in Excel
   - Verify column data matches expected format
   - Test language switching (ES/EN/PT) and check translated toasts
   - Test both Sales Book and VAT Book exports
