# Fiscal System - API Reference

## Authentication

All endpoints require JWT authentication via `Authorization: Bearer {token}` header.

---

## Fiscal Configuration Endpoints

### GET /api/fiscal-config

Retrieve current fiscal configuration

**Response:**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "business": "507f1f77bcf86cd799439012",
    "country": "Argentina",
    "fiscalRegime": "RESPONSABLE_INSCRIPTO",
    "cuit": "20-12345678-9",
    "cuil": null,
    "cdi": null,
    "defaultIvaRate": 21,
    "pointOfSale": 1,
    "lastIssuedNumbers": {
      "typeA": 1234,
      "typeB": 567,
      "creditNote": 89,
      "debitNote": 0
    },
    "certificateDigital": {
      "fileName": "certificado.crt",
      "mimeType": "application/pkcs-certificate",
      "fileSize": 2048,
      "thumbprint": "abc123...",
      "expiryDate": "2026-12-31T00:00:00Z",
      "status": "VALID",
      "uploadedAt": "2026-01-15T10:30:00Z"
    },
    "privateKey": {
      "fileName": "clave_privada.key",
      "mimeType": "application/pkcs8",
      "fileSize": 1024,
      "status": "VALID",
      "uploadedAt": "2026-01-15T10:31:00Z"
    },
    "certificateLastValidated": "2026-01-25T08:00:00Z",
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-15T10:31:00Z"
  }
}
```

### POST /api/fiscal-config

Update fiscal configuration

**Request:**

```json
{
  "country": "Argentina",
  "fiscalRegime": "RESPONSABLE_INSCRIPTO",
  "cuit": "20-12345678-9",
  "defaultIvaRate": 21,
  "pointOfSale": 1
}
```

**Response:**

```json
{
  "message": "Fiscal configuration updated",
  "fiscal": {
    // Full fiscal config object
  }
}
```

**Errors:**

- `400`: CUIT is required
- `401`: Unauthorized
- `500`: Server error

---

## Digital Certificates Endpoints

### POST /api/fiscal-config/certificates

Upload digital certificate or private key

**Request (multipart/form-data):**

```
- certificateType: "certificateDigital" or "privateKey"
- certificateDigital: <.crt or .cer file>
  OR
