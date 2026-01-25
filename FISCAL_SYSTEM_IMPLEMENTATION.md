# Fiscal Reporting System - Implementation Guide

## Overview

This document describes the complete fiscal reporting system for the NexoFact POS SaaS platform, covering:

- Fiscal Configuration Management
- Digital Certificate Handling
- Electronic Invoicing (WSFEv1 - AFIP Argentina)
- Fiscal Reports (Libro de Ventas, Libro de IVA)
- Libro IVA Digital Export

## Architecture

### Database Models

#### 1. Business Model (Extended)

- **Location**: `src/lib/models/Business.ts`
- **Fiscal Fields**:
  ```typescript
  fiscalConfig?: {
    country: string;                    // "Argentina", "Chile", "Perú"
    fiscalRegime: string;               // RESPONSABLE_INSCRIPTO, MONOTRIBUTO, EXENTO
    ivaRate: number;                    // Default VAT rate
    cuit: string;                       // Tax ID
    pointOfSale: number;                // Punto de Venta
    lastInvoiceNumber: { typeA, typeB }; // For CAE tracking
    certificateStatus: string;          // PENDING, VALID, EXPIRED
    certificateExpiryDate: Date;
  }
  ```

#### 2. FiscalConfiguration Model

- **Location**: `src/lib/models/FiscalConfiguration.ts`
- **Purpose**: Manage certificates and detailed fiscal settings
- **Key Fields**:
  - `certificateDigital`: Digital certificate (.crt/.cer) metadata
  - `privateKey`: Private key (.key/.pem) metadata (encrypted path only)
  - `fiscalRegime`: Régimen Fiscal
  - `cuit`: CUIT/CUIL/CDI
  - `lastIssuedNumbers`: Track last invoice by type
  - `wsaaToken`: Cached WSAA authentication token

#### 3. Invoice Model (Extended)

- **Location**: `src/lib/models/Invoice.ts`
- **Fiscal Fields**:
  ```typescript
  status: InvoiceStatus;               // DRAFT, PENDING_CAE, AUTHORIZED, VOIDED, CANCELLED
  channel: InvoiceChannel;             // Added WSFE for electronic invoicing
  fiscalData: {
    comprobanteTipo: number;           // 1=Factura A, 6=Factura B, etc.
    cae: string;                       // Código de Autorización Electrónica
    caeVto: string;                    // CAE expiry (YYYYMMDD)
    caeNro: string;                    // CAE number (13 digits)
    caeStatus: string;                 // CAE authorization status
    pointOfSale: number;
    invoiceSequence: number;
    taxBreakdown: Array<{...}>;        // Tax details for Libro IVA
    requestId: string;                 // For idempotency
    afipResponseTimestamp: Date;
  }
  ```

#### 4. InvoiceAudit Model

- **Location**: `src/lib/models/InvoiceAudit.ts`
- **Purpose**: Track all invoice changes, exports, and CAE requests
- **Key Fields**:
  - `action`: CREATE, UPDATE, CAE_REQUEST, CAE_RECEIVED, EXPORT, VOID
  - `reportType`: LIBRO_VENTAS, LIBRO_IVA, LIBRO_IVA_DIGITAL, RESUMEN
  - `afipResponse`: AFIP response tracking
  - `fileHash`: SHA256 hash for export validation

### API Endpoints

#### Fiscal Configuration

- **GET** `/api/fiscal-config` - Retrieve fiscal configuration
- **POST** `/api/fiscal-config` - Update fiscal settings

#### Digital Certificates

- **POST** `/api/fiscal-config/certificates` - Upload certificate or private key
- **GET** `/api/fiscal-config/certificates` - Check certificate status

#### Fiscal Reports

- **GET** `/api/fiscal-reports` - Generate fiscal reports
  - Query params: `reportType`, `startDate`, `endDate`
  - Report types: `resumen`, `libro-ventas`, `libro-iva`
- **POST** `/api/fiscal-reports/export` - Export reports as CSV/XLSX

### Services

#### WSFEv1 Service

- **Location**: `src/lib/services/wsfev1.ts`
- **Purpose**: Electronic invoicing integration with AFIP
- **Key Methods**:
  - `getWsaaToken()` - Obtain authentication token from WSAA
  - `requestCAE()` - Request CAE authorization
  - `getLastAuthorizedNumber()` - Get last authorized invoice number
  - `queryCaeStatus()` - Check if CAE was already issued (for idempotency)
- **Handles**:
  - RSA-SHA256 digital signature
  - SOAP requests to AFIP services
  - Error handling and timeouts
  - Idempotent CAE requests

#### LibroIVADigitalExporter

- **Location**: `src/lib/services/libroIVADigitalExporter.ts`
- **Purpose**: Generate official Libro IVA Digital export format
- **Format**: TXT with fixed field widths per AFIP specification
- **Key Methods**:
  - `generateTxtFile()` - Complete export file
  - `generateHeaderRecord()` - Record type 01 (header)
  - `generateSalesRecord()` - Record type 02 (sales)
  - `generateVoidedRecord()` - Record type 03 (voided)
  - `generateTaxRateRecord()` - Record type 04 (tax summary)
  - `generateFooterRecord()` - Record type 05 (footer/totals)
