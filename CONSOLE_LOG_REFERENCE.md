# 🔍 Expected Console Output - Export Test

## What You'll See in Browser Console When Export Works

### Complete Success Flow

```
[EXPORT] Preparing request {
  reportType: "LIBRO_VENTAS",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  dataLength: 5,
  sampleRow: {
    date: "2024-01-15",
    invoiceType: "Factura B",
    invoiceNumber: "123456",
    customerName: "Client Name",
    customerCuit: "20-12345678-9",
    neto: 10000,
    iva: 2100,
    total: 12100,
    cae: "abc123def456",
    status: "AUTORIZADO"
  }
}

[EXPORT] Response received: status=200, ok=true, headers={
  contentType: "text/csv;charset=utf-8",
  contentDisposition: "attachment; filename=LIBRO_VENTAS_2024-01-01_2024-12-31.csv"
}

[EXPORT] Success response received, generating blob...

[EXPORT] Blob created: size=2048 bytes, type=text/csv

[EXPORT] Triggering download: LIBRO_VENTAS_2024-01-01_2024-12-31.csv, url length=128

[EXPORT] Download completed successfully
```

**Then you'll see:**

- Green toast: "Reporte generado exitosamente" (or English/Portuguese)
- File in Downloads folder: `LIBRO_VENTAS_2024-01-01_2024-12-31.csv`

✅ **Export is working!**

---

## Error Flow Examples

### Error: No Data in Table

**What you'll see:**

```
[EXPORT] No data available for export {
  reportType: "LIBRO_VENTAS",
  libroVentasLength: 0,
  libroIVALength: 0
}
```

**Red toast:** "No hay datos para exportar"

**What to do:**

- Check if the table shows data rows
- Adjust date range to include sales
- Verify sales exist for the selected period

---

### Error: Bad Request (Status 400)

**What you'll see:**

```
[EXPORT] Preparing request {
  reportType: "LIBRO_VENTAS",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  dataLength: 5,
  sampleRow: { ... }
}

[EXPORT] Response received: status=400, ok=false, headers={
  contentType: "application/json"
}

[EXPORT ERROR] Status 400: reportType, startDate, endDate, format, and data array are required
```

**Red toast:** "Error al exportar el reporte"

**What to do:**

- Verify date range is correct
- Make sure data is loaded in table
- Check if reportType is "LIBRO_VENTAS" or "LIBRO_IVA"

---

### Error: Authentication Failed (Status 401)

**What you'll see:**

```
[EXPORT] Preparing request {
  reportType: "LIBRO_VENTAS",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  dataLength: 5,
  sampleRow: { ... }
}

[EXPORT] Response received: status=401, ok=false, headers={
  contentType: "application/json"
}

[EXPORT ERROR] Status 401: Unauthorized
```

**Red toast:** "Error al exportar el reporte"

**What to do:**

1. Open DevTools → Application → Local Storage
2. Check if "accessToken" exists
3. If missing: Log out and log back in
4. If present: Token might be expired, try logging in again

---

### Error: Server Error (Status 500)

**What you'll see:**

```
[EXPORT START] User: your-email@example.com, Business: 507f1f77bcf86cd799439011

[EXPORT] Params: reportType=LIBRO_VENTAS, format=csv, dataLength=5

[EXPORT] Connected to DB, generating CSV...

[EXPORT ERROR] Status 500: [Detailed error message here]
```

