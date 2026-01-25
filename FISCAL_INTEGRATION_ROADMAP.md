# Fiscal System - Integration Steps

## Phase 1: Database & Models ✅ COMPLETE

All models have been created/extended:

- ✅ Business model extended with fiscalConfig
- ✅ FiscalConfiguration model created
- ✅ Invoice model extended with fiscalData
- ✅ InvoiceAudit model created

**Next**: Run MongoDB migrations for indexes

```bash
# Create indexes in MongoDB
mongo
> use posdb
> db.FiscalConfiguration.createIndex({ business: 1 })
> db.FiscalConfiguration.createIndex({ "certificateDigital.expiryDate": 1 })
> db.FiscalConfiguration.createIndex({ cuit: 1 })
> db.InvoiceAudit.createIndex({ business: 1, timestamp: -1 })
> db.InvoiceAudit.createIndex({ invoice: 1 })
> db.Invoice.createIndex({ business: 1, status: 1 })
> db.Invoice.createIndex({ business: 1, "fiscalData.cae": 1 })
```

## Phase 2: Services & APIs ✅ COMPLETE

All services and API endpoints created:

- ✅ WSFEv1 service for AFIP integration
- ✅ LibroIVADigitalExporter service
- ✅ Fiscal config API endpoints
- ✅ Certificate management API
- ✅ Fiscal reports API endpoints

**Next**: Test endpoints with Postman/Insomnia

```bash
# 1. Get fiscal config
curl -X GET http://localhost:3000/api/fiscal-config \
  -H "Authorization: Bearer {TOKEN}"

# 2. Update fiscal config
curl -X POST http://localhost:3000/api/fiscal-config \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "Argentina",
    "fiscalRegime": "RESPONSABLE_INSCRIPTO",
    "cuit": "20-12345678-9",
    "defaultIvaRate": 21,
    "pointOfSale": 1
  }'

# 3. Get fiscal reports
curl -X GET "http://localhost:3000/api/fiscal-reports?reportType=resumen&startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer {TOKEN}"
```

## Phase 3: UI Components ✅ COMPLETE

All UI components created:

- ✅ FiscalConfigurationForm component
- ✅ FiscalReportsPage with 4 tabs

**Next**: Integrate into existing pages

### 3a. Add Fiscal Config to Business Settings

Edit `src/app/business-config/page.tsx`:

```tsx
import FiscalConfigurationForm from "@/components/business-config/FiscalConfigurationForm";

// In the main component, add this section:
<section className="mt-8">
  <h2 className="text-2xl font-bold mb-6">Configuración Fiscal</h2>
  <FiscalConfigurationForm />
</section>;
```

### 3b. Add Navigation Link to Fiscal Reports

Edit `src/components/layout/Header.tsx` (or navigation component):

Add menu item:

```tsx
{
  name: "Reportes Fiscales",
  href: "/reportes-fiscales",
  icon: FileText,
  category: "reports"
}
```

Or add to top navigation:

```tsx
<NavLink href="/reportes-fiscales" className="...">
  Reportes Fiscales
</NavLink>
```

## Phase 4: Invoice Integration

Connect invoice creation to WSFEv1 service.

### 4a. Create CAE Request Handler

Create new file: `src/lib/services/invoiceService.ts`