- privateKey: <.key or .pem file>
```

**Response:**

```json
{
  "message": "Certificate uploaded successfully",
  "status": "VALID",
  "expiryDate": "2026-12-31T00:00:00Z"
}
```

**Validations:**

- Certificate file: Must contain "BEGIN CERTIFICATE"
- Private key: Must contain "BEGIN" and "PRIVATE KEY"
- File size: < 10MB recommended
- Format: Standard PEM format

**Errors:**

- `400`: Invalid file format
- `401`: Unauthorized
- `404`: Fiscal configuration not found
- `500`: Upload failed

### GET /api/fiscal-config/certificates

Check certificate status and expiry

**Response:**

```json
{
  "data": {
    "digital": {
      "status": "VALID",
      "expiryDate": "2026-12-31T00:00:00Z",
      "fileName": "certificado.crt",
      "uploadedAt": "2026-01-15T10:30:00Z",
      "isExpired": false
    },
    "privateKey": {
      "status": "VALID",
      "fileName": "clave_privada.key",
      "uploadedAt": "2026-01-15T10:31:00Z"
    }
  }
}
```

**Errors:**

- `401`: Unauthorized
- `404`: Fiscal configuration not found

---

## Fiscal Reports Endpoints

### GET /api/fiscal-reports

Generate fiscal reports

**Query Parameters:**

```
reportType=resumen|libro-ventas|libro-iva  (required)
startDate=YYYY-MM-DD                        (required)
endDate=YYYY-MM-DD                          (required)
```

#### Example 1: Resumen Report

```
GET /api/fiscal-reports?reportType=resumen&startDate=2026-01-01&endDate=2026-01-31
```

**Response:**

```json
{
  "data": {
    "reportType": "RESUMEN",
    "periodStart": "2026-01-01T00:00:00Z",
    "periodEnd": "2026-01-31T23:59:59Z",
    "invoiceCount": 45,
    "totalSales": 125000,
    "totalTaxableAmount": 100000,
    "totalTaxAmount": 21000,
    "totalExemptAmount": 0,
    "totalUntaxedAmount": 4000,
    "taxBreakdown": [
      {
        "rate": 21,
        "baseAmount": 100000,
        "taxAmount": 21000
      },
      {
        "rate": 10.5,
        "baseAmount": 0,
        "taxAmount": 0
      }
    ]
  }
}
```

#### Example 2: Libro de Ventas

```
GET /api/fiscal-reports?reportType=libro-ventas&startDate=2026-01-01&endDate=2026-01-31
```

**Response:**

```json
{
  "data": {
    "reportType": "LIBRO_VENTAS",
    "periodStart": "2026-01-01T00:00:00Z",
    "periodEnd": "2026-01-31T23:59:59Z",
    "invoiceCount": 45,
    "data": [
      {
        "date": "2026-01-15",
        "invoiceType": "Factura A",
        "invoiceNumber": 1234,
        "customerName": "ACME Corp",
        "customerCuit": "30-12345678-9",
        "neto": 1000,
        "iva": 210,
        "total": 1210,
        "cae": "12345678901234",
        "caeVto": "2026-02-28",
        "status": "AUTHORIZED"
      },
      {
        "date": "2026-01-16",
        "invoiceType": "Factura B",
        "invoiceNumber": 567,
        "customerName": "Juan Pérez",
        "customerCuit": null,
        "neto": 500,
        "iva": 105,
        "total": 605,
        "cae": "98765432109876",
        "caeVto": "2026-02-28",
        "status": "AUTHORIZED"
      }
    ]
  }
}
```

#### Example 3: Libro de IVA

```
GET /api/fiscal-reports?reportType=libro-iva&startDate=2026-01-01&endDate=2026-01-31
```

**Response:**

```json
{
  "data": {
    "reportType": "LIBRO_IVA",
    "periodStart": "2026-01-01T00:00:00Z",
    "periodEnd": "2026-01-31T23:59:59Z",
    "data": [
      {
        "aliquot": "0%",
        "baseAmount": 0,
        "taxAmount": 0
      },
      {
        "aliquot": "10.5%",
        "baseAmount": 0,
        "taxAmount": 0
      },
      {
        "aliquot": "21%",
        "baseAmount": 100000,
        "taxAmount": 21000
      }
    ]
  }
}
```

**Errors:**

- `400`: Missing required parameters
- `401`: Unauthorized
- `500`: Failed to generate report

---

### POST /api/fiscal-reports/export

Export fiscal report as CSV or XLSX

**Request:**

```json
{
  "reportType": "LIBRO_VENTAS|LIBRO_IVA",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "format": "csv|xlsx",
  "data": [
    // Array of report rows (from GET endpoint)
  ]
}
```

**Response:**

- File download (CSV or XLSX)
- Headers: `Content-Type: text/csv` or `application/vnd.ms-excel`
- Filename: `{REPORT_TYPE}_{START_DATE}_{END_DATE}.{format}`

**Audit Logging:**

- Export recorded with timestamp
- File hash (SHA256) calculated
- User tracking
- Row count stored

**Example CSV Output (Libro de Ventas):**

```
Fecha,Tipo de Comprobante,Número,Cliente,CUIT,Neto,IVA,Total,CAE,Estado
2026-01-15,Factura A,1234,ACME Corp,30-12345678-9,1000.00,210.00,1210.00,12345678901234,AUTHORIZED
2026-01-16,Factura B,567,Juan Pérez,,500.00,105.00,605.00,98765432109876,AUTHORIZED
```

**Errors:**

- `400`: Invalid report type or missing data
- `401`: Unauthorized
- `500`: Export failed

---

## WSFEv1 Service (Programmatic)

For developers integrating CAE requests programmatically:

```typescript
import WSFEv1Service from "@/lib/services/wsfev1";