- **Output**: Single .txt file with all records and checksums

### UI Components

#### FiscalConfigurationForm

- **Location**: `src/components/business-config/FiscalConfigurationForm.tsx`
- **Features**:
  - Fiscal regime selection
  - Country selection
  - CUIT/CUIL/CDI input
  - VAT rate configuration
  - Certificate upload (digital + private key)
  - Certificate status display
  - Security warnings for private key

#### FiscalReportsPage

- **Location**: `src/app/reportes-fiscales/page.tsx`
- **Features**:
  - Date range selector with "This Month" quick button
  - 4 tabs: Resumen, Libro de Ventas, Libro de IVA, Configuración
  - Resumen: KPIs and tax breakdown table
  - Libro de Ventas: Detailed invoice table with filters
  - Libro de IVA: Tax breakdown by aliquot
  - CSV/XLSX export buttons
  - Audit logging of all exports

## Workflow

### 1. Setup Fiscal Configuration

1. User navigates to Business Settings
2. Completes Fiscal Configuration Form:
   - Selects country (Argentina, Chile, Perú)
   - Selects fiscal regime
   - Enters CUIT/CUIL/CDI
   - Sets default VAT rate
   - Sets Point of Sale (POS) number
3. Saves configuration (API: POST `/api/fiscal-config`)
4. Configuration stored in `FiscalConfiguration` model

### 2. Upload Digital Certificates

1. User uploads digital certificate (.crt/.cer file)
   - API validates format
   - Extracts expiry date and thumbprint
   - Stores encrypted at secure path
   - Updates `certificateDigital` metadata
2. User uploads private key (.key/.pem file)
   - API validates format
   - Calculates SHA256 hash
   - Stores encrypted with highest security
   - Updates `privateKey` metadata
   - **CRITICAL**: Private key is never exposed or displayed
3. System displays certificate status and expiry dates

### 3. Electronic Invoice Workflow (WSFEv1)

When issuing an electronic invoice (Factura A or B):

1. **Get WSAA Token** (if expired):

   ```
   WSFEv1Service.getWsaaToken()
   ├─ Read certificate and private key
   ├─ Create login ticket XML
   ├─ Sign with RSA-SHA256
   └─ Get token + signature from WSAA
   ```

2. **Check Last Invoice Number**:

   ```
   WSFEv1Service.getLastAuthorizedNumber(pointOfSale, invoiceType)
   └─ Returns next sequence number
   ```

3. **Request CAE**:

   ```
   WSFEv1Service.requestCAE(token, sign, invoiceData)
   ├─ Build FECAESolicitar SOAP request
   ├─ Include tax breakdown (aliquots)
   ├─ Submit to AFIP WSFEv1
   └─ Receive CAE + expiry (CAE_vto)
   ```

4. **Handle Idempotency**:
   - If request timeout: `WSFEv1Service.queryCaeStatus()`
   - Check if CAE was already issued
   - Prevent duplicate requests

5. **Store CAE in Invoice**:

   ```typescript
   invoice.fiscalData = {
     cae: "12345678901234", // 14 digits
     caeVto: "20260228", // Expiry date
     caeStatus: "AUTHORIZED",
     comprobanteTipo: 1, // Factura A
     pointOfSale: 1,
     invoiceSequence: 1234,
   };
   ```

6. **Generate PDF with CAE**:
   - Include CAE number
   - Add barcode (13 digits)
   - Add QR code with full invoice data
   - Mark as "Factura Electrónica Autorizada por AFIP"

### 4. Fiscal Reports Generation

#### Resumen Report

- Date range filter
- KPIs: Invoice count, total sales, taxable amount, IVA total
- Tax breakdown by aliquot (21%, 10.5%, 0%, etc.)
- Source: All authorized invoices with CAE

#### Libro de Ventas

- Chronological list of all issued invoices
- Columns: Date, Type, Number, Customer, CUIT, Net, VAT, Total, CAE, Status
- Filters: Point of Sale, Invoice Type, Status
- Export: CSV + XLSX
- Only includes AUTHORIZED invoices (with valid CAE)

#### Libro de IVA

- Tax breakdown by aliquot
- Columns: Aliquot (%), Taxable Base, VAT Amount
- Calculation: Sum of all tax items by rate
- Export: CSV format

#### Libro IVA Digital

- Official AFIP export format (TXT)
- Record structure per official design:
  - Record 01: Header (period, company)
  - Record 02: Sales (one per authorized invoice)
  - Record 03: Voided (one per cancelled invoice)
  - Record 04: Tax summaries (by aliquot)
  - Record 05: Footer (totals and checksums)
- File naming: `{CUIT}_{YYYYMM}_VENTAS_v1.txt`
- Includes SHA256 checksum
- Can be imported directly into Portal IVA

### 5. Audit Logging

Every action is logged to `InvoiceAudit`:

