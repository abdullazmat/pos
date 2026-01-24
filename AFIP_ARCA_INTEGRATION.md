# AFIP/ARCA Integration Guide

## Overview

ARCA (Customs Collection and Control Agency / Agencia de Recaudación y Control Aduanero) is Argentina's tax collection and control agency that has taken over most of AFIP's functions.

### What ARCA Does

#### 💰 Tax Collection

- **VAT (IVA)** - Value Added Tax (21%, 10.5%, 27%, or exempt)
- **Income Tax** - Personal and corporate income taxation
- **Monotributo** - Simplified tax regime for small businesses
- **Personal Assets Tax** - Wealth and property taxation

#### 🧾 Tax Control

- **Electronic Invoicing** - Mandatory e-invoicing through WSFE (Web Service de Facturación Electrónica)
- **Tax Audits** - Regular compliance audits
- **Inspections** - Field inspections and verifications

#### 🌎 Customs

- **Imports** - Import duties and documentation
- **Exports** - Export declarations and procedures

#### 👤 Taxpayer Registration

- **CUIT** - Código Único de Identificación Tributaria (Tax ID number)
- **Tax Key** - Digital certificate for electronic signatures
- **Tax Registrations** - Category and regime registrations
- **Official Name** - Business entity registration

## System Integration

### 1. Invoice Generation with AFIP CAE

```typescript
const authorization = await AFIPService.authorizeInvoice(invoice, token);
// Returns: { authorized: true, cae: "...", expiryDate: "..." }
```

The CAE (Código de Autorización Electrónica) is required on all invoices:

- Valid for 15 days from issuance
- Printed on invoice alongside QR code
- Used for compliance verification

### 2. CUIT Validation

```typescript
const isValid = AFIPService.validateCUIT("20-12345678-9");
// Validates format and check digit
```

CUIT Format: XX-XXXXXXXX-X

- First 2 digits: Document type
- Next 8 digits: Document number
- Last digit: Check digit

### 3. Invoice Types in Argentina

| Type      | Code | Use Case                    |
| --------- | ---- | --------------------------- |
| Factura A | 1    | B2B invoices (with CUIT)    |
| Factura B | 6    | B2C invoices (without CUIT) |
| Ticket    | 11   | Point of Sale receipt       |
| Factura M | 51   | Import purchases            |

### 4. VAT Rates

- **0%** - Exempt goods/services
- **10.5%** - Reduced rate items
- **21%** - Standard rate (most common)
- **27%** - Additional/special rate

## Configuration

### Environment Variables

```bash
# AFIP Authentication
AFIP_ENVIRONMENT=testing  # or production
AFIP_CUIT=20123456789
AFIP_CERT_PATH=/path/to/certificate.pem
AFIP_KEY_PATH=/path/to/privatekey.pem

# Company Info
AFIP_COMPANY_NAME="Your Business Name"
AFIP_INCOME_TAX_CATEGORY=Monotributo
```

## API Endpoints

### Get AFIP Configuration

```
GET /api/afip/config
```

Returns available invoice types, VAT rates, and currencies.

### Validate CUIT

```
POST /api/afip/validate-cuit
Body: { "cuit": "20-12345678-9" }
```

Validates CUIT format and AFIP registration status.

### Authorize Invoice

```
POST /api/afip/authorize-invoice
Body: {
  "invoiceNumber": "0001-00000001",
  "invoiceType": "B",
  "clientCUIT": "20-12345678-9",
  "clientName": "Cliente Name",
  "items": [...],
  "total": 1000
}
```

Gets CAE from AFIP for electronic invoice.

## Electronic Invoicing Workflow

1. **Generate Invoice** - Create invoice in system
2. **Validate Data** - Verify all required fields
3. **Authenticate with AFIP** - Get WSAA token
4. **Request CAE** - Call FECAESolicitar method
5. **Receive Authorization** - Store CAE and expiry date
6. **Print/Send Invoice** - Include CAE and QR code
7. **Store Record** - Keep invoice in database for compliance

## CUIT Registration Steps

For Monotributista (small business):

1. Go to AFIP.gob.ar
2. Register with DNI/CUIL
3. Submit income information
4. Receive CUIT assignment
5. Download digital certificate

## Client CUIT Validation Rules

- **B2B (Factura A)**: Requires valid CUIT
- **B2C (Factura B)**: CUIT optional (or DNI/CUIL)
- **POS (Ticket)**: No CUIT required (Consumidor Final)

## Monthly Tax Obligations

### For Monotributistas:

- Monthly/quarterly tax payment
- Annual income declaration
- VAT settlement (if applicable)

### For Responsable Inscripto:

- Monthly VAT returns
- Monthly tax payments
- Quarterly income reports

## Compliance Checklist

- ✅ All invoices must have CAE
- ✅ CUIT must be valid and verified
- ✅ VAT rates must be correct
- ✅ Invoice numbers must be sequential
- ✅ Digital signatures required for authorized invoices
- ✅ Records must be kept for 10 years
- ✅ Monthly compliance reports to AFIP

## Testing Environment

The system includes a testing/sandbox environment for development:

```typescript
AFIP_ENVIRONMENT = testing;
// Uses AFIP homologation servers
// Test invoices don't affect real records
// Can test CAE generation and validation
```

## Production Deployment

To use with real AFIP:

1. Obtain digital certificate from AFIP
2. Register company as Responsable Inscripto
3. Get authorized POS numbers
4. Update environment to `production`
5. Install valid WSAA certificate

## Support Resources

- **AFIP Official Site**: https://www.afip.gov.ar
- **ARCA Portal**: https://arca.gob.ar
- **WebServices Documentation**: https://www.afip.gov.ar/landing/afip-webservices
- **Monotributo Info**: https://www.afip.gov.ar/micrositios/monotributo

## Troubleshooting

### Invalid CUIT Error

- Check format: XX-XXXXXXXX-X
- Verify check digit calculation
- Ensure CUIT is registered with AFIP

### CAE Authorization Failed

- Verify invoice data completeness
- Check AFIP authentication token validity
- Ensure CUIT category matches invoice type

### Missing Certificate

- Download from AFIP personal account
- Verify certificate validity dates
- Check file path in environment config
