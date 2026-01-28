/**
 * Utility functions for handling decimal input formatting
 * Supports Argentine convention where commas are used as decimal separators
 */

/**
 * Converts Argentine decimal format (comma) to standard format (period)
 * Examples:
 * - "1,254" → "1.254" (1.254 kg of product)
 * - "1.254" → "1.254" (already in correct format)
 * - "1,25" → "1.25" (1.25 kg)
 * @param value String value that may contain comma as decimal separator
 * @returns String with period as decimal separator
 */
export function normalizeDecimalSeparator(value: string): string {
  // Replace comma with period for decimal separator
  return value.replace(",", ".");
}

/**
 * Parses quantity input handling both commas and periods
 * Validates against maximum 3 decimal places
 * @param value Input value from user
 * @returns Parsed number or null if invalid
 */
export function parseQuantity(value: string): number | null {
  if (!value || value.trim() === "") return null;

  const normalized = normalizeDecimalSeparator(value);
  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) return null;
  if (parsed < 0) return null;

  // Check for maximum 4 decimal places
  const decimalPlaces = (normalized.split(".")[1] || "").length;
  if (decimalPlaces > 4) {
    return null; // Invalid - too many decimal places
  }

  // Do not round, return as-is (up to 4 decimals)
  return parsed;
}

/**
 * Formats a number for display, showing up to 3 decimal places
 * Removes trailing zeros
 * @param value Numeric value to format
 * @param decimalPlaces Maximum decimal places to show (default: 3)
 * @returns Formatted string
 */
export function formatQuantity(
  value: number,
  decimalPlaces: number = 4,
): string {
  if (typeof value !== "number" || isNaN(value)) return "0";
  // Show up to 4 decimals, do not round
  let str = value.toString();
  if (str.includes(".")) {
    // Limit to 4 decimals, but do not pad
    const [intPart, decPart] = str.split(".");
    str = intPart + "." + decPart.slice(0, 4);
    // Remove trailing zeros
    str = str.replace(/(\.\d*?[1-9])0+$/, "$1");
    str = str.replace(/\.$/, "");
  }
  return str;
}

/**
 * Validates if a quantity is valid for the given product type
 * @param quantity Number to validate
 * @param isSoldByWeight Whether the product is sold by weight
 * @returns Object with isValid and error message
 */
export function validateQuantity(
  quantity: number | null,
  isSoldByWeight: boolean,
): { isValid: boolean; error?: string } {
  if (quantity === null || quantity === undefined) {
    return { isValid: false, error: "Quantity is required" };
  }

  if (quantity <= 0) {
    return { isValid: false, error: "Quantity must be greater than 0" };
  }

  if (isSoldByWeight) {
    // For weight products: allow decimals up to 4 places, minimum 3
    const decimalPlaces = (quantity.toString().split(".")[1] || "").length;
    if (decimalPlaces < 3 || decimalPlaces > 4) {
      return {
        isValid: false,
        error:
          "Quantity must have 3 or 4 decimal places for weight products (e.g., 1.560 or 1.5600)",
      };
    }
    // Minimum weight: 0.001 kg (1 gram)
    if (quantity < 0.001) {
      return {
        isValid: false,
        error: "Minimum weight is 0.001 kg (1 gram)",
      };
    }
  } else {
    // For unit products: only integers allowed
    if (!Number.isInteger(quantity)) {
      return {
        isValid: false,
        error: "Only whole numbers allowed for unit-based products",
      };
    }
    // Minimum quantity: 1
    if (quantity < 1) {
      return {
        isValid: false,
        error: "Minimum quantity is 1 unit",
      };
    }
  }

  return { isValid: true };
}

/**
 * Formats input value for display in quantity input field
 * Handles both unit and weight inputs
 * @param value Current input value
 * @param isSoldByWeight Whether product is weight-based
 * @returns Formatted value safe for display
 */
export function formatInputValue(
  value: string | number,
  isSoldByWeight: boolean,
): string {
  const stringValue = String(value);

  if (isSoldByWeight) {
    // For weight: normalize decimal separator but keep input as-is for user editing
    // User can type "1,254" or "1.254" - both work
    return stringValue;
  }

  // For units: ensure only digits
  return stringValue.replace(/[^\d]/g, "");
}

/**
 * Gets the appropriate step value for input element
 * @param isSoldByWeight Whether product is weight-based
 * @returns Step value for HTML input element
 */
export function getInputStep(isSoldByWeight: boolean): string {
  return isSoldByWeight ? "0.001" : "1";
}

/**
 * Gets the appropriate minimum value for input element
 * @param isSoldByWeight Whether product is weight-based
 * @returns Min value for HTML input element
 */
export function getInputMin(isSoldByWeight: boolean): string {
  return isSoldByWeight ? "0.001" : "1";
}

/**
 * Gets the appropriate placeholder text for quantity input
 * @param isSoldByWeight Whether product is weight-based
 * @param language Language code (en, es, pt)
 * @returns Placeholder text
 */
export function getInputPlaceholder(
  isSoldByWeight: boolean,
  language: string = "en",
): string {
  const placeholders = {
    en: {
      unit: "e.g., 5 units",
      weight: "e.g., 1.560 kg (or 1,560)",
    },
    es: {
      unit: "ej: 5 unidades",
      weight: "ej: 1.560 kg (o 1,560)",
    },
    pt: {
      unit: "ex: 5 unidades",
      weight: "ex: 1.560 kg (ou 1,560)",
    },
  };

  const lang =
    placeholders[language as keyof typeof placeholders] || placeholders.en;
  return isSoldByWeight ? lang.weight : lang.unit;
}