- Invoice creation/update
- CAE requests and responses
- Report exports (with file hash)
- Timestamp and user tracking

## Technical Details

### Certificate Management

1. **Upload Process**:
   - Files validated for correct format
   - Encrypted before storage
   - Only metadata paths stored in DB
   - Never transmitted over unencrypted connection

2. **Storage** (Production Recommendations):
   - Use HSM (Hardware Security Module) for private keys
   - Or AWS KMS / Azure Key Vault for encryption
   - Implement key rotation policies
   - Audit all certificate access

3. **Expiry Handling**:
   - Extract expiry date during upload
   - Display warnings 30 days before expiry
   - Prevent CAE requests with expired certs
   - Automatic status updates

### WSAA Authentication

- Token valid for 12 hours
- Cached in `FiscalConfiguration.wsaaToken`
- Automatic refresh when expired
- Uses SOAP/XML over HTTPS

### CAE Authorization

- Standard AFIP WSFEv1 service
- Comprobante Tipos supported:
  - 01: Factura A (IVA Discriminado - CUIT required)
  - 06: Factura B (IVA Incluído - Consumidor Final)
  - 03: Nota de Crédito A
  - 07: Nota de Crédito B
  - 08: Nota de Débito A
  - 13: Nota de Débito B
- Returns 14-digit CAE valid for 30 days
- Supports multiple tax aliquots per invoice

### Idempotency

- Each CAE request has unique `requestId`
- Store request timestamp
- If timeout: query AFIP with `FECompConsultar`
- Prevents double-invoicing

### File Exports

- SHA256 hash calculated for each export
- Audit logged with timestamp, user, file hash
- CSV format with proper escaping
- XLSX support (requires library like xlsx)
- Libro IVA Digital as TXT per AFIP format

## Security Considerations

1. **Private Key Protection**:
   - Never store or transmit unencrypted
   - Use HSM or Key Management Service
   - Restrict file permissions
   - Audit all access

2. **Certificate Validation**:
   - Verify certificate chain
   - Check expiry before use
   - Validate thumbprint

3. **HTTPS Only**:
   - All AFIP communication over TLS
   - Certificate pinning recommended
   - No mixed content

4. **Access Control**:
   - Business owner only
   - Admin role for exports
   - Audit trail for compliance

5. **Data Protection**:
   - Encrypted at rest
   - Encrypted in transit
   - Encrypted backups
   - PII handling per regulations

## Environment Variables

```bash
# AFIP Configuration
AFIP_ENVIRONMENT=testing|production     # Default: testing
AFIP_CUIT=20123456789                  # Company CUIT
AFIP_CERT_PATH=/path/to/cert.crt       # Certificate path
AFIP_KEY_PATH=/path/to/key.pem         # Private key path
AFIP_COMPANY_NAME="Mi Empresa S.A."    # Company name

# Database
MONGODB_URI=mongodb://...              # MongoDB connection

# Storage (for certificates)
CERTIFICATE_STORAGE_PATH=/secure/certs # Encrypted storage
```

## Testing

### Test Cases

1. **Fiscal Configuration**:
   - Save fiscal settings ✓
   - Update settings ✓
   - Validate CUIT format ✓

2. **Certificate Upload**:
   - Upload valid certificate ✓
   - Reject invalid format ✓
   - Extract expiry date ✓
   - Upload private key ✓
   - Check certificate status ✓

3. **Reports**:
   - Generate Resumen ✓
   - Generate Libro de Ventas ✓
   - Generate Libro de IVA ✓
   - Export to CSV ✓
   - Verify audit logs ✓

4. **WSFEv1** (Integration Tests):
   - Get WSAA token ✓
   - Request CAE ✓
   - Query CAE status ✓
   - Handle timeouts ✓
   - Idempotency ✓

5. **Libro IVA Digital**:
   - Generate TXT file ✓
   - Verify record format ✓
   - Calculate checksums ✓
   - Import test ✓

## Future Enhancements

1. **Nota de Crédito/Débito**: Full support for credit/debit notes
2. **Multi-Currency**: Support for multiple currencies per country
3. **Withholding Tax**: IB, IIBB, SUSS tracking
4. **Export Integration**: Direct API integration with AFIP portal
5. **Mobile App**: Fiscal reports on mobile
6. **Advanced Filtering**: Complex report queries
7. **Scheduled Exports**: Automatic monthly exports
8. **Signature Verification**: AFIP response validation
9. **Audit Reports**: Compliance reports for auditors
10. **Regional Adaptations**: Chile (SII) and Perú (SUNAT) modules

## References

- [AFIP WSFEv1 Documentation](https://www.afip.gob.ar/wsfev1/)
- [Libro IVA Digital Format](https://www.afip.gob.ar/iva/documentos/libro-iva-digital-diseno-registros.pdf)
- [WSAA Authentication](https://www.afip.gob.ar/wsaa/)
- [Argentina Digital Certificate](https://www.afip.gob.ar/certificados/)

## Support

For questions or issues, contact:

- Technical Support: support@nexofact.com
- AFIP Help: https://www.afip.gob.ar/contactos/