```typescript
import WSFEv1Service from "./wsfev1";
import FiscalConfiguration from "@/lib/models/FiscalConfiguration";
import Invoice from "@/lib/models/Invoice";

export async function requestCAEForInvoice(businessId: string, invoice: any) {
  // Get fiscal config
  const fiscal = await FiscalConfiguration.findOne({ business: businessId });
  if (!fiscal) {
    throw new Error("Fiscal configuration not found");
  }

  // Check certificates
  if (
    fiscal.certificateDigital?.status !== "VALID" ||
    fiscal.privateKey?.status !== "VALID"
  ) {
    throw new Error("Certificates not valid or not uploaded");
  }

  // Initialize WSFEv1
  const wsfe = new WSFEv1Service({
    wsaaUrl:
      process.env.AFIP_WSAA_URL ||
      "https://wsaahomo.afip.gov.ar/ws/services/LoginCMS",
    wsfev1Url:
      process.env.AFIP_WSFEV1_URL ||
      "https://servicios1905.afip.gov.ar/wsfev1/service.asmx",
    cuit: fiscal.cuit,
    certificatePath: fiscal.certificateDigital.storagePath,
    keyPath: fiscal.privateKey.storagePath,
    environment: process.env.AFIP_ENVIRONMENT || "testing",
  });

  // Get WSAA token
  const token = await wsfe.getWsaaToken();

  // Check for existing CAE (idempotency)
  const existing = await wsfe.queryCaeStatus(
    token.token,
    token.sign,
    invoice.fiscalData.pointOfSale,
    invoice.fiscalData.comprobanteTipo,
    invoice.fiscalData.invoiceSequence,
  );

  if (existing) {
    // CAE already issued
    invoice.fiscalData.cae = existing.cae;
    invoice.fiscalData.caeVto = existing.caeVto;
    invoice.fiscalData.caeStatus = "AUTHORIZED";
    await invoice.save();
    return existing;
  }

  // Request CAE
  const caeResponse = await wsfe.requestCAE(token.token, token.sign, {
    pointOfSale: invoice.fiscalData.pointOfSale,
    invoiceType: invoice.fiscalData.comprobanteTipo,
    invoiceSequence: invoice.fiscalData.invoiceSequence,
    customerDocumentType: mapDocumentType(invoice.customerCuit),
    customerDocumentNumber: normalizeDocumentNumber(invoice.customerCuit),
    customerName: invoice.customerName,
    invoiceDate: formatDateForAFIP(invoice.date),
    taxableAmount: calculateTaxableAmount(invoice),
    taxAmount: invoice.taxAmount,
    totalAmount: invoice.totalAmount,
    taxAliquots: buildTaxAliquots(invoice),
    exemptAmount: calculateExemptAmount(invoice),
    untaxedAmount: calculateUntaxedAmount(invoice),
  });

  // Update invoice with CAE
  invoice.fiscalData.cae = caeResponse.cae;
  invoice.fiscalData.caeVto = caeResponse.caeVto;
  invoice.fiscalData.caeStatus = "AUTHORIZED";
  invoice.status = "AUTHORIZED";
  await invoice.save();

  return caeResponse;
}
```

### 4b. Create Invoice API for CAE

Create: `src/app/api/invoices/request-cae/route.ts`

```typescript
import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import Invoice from "@/lib/models/Invoice";
import InvoiceAudit from "@/lib/models/InvoiceAudit";
import { authMiddleware } from "@/lib/middleware/auth";
import { requestCAEForInvoice } from "@/lib/services/invoiceService";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { businessId, userId, userEmail } = authResult.user!;
    const body = await req.json();
    const invoiceId = body.invoiceId;

    await dbConnect();

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      business: businessId,
    });

    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    // Request CAE
    const caeResponse = await requestCAEForInvoice(businessId, invoice);

    // Log action
    await InvoiceAudit.create({
      business: businessId,
      invoice: invoiceId,
      action: "CAE_RECEIVED",
      actionDescription: `CAE received: ${caeResponse.cae}`,
      userId,
      userEmail,
      afipResponse: {
        success: true,
        cae: caeResponse.cae,
        errorCode: null,
        errorMessage: null,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        cae: caeResponse.cae,
        caeVto: caeResponse.caeVto,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Error requesting CAE:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
```

### 4c. Update Invoice Creation

When creating invoice in POS or Sales module, add:

```typescript
// After invoice is created and saved:
if (invoiceType === "Factura A" || invoiceType === "Factura B") {
  // Request CAE
  invoice.status = "PENDING_CAE";
  await invoice.save();

  // Async CAE request (don't block user)
  fetch("/api/invoices/request-cae", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId: invoice._id }),
  }).catch((err) => console.error("CAE request failed:", err));
}
```

## Phase 5: PDF Generation

Integrate CAE into invoice PDF.

### 5a. Update PDF Service

Edit invoice PDF generation to include:

