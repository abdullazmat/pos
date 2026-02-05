# CIRCUITO DE COMPROBANTES – POS 58 mm

Documento funcional y técnico

## Alcance

Define el circuito de impresión de comprobantes para POS con rollo de **58 mm**, incluyendo:

- Ticket Fiscal 58 mm (A/B)
- Comparativa visual entre Provisorio y Factura Fiscal
- Reglas obligatorias de impresión

---

## 1) Reglas obligatorias del sistema

1. **El sistema decide automáticamente** el comprobante a imprimir según el estado fiscal.
2. El cajero **no puede elegir** ni forzar manualmente el tipo de comprobante.
3. **Nunca** se imprime factura fiscal sin CAE.
4. El comprobante provisorio **no tiene validez fiscal**.
5. Las facturas fiscales **no se editan ni eliminan**.
6. Toda corrección se realiza mediante **Nota de Crédito (NC)**.
7. Las reimpresiones deben quedar **registradas en auditoría**.

---

## 2) Estados fiscales y acción de impresión

| Estado fiscal       | Situación                      | ¿Se imprime? | Comprobante                  |
| ------------------- | ------------------------------ | ------------ | ---------------------------- |
| **APPROVED**        | ARCA responde OK (CAE válido)  | Sí           | **Factura Fiscal A/B**       |
| **PENDING_CAE**     | ARCA no responde / timeout     | Sí           | **Presupuesto (Provisorio)** |
| **REJECTED**        | Datos inválidos / error fiscal | No           | **Ninguno**                  |
| **CANCELLED_BY_NC** | Venta anulada con NC           | No           | **Nota de Crédito**          |

---

## 3) Comparativa visual – Provisorio vs Factura Fiscal

| Característica        | Provisorio (Presupuesto) | Factura Fiscal (A/B)   |
| --------------------- | ------------------------ | ---------------------- |
| **Tipo de documento** | PRESUPUESTO              | FACTURA A / FACTURA B  |
| **Numeración**        | 01-003 (interna)         | 0001-00001234 (fiscal) |
| **CAE**               | No                       | Sí                     |
| **Vencimiento CAE**   | No                       | Sí                     |
| **QR Fiscal**         | No                       | Sí                     |
| **Validez fiscal**    | No válida                | Válida ante ARCA       |
| **Uso**               | Contingencia / respaldo  | Documento definitivo   |
| **Cuándo se imprime** | ARCA no responde         | ARCA responde OK       |
| **Edición**           | No editable              | No editable (solo NC)  |

---

## 4) Ticket Fiscal 58 mm (A/B)

### 4.1 Contenido mínimo

- **Encabezado:** Razón social, CUIT, dirección, fecha/hora
- **Tipo de comprobante:** “Factura Fiscal A” o “Factura Fiscal B”
- **Numeración fiscal:** Formato **0000-00000000**
- **Detalle de ítems:** descripción, cantidad, precio, total
- **Totales:** subtotal, descuentos, impuestos, total final
- **Datos fiscales:** CAE, vencimiento CAE
- **QR fiscal** (si aplica)
- **Leyenda legal** (si corresponde)

### 4.2 Comportamiento de impresión

- **A/B solo con CAE válido**.
- En contingencia, **no** imprime fiscal: imprime **Presupuesto**.
- El provisorio **debe** indicar explícitamente “**SIN VALIDEZ FISCAL**”.

---

## 5) Flujo operativo (resumen)

1. POS solicita autorización fiscal.
2. **ARCA OK →** imprime Factura Fiscal A/B.
3. **ARCA timeout →** imprime Presupuesto Provisorio y reintenta CAE.
4. **ARCA rechaza →** no imprime y solicita corrección.
5. **Anulación →** se emite Nota de Crédito (sin editar factura).

---

## 6) Auditoría

Toda impresión y reimpresión debe registrarse con:

- ID de venta
- Tipo de comprobante
- Estado fiscal
- Usuario que imprimió
- Fecha/hora

---

## 7) Notas técnicas de implementación

- El control de impresión debe evaluarse **en backend**.
- El estado fiscal se determina por: `arcaStatus`, `fiscalData.caeStatus` y presencia de CAE.
- La numeración fiscal se compone por **Punto de Venta** + **Número secuencial**.

---

## 8) Checklist de cumplimiento

- [ ] Bloquear impresión fiscal sin CAE
- [ ] Imprimir provisorio en PENDING_CAE
- [ ] Bloquear impresión en REJECTED
- [ ] Bloquear impresión de venta anulada por NC
- [ ] Registrar auditoría de impresión
- [ ] Mostrar leyenda “SIN VALIDEZ FISCAL” en provisionales