const wsfe = new WSFEv1Service({
  wsaaUrl: "https://wsaahomo.afip.gov.ar/ws/services/LoginCMS",
  wsfev1Url: "https://servicios1905.afip.gov.ar/wsfev1/service.asmx",
  cuit: "20123456789",
  certificatePath: "/path/to/cert.crt",
  keyPath: "/path/to/key.pem",
  environment: "testing",
});

// Get authentication token
const tokenResponse = await wsfe.getWsaaToken();
// → { token: "...", sign: "...", expiryTime: Date }

// Get last invoice number
const lastNumber = await wsfe.getLastAuthorizedNumber(
  tokenResponse.token,
  tokenResponse.sign,
  1, // pointOfSale
  1, // invoiceType (1=Factura A)
);
// → 1234

// Request CAE
const caeResponse = await wsfe.requestCAE(
  tokenResponse.token,
  tokenResponse.sign,
  {
    pointOfSale: 1,
    invoiceType: 1,
    invoiceSequence: 1235,
    customerDocumentType: 80,
    customerDocumentNumber: "30123456789",
    customerName: "Customer Name",
    invoiceDate: "20260115",
    taxableAmount: 1000,
    taxAmount: 210,
    totalAmount: 1210,
    taxAliquots: [{ id: 3, baseAmount: 1000, taxAmount: 210 }],
  },
);
// → { cae: "12345678901234", caeVto: "20260228" }

// Check CAE status (idempotency)
const existing = await wsfe.queryCaeStatus(
  tokenResponse.token,
  tokenResponse.sign,
  1, // pointOfSale
  1, // invoiceType
  1235, // invoiceNumber
);
// → { cae: "12345678901234", caeVto: "20260228" } or null
```

---

## Libro IVA Digital Export (Programmatic)

For developers generating the official export file:

```typescript
import LibroIVADigitalExporter from "@/lib/services/libroIVADigitalExporter";

const exporter = new LibroIVADigitalExporter({
  cuit: "20123456789",
  fiscalYear: 2026,
  fiscalMonth: 1,
  fileName: "20123456789_202601_VENTAS_v1.txt",
});

const invoices = [
  {
    date: new Date("2026-01-15"),
    comprobanteTipo: 1,
    pointOfSale: 1,
    invoiceNumber: 1234,
    customerDocumentType: 80,
    customerDocument: "30123456789",
    customerName: "ACME Corp",
    totalAmount: 1210,
    taxableAmount: 1000,
    exemptAmount: 0,
    untaxedAmount: 0,
    taxAmount: 210,
    cae: "12345678901234",
    caeVto: "20260228",
    status: "AUTHORIZED",
    taxBreakdown: [{ aliquot: 21, baseAmount: 1000, taxAmount: 210 }],
  },
];

const txtContent = exporter.generateTxtFile(invoices);
// → String with full AFIP-format file content

const fileName = exporter.getFileName();
// → "20123456789_202601_VENTAS_v1.txt"

const checksum = LibroIVADigitalExporter.calculateChecksum(txtContent);
// → SHA256 hash for validation
```

---

## Error Codes

| Code | Meaning      | Action                      |
| ---- | ------------ | --------------------------- |
| 400  | Bad Request  | Check parameters and format |
| 401  | Unauthorized | Verify JWT token is valid   |
| 404  | Not Found    | Resource doesn't exist      |
| 500  | Server Error | Retry or contact support    |

## Rate Limiting

- No rate limiting on development
- Production: 100 requests/minute per business
- WSFEv1 service: Follow AFIP limits (10 requests/second)

## Testing

Use testing environment endpoints:

```
WSAA Testing: https://wsaahomo.afip.gov.ar/ws/services/LoginCMS
WSFEv1 Testing: https://servicios1905.afip.gov.ar/wsfev1/service.asmx
```

For testing, use certificate and key from AFIP testing facility.