```typescript
// Add CAE to PDF
if (invoice.fiscalData?.cae) {
  // Add CAE number
  doc.text(`CAE: ${invoice.fiscalData.cae}`, x, y);
  doc.text(`Vto: ${formatDate(invoice.fiscalData.caeVto)}`, x, y + 10);

  // Add barcode (use barcode library)
  // JsBarcode or similar

  // Add QR code
  // qrcode library
  const qrData = {
    cuit: business.fiscalConfig.cuit,
    comprobanteTipo: invoice.fiscalData.comprobanteTipo,
    pointOfSale: invoice.fiscalData.pointOfSale,
    invoiceNumber: invoice.fiscalData.invoiceSequence,
    invoiceDate: invoice.date,
    totalAmount: invoice.totalAmount,
    cae: invoice.fiscalData.cae,
    afipLink: `https://servicios1905.afip.gov.ar/wsfev1/feconsulta`
  };
  QRCode.toDataURL(JSON.stringify(qrData), (err, url) => {
    doc.image(url, ...); // Add QR to PDF
  });
}
```

## Phase 6: Testing

### 6a. Unit Tests

Create test files:

- `__tests__/fiscal-config.test.ts`
- `__tests__/fiscal-reports.test.ts`
- `__tests__/wsfev1.test.ts`
- `__tests__/libro-iva-digital.test.ts`

### 6b. Integration Tests

Test with AFIP testing environment:

```bash
# Get AFIP testing certificates
# https://www.afip.gob.ar/wsaa/

# Run integration tests
npm test -- --integration
```

### 6c. Manual Testing

1. Configure fiscal settings with test CUIT
2. Upload test certificates
3. Create test invoice
4. Verify CAE is requested and received
5. Generate fiscal reports
6. Export Libro IVA Digital
7. Verify format matches AFIP specification

## Phase 7: Production Deployment

### 7a. Environment Setup

```bash
# Update .env.production
AFIP_ENVIRONMENT=production
AFIP_CUIT=20123456789  # Your actual CUIT
AFIP_CERT_PATH=/secure/certs/production.crt
AFIP_KEY_PATH=/secure/certs/production.pem
CERTIFICATE_STORAGE_PATH=/secure/fiscal_certificates
```

### 7b. Certificate Management

1. Download production certificates from AFIP
2. Store in secure location (HSM recommended)
3. Set file permissions (400 - read-only for server)
4. Test CAE request with production environment

### 7c. Go-Live Checklist

- [ ] Fiscal configuration saved with production CUIT
- [ ] Production certificates uploaded and validated
- [ ] Test invoice created successfully
- [ ] CAE received from AFIP
- [ ] PDF generated with CAE
- [ ] Fiscal reports generated correctly
- [ ] Libro IVA Digital format verified
- [ ] Backup and recovery procedure tested
- [ ] Monitoring and alerting configured
- [ ] User training completed

### 7d. Monitoring

Setup alerts for:

- Certificate expiry (30 days before)
- CAE request failures
- Export file validation failures
- Storage capacity warnings

## Phase 8: Post-Launch

### 8a. Monthly Tasks

- Generate and submit Libro IVA Digital to AFIP
- Review audit logs
- Verify all invoices have CAE
- Check for any error messages

### 8b. Maintenance

- Monitor certificate expiry
- Update AFIP endpoints if changed
- Review and optimize database indexes
- Maintain backup of fiscal data

### 8c. Feedback & Improvements

- Collect user feedback
- Monitor error rates
- Optimize performance
- Plan enhancements

---

## Timeline Estimate

| Phase | Task                | Duration | Status |
| ----- | ------------------- | -------- | ------ |
| 1     | Database & Models   | Done     | ✅     |
| 2     | Services & APIs     | Done     | ✅     |
| 3     | UI Components       | Done     | ✅     |
| 4     | Invoice Integration | 1-2 days | 🔄     |
| 5     | PDF Generation      | 1 day    | 🔄     |
| 6     | Testing             | 2-3 days | 🔄     |
| 7     | Production Deploy   | 1 day    | 🔄     |
| 8     | Go-Live & Support   | Ongoing  | ⏳     |

**Total: ~1 week to full production deployment**

---

## Support Resources

- **Technical Docs**: FISCAL_SYSTEM_IMPLEMENTATION.md
- **API Reference**: FISCAL_API_REFERENCE.md
- **Quick Start**: FISCAL_SYSTEM_QUICKSTART.md
- **AFIP Help**: https://www.afip.gob.ar/
- **Team Contact**: dev-team@company.com

---

**Start Date**: January 25, 2026
**Target Completion**: February 1, 2026
