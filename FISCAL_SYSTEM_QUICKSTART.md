# Fiscal System - Quick Start Guide

## 1. Setup Your Fiscal Configuration (5 minutes)

### Step 1: Go to Business Settings

Navigate to **Configuración → Business-Config** (or `/business-config`)

### Step 2: Fill in Fiscal Information

In the "Configuración Fiscal" section, fill in:

```
País:                 Argentina (or Chile/Perú)
Régimen Fiscal:       Responsable Inscripto
                      (or Monotributo/Exento)
CUIT:                 20-12345678-9 (your company CUIT)
Tasa de IVA Default:  21 (%)
Punto de Venta:       1 (usually 1, unless multi-POS)
```

**Click "Guardar Configuración"**

## 2. Upload Digital Certificates (2 minutes)

Still in **Business Settings**, scroll to "Certificados Digitales" section:

### Upload Certificate (.crt or .cer file):

1. Click "Cargar Certificado"
2. Select your `.crt` or `.cer` file from AFIP
3. System validates and stores encrypted
4. Shows expiry date

### Upload Private Key (.key or .pem file):

1. Click "Cargar Clave Privada"
2. Select your `.key` or `.pem` file
3. **⚠️ CRITICAL**: This is encrypted and never exposed
4. System validates and stores

**Status will show "Válido" when both are ready ✓**

## 3. Access Fiscal Reports

Navigate to **Reportes → Reportes Fiscales** (or `/reportes-fiscales`)

You'll see 4 tabs:

### Tab 1: Resumen (Summary)

- Total sales, taxable amount, VAT totals
- Breakdown by tax rate (21%, 10.5%, etc.)
- Quick KPI cards

**Usage**: Executive summary for period

### Tab 2: Libro de Ventas (Sales Book)

- Chronological list of all invoices issued
- Columns: Date, Type, Number, Customer, CUIT, Net, VAT, Total, CAE, Status
- Only shows AUTHORIZED invoices (with valid CAE)

**Filters**:

- Point of Sale
- Invoice Type (Factura A, Factura B, etc.)
- Status

**Export**: Click "Exportar a CSV" for Excel

**Usage**: Official sales record for tax compliance

### Tab 3: Libro de IVA (VAT Book)

- Tax breakdown by aliquot percentage
- Taxable base and VAT amount per rate
- Helps verify VAT calculations

**Usage**: VAT detail for IVA returns

### Tab 4: Configuración

- Link to Business Settings for quick access
- Review your fiscal configuration

## 4. Electronic Invoicing (WSFEv1)

When creating an invoice in the POS or Sales module:

### Automatically Handled:

- ✓ WSAA authentication (token obtained automatically)
- ✓ Last invoice number retrieval
- ✓ CAE request to AFIP
- ✓ Idempotency (handles timeouts correctly)
- ✓ CAE stored in invoice
- ✓ PDF generated with CAE barcode + QR

### For Users:

1. Create invoice normally
2. Select invoice type: "Factura A" or "Factura B"
3. System requests CAE from AFIP
4. Invoice marked as "AUTHORIZED" when CAE received
5. PDF includes CAE and is valid for tax reporting

### CAE Status:

```
PENDING_CAE   → Waiting for AFIP response
AUTHORIZED    → CAE received, invoice valid ✓
REJECTED      → AFIP rejected (check error message)
VOIDED        → Invoice cancelled (Nota de Crédito issued)
```

## 5. Generate Official Export (Libro IVA Digital)

For monthly compliance reporting:

1. **Go to Reportes Fiscales**
2. **Select month** (date range)
3. **Choose "Libro de IVA" tab**
4. **Click "Generar Libro IVA Digital"** (upcoming feature)

Result:

- **File**: `20123456789_202601_VENTAS_v1.txt`
- **Format**: Official AFIP TXT format
- **Includes**:
  - All authorized invoices
  - Voided invoice records
  - Tax rate summaries
  - Totals and checksums
- **Usage**: Upload directly to Portal IVA → Servicios

## Common Questions

### Q: What's the difference between Factura A and Factura B?

**Factura A** (código 01):

- For customers WITH CUIT
- IVA is discriminated (shown separately)
- More formal
- CUIT field required

**Factura B** (código 06):

- For "Consumidor Final" (general public)
- IVA is already included in price
- Simpler
- CUIT optional

### Q: How often should I export Libro IVA Digital?

**Monthly**. Best practice:

- 1st business day of next month
- For the previous complete calendar month
- Upload to AFIP Portal IVA by 17th of month

### Q: Can I have multiple Points of Sale?

**Yes**. Each POS has its own invoice number sequence.

- Punto de Venta 1: invoices 001-999
- Punto de Venta 2: invoices 001-999 (separate)
- Configure in "Punto de Venta" field

### Q: What if a certificate expires?

1. System shows expiration warning
2. You can't issue new CAEs 30 days before expiry
3. Download new certificate from AFIP
4. Upload in Business Settings
5. No downtime, automatic activation

### Q: How is the private key protected?

- **Encrypted**: Uses AES-256 encryption at rest
- **Storage**: Separate secure location, not in database
- **Access**: Only server has decryption key
- **Never exposed**: Not shown in UI, not logged, not transmitted
- **Production**: Use HSM (Hardware Security Module)

### Q: Can I undo/void an invoice?

**Yes**, via Nota de Crédito (Credit Note):

1. Create Nota de Crédito (código 03 for Factura A)
2. Reference original invoice number
3. Amount: same as original (full reversal)
4. CAE requested automatically
5. Both invoices appear in Libro IVA Digital

## Troubleshooting

### Certificate Upload Fails

- ✓ Check file format (.crt or .cer for certificate)
- ✓ Check file format (.key or .pem for private key)
- ✓ Ensure files are not password-protected
- ✓ Check file size < 1MB

### CAE Request Rejected

**Common errors**:

- CUIT format invalid → Use XX-XXXXXXXX-X format
- CUIT doesn't match certificate → Verify with AFIP
- Invoice number sequence gap → Check last issued number
- Tax calculation error → Verify item prices and rates

### Reports Show No Data

- ✓ Check date range includes invoices
- ✓ Verify invoices have CAE status = "AUTHORIZED"
- ✓ Check you're viewing correct fiscal period

### Certificate Shows "EXPIRED"

- ✓ Download new certificate from AFIP
- ✓ Upload in Business Settings
- ✓ New invoices will use new cert automatically

## Need Help?

1. **General Questions**: Check full documentation at `FISCAL_SYSTEM_IMPLEMENTATION.md`
2. **API Integration**: See `src/lib/services/wsfev1.ts`
3. **Report Generation**: Check `src/app/api/fiscal-reports/`
4. **AFIP Issues**: Visit https://www.afip.gob.ar/

## Compliance Checklist

Before going live with electronic invoicing:

- [ ] CUIT registered with AFIP
- [ ] Fiscal regime properly declared
- [ ] Valid digital certificate obtained from AFIP
- [ ] Certificate and private key uploaded in system
- [ ] Test invoices issued in testing environment
- [ ] Production certificates uploaded
- [ ] First real invoice issued successfully
- [ ] CAE visible on PDF
- [ ] Libro IVA Digital generated for first month
- [ ] Submitted to Portal IVA
- [ ] Confirmed receipt from AFIP

You're ready! 🎉
