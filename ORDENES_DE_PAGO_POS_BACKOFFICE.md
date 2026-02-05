# ÓRDENES DE PAGO – POS BACKOFFICE

Documento técnico funcional
Módulo: Cuentas a Pagar / Proveedores

## 1. Objetivo del módulo

Registrar y controlar pagos a proveedores de forma trazable, soportando pagos parciales, múltiples medios de pago y aplicación de Notas de Crédito. La Orden de Pago representa el acto financiero que genera movimientos reales de dinero.

## 2. Flujo general

Documento de proveedor (Factura / Nota Débito / Nota Crédito) → Orden de Pago → Movimientos de Tesorería → Comprobante / Firma proveedor

## 3. Datos de la Orden de Pago

**Encabezado:**

- Número de Orden de Pago (autoincremental)
- Fecha
- Proveedor
- Estado (Pendiente / Confirmada / Anulada)
- Usuario creador y aprobador
- Observaciones

## 4. Documentos a cancelar

Una Orden de Pago puede incluir uno o varios documentos del proveedor:

- Facturas de proveedor
- Notas de Débito

Cada documento puede pagarse total o parcialmente.

## 5. Aplicación de Notas de Crédito

Se pueden aplicar una o más Notas de Crédito del **mismo proveedor**. Las NC reducen el total a pagar y se tratan como **compensaciones**, no como medios de pago.

## 6. Medios de pago

Una Orden de Pago puede contener múltiples medios combinados:

- Efectivo
- Transferencia bancaria / Mercado Pago
- Cheque
- Tarjeta (si aplica)

## 7. Validaciones obligatorias

- Total documentos – Notas de Crédito = Total medios de pago.
- Solo se permiten documentos del mismo proveedor.
- No se puede confirmar una Orden de Pago con diferencias de saldo.
- Una Orden confirmada no puede editarse.

## 8. Impactos automáticos

Al confirmar una Orden de Pago el sistema debe:

- Generar movimientos de tesorería (egresos).
- Actualizar saldos de documentos de proveedor.
- Registrar auditoría completa del evento.

## 9. Auditoría y control

Cada Orden de Pago registra:

- Usuario creador
- Usuario aprobador
- Fecha y hora de confirmación
- IP del usuario (opcional)

---

## Implementación (resumen)

- Modelos: `SupplierDocument`, `PaymentOrder`, `PaymentOrderAudit`, `TreasuryMovement`.
- API:
  - `GET/POST` `/api/supplier-documents`
  - `GET/POST` `/api/payment-orders`
  - `GET/PUT` `/api/payment-orders/[id]` (confirmación/cancelación)

### Campos clave de integración

- `documents`: Facturas y Notas de Débito a cancelar (con importes aplicados).
- `creditNotes`: Notas de Crédito a aplicar.
- `payments`: Medios de pago con referencia y monto.
- `status`: PENDING / CONFIRMED / CANCELLED.

### Reglas de confirmación

- Validación de balance exacto antes de confirmar.
- Actualización de saldo por documento.
- Registro de tesorería por cada medio de pago.
- Auditoría CREATE/CONFIRM/CANCEL.