**Plus in server console (where you're running npm run dev):**

```
[EXPORT START] User: your-email@example.com, Business: 507f1f77bcf86cd799439011

[EXPORT ERROR] Error: Cannot read property 'date' of undefined
  at generateLibroVentasCSV (route.ts:250)
  at POST (route.ts:180)
```

**What to do:**

- Share the error message from server console
- Check data structure in [EXPORT] Preparing request
- Verify all fields in data rows match expected names

---

### Error: Empty CSV Generated (Status 200 but no download)

**What you'll see:**

```
[EXPORT] Preparing request {
  reportType: "LIBRO_VENTAS",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  dataLength: 5,
  sampleRow: { ... }
}

[EXPORT] Response received: status=200, ok=true, headers={
  contentType: "text/csv;charset=utf-8",
  contentDisposition: "attachment; filename=..."
}

[EXPORT] Success response received, generating blob...

[EXPORT] Blob created: size=0 bytes, type=text/csv

[EXPORT] Blob is empty!
```

**Red toast:** "Error al exportar el reporte" or "Generated file is empty"

**What to do:**

- Check if data rows have all required fields
- Verify sample row structure in [EXPORT] Preparing request
- Check Network tab → Response to see if CSV headers are there but rows are missing

---

## Server Console Logs (What You'll See in Terminal)

### Success Flow (Terminal where you run `npm run dev`)

```
[EXPORT START] User: maria@example.com, Business: 507f1f77bcf86cd799439011

[EXPORT] Params: reportType=LIBRO_VENTAS, format=csv, dataLength=5

[EXPORT] Connected to DB, generating CSV...

[EXPORT] CSV generated: 1250 bytes, lines: 6

[EXPORT AUDIT] Logged successfully

[EXPORT SUCCESS] LIBRO_VENTAS: 1250 bytes, 5 rows
```

### Validation Error Flow

```
[EXPORT START] User: maria@example.com, Business: 507f1f77bcf86cd799439011

[EXPORT] Params: reportType=LIBRO_VENTAS, format=csv, dataLength=0

[EXPORT VALIDATION] reportType, startDate, endDate, format, and data array are required {
  reportType: "LIBRO_VENTAS",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  format: "csv",
  dataLength: 0
}
```

### Audit Logging Error (Non-Blocking - Export Still Works)

```
[EXPORT START] User: maria@example.com, Business: 507f1f77bcf86cd799439011

[EXPORT] Params: reportType=LIBRO_VENTAS, format=csv, dataLength=5

[EXPORT] Connected to DB, generating CSV...

[EXPORT] CSV generated: 1250 bytes, lines: 6

[EXPORT AUDIT] Failed to log export audit: MongoDB connection refused

[EXPORT SUCCESS] LIBRO_VENTAS: 1250 bytes, 5 rows
```

(Note: Export still succeeds even though audit logging failed)

---

## Log Filtering Tips

### See Only Export Logs

In browser console search box, type:

```
[EXPORT]
```

This filters to show ONLY export-related logs.

### See Only Errors

In browser console search box, type:

```
[EXPORT ERROR]
```

This shows only the error logs.

### See In Real-Time

1. Open Console tab
2. Check "Preserve logs" checkbox
3. Refresh page
4. Run export
5. All logs will remain visible even if page reloads

---

## What NOT to Ignore

### ✅ Expected Messages (Normal Operation)

```
[EXPORT] Preparing request - This is normal
[EXPORT] Response received: status=200, ok=true - This is good!
[EXPORT] Blob created: size=2048 bytes - This is expected
[EXPORT] Download completed successfully - Perfect!
```

### ⚠️ Warning Messages (Might Need Attention)

```
[EXPORT AUDIT] Failed to log export audit - Non-blocking, but audit logging failed
```

This is OK - export still works, but your audit trail might be incomplete.

### ❌ Error Messages (Something Failed)

```
[EXPORT] Response received: status=400 - Data validation failed
[EXPORT] Response received: status=401 - Auth failed
[EXPORT] Response received: status=500 - Server crashed
[EXPORT ERROR] - Error details
[EXPORT] Blob is empty! - CSV generation produced no content
```

These mean the export failed and you should check the error details.

---

## Step-by-Step: How to Read the Logs

### Step 1: Click Export Button

Watch for:

```
[EXPORT] Preparing request { ... }
```

**What it shows:**

- reportType: should be "LIBRO_VENTAS" or "LIBRO_IVA"
- startDate/endDate: date range you selected
- dataLength: number of rows to export
- sampleRow: first row of data (check if data looks right)

**If missing:** Request didn't start, check for JavaScript errors

### Step 2: Check Response Status

Look for:

```
[EXPORT] Response received: status=200, ok=true
```

**Status meanings:**

- 200 → ✅ Success! Proceed to Step 3
- 400 → ❌ Bad request (validation failed) - see error message
- 401 → ❌ Auth failed (token issue) - log in again
- 500 → ❌ Server error - check server terminal

**If missing:** Request didn't reach backend, check Network tab

### Step 3: Check Blob Creation

Look for:

```
[EXPORT] Blob created: size=2048 bytes, type=text/csv
```

**What it shows:**

- size > 0 → ✅ CSV was generated, proceed to Step 4
- size = 0 → ❌ CSV is empty, data structure issue

**If missing:** Error occurred during blob creation, check [EXPORT ERROR]

### Step 4: Check Download Trigger

Look for:

```
[EXPORT] Triggering download: LIBRO_VENTAS_2024-01-01_2024-12-31.csv
```

**What it shows:**

- filename: correct format with report type and dates
- url length: should be > 100 (object URL)

**If missing:** Download didn't trigger, check browser permissions

### Step 5: Verify Download

Look for:

```
[EXPORT] Download completed successfully
```

**If you see this:**

- ✅ Check Downloads folder for CSV file
- ✅ Check for green toast message
- ✅ Open file in Excel to verify content

**If you don't see it:**

- ❌ Download might have failed silently
- ❌ Check browser's download panel
- ❌ Check for file permission issues

---

## Network Tab Details

### Success Response

```
POST /api/fiscal-reports/export

Status: 200 OK

Response Headers:
- Content-Type: text/csv;charset=utf-8
- Content-Disposition: attachment; filename=LIBRO_VENTAS_2024-01-01_2024-12-31.csv
- Content-Length: 2048

Response Body:
Fecha,Tipo de Comprobante,Número,Cliente,CUIT,Neto,IVA,Total,CAE,Estado
2024-01-15,Factura B,123456,Client Name,20-12345678-9,10000,2100,12100,abc123,AUTORIZADO
```

### Error Response (400)

```
POST /api/fiscal-reports/export

Status: 400 Bad Request

Response Headers:
- Content-Type: application/json

Response Body:
{"error":"reportType, startDate, endDate, format, and data array are required"}
```

### Error Response (500)

```
POST /api/fiscal-reports/export

Status: 500 Internal Server Error

Response Headers:
- Content-Type: application/json

Response Body:
{"error":"Cannot read property 'date' of undefined"}
```

---

## Troubleshooting by Status Code

| Status | Meaning      | Console Message                                   | Fix                      |
| ------ | ------------ | ------------------------------------------------- | ------------------------ |
| 200    | Success      | `[EXPORT] Response received: status=200, ok=true` | Check Downloads for file |
| 400    | Bad Request  | `[EXPORT ERROR] Status 400: ...`                  | Check data structure     |
| 401    | Unauthorized | `[EXPORT ERROR] Status 401: Unauthorized`         | Log in again             |
| 404    | Not Found    | `[EXPORT ERROR] Status 404: Not Found`            | URL is wrong (unlikely)  |
| 500    | Server Error | `[EXPORT ERROR] Status 500: [error details]`      | Check server logs        |

---

## Copy-Paste for Error Reporting

When you encounter an error, copy this template and fill it in:

```
Error Status: [e.g., 400, 401, 500]

Console Log:
[EXPORT] ... [paste all [EXPORT] messages here]

Server Log:
[EXPORT] ... [paste all [EXPORT] messages from terminal here]

Network Response:
[paste the Response body from Network tab here]

Steps to Reproduce:
1. Go to [Libro de Ventas / Libro de IVA]
2. Set dates to [date range]
3. Click [button name]
4. Error occurs

Expected:
[what should happen]

Actual:
[what actually happened]
```

---

## Success Indicator Checklist

When export works, you should see ALL of these in order:

- [ ] `[EXPORT] Preparing request` - Shows data structure
- [ ] `[EXPORT] Response received: status=200, ok=true` - Backend accepted it
- [ ] `[EXPORT] Success response received, generating blob...` - Creating download file
- [ ] `[EXPORT] Blob created: size=XXXX bytes` - File created successfully
- [ ] `[EXPORT] Triggering download: ...` - Download started
- [ ] `[EXPORT] Download completed successfully` - Download finished
- [ ] File appears in Downloads folder
- [ ] Green toast shows success message
- [ ] CSV opens in Excel with headers and data

If you see all of these, **export is working perfectly!** ✅

---

## Common Console Errors (Not Export-Related)

These can appear but are NOT related to export:

```
ResizeObserver loop error - ignore, not export-related
Content Security Policy warning - ignore, not export-related
Unexpected token in JSON - only bad if in [EXPORT] error
Cannot read property - only bad if in [EXPORT ERROR] logs
```

**Focus on logs with `[EXPORT]` prefix - those are the ones that matter.**

---

**Ready to test? Open console and watch for these logs!** 🎯
