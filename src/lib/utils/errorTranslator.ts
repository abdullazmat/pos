/**
 * Error Translation Utility
 *
 * This utility provides functions to translate error messages from APIs
 * and other sources into user-friendly, internationalized messages.
 */

// Common error keys mapping
const ERROR_KEY_MAP: Record<string, string> = {
  // Auth errors
  "Invalid or expired token": "invalidOrExpiredToken",
  "Missing or invalid authorization header": "missingAuthHeader",
  Unauthorized: "unauthorized",
  "Access denied": "forbidden",
  Forbidden: "forbidden",
  "Invalid token": "invalidOrExpiredToken",

  // Session errors
  "Session expired": "sessionExpired",
  "Sesión expirada": "sessionExpired",

  // General errors
  "Internal server error": "internalServerError",
  "Missing required fields": "missingRequiredFields",
  "Invalid action": "invalidAction",
  "Invalid amount": "invalidAmount",
  "Not found": "notFound",
  "User not found": "notFound",
  "Product not found": "notFound",

  // Cash register errors
  "No open cash register found": "noOpenCashRegister",
  "No open cash register session": "noOpenCashRegister",

  // Product errors
  "Product code already exists": "productCodeExists",
  "El código ya existe": "productCodeExists",
  "Producto no encontrado": "notFound",
  "Missing product id": "missingRequiredFields",

  // User errors
  "El email ya está en uso": "emailInUse",
  "Email already in use": "emailInUse",
  "User already exists": "userAlreadyExists",
  "You cannot delete yourself": "cannotDeleteSelf",
  "User ID is required": "missingRequiredFields",

  // Validation errors
  "Validation error": "validationError",
  "Invalid plan ID": "invalidPlanId",
  "Invalid plan selection": "invalidPlanId",

  // Import errors
  "No se recibió ningún archivo": "noFileReceived",
  "Archivo no válido": "invalidFile",
  "Error al importar productos": "errorImportingProducts",
};

/**
 * Translates an error message to its error key
 * @param errorMessage The error message from the API
 * @returns The error key to use with the translation system
 */
export function getErrorKey(errorMessage: string | unknown): string {
  if (typeof errorMessage !== "string") {
    return "generic";
  }

  // Direct match
  if (ERROR_KEY_MAP[errorMessage]) {
    return ERROR_KEY_MAP[errorMessage];
  }

  // Partial match (case-insensitive)
  const lowerMessage = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(ERROR_KEY_MAP)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Pattern matching
  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("not authorized")
  ) {
    return "unauthorized";
  }
  if (
    lowerMessage.includes("token") &&
    (lowerMessage.includes("invalid") || lowerMessage.includes("expired"))
  ) {
    return "invalidOrExpiredToken";
  }
  if (lowerMessage.includes("session") && lowerMessage.includes("expired")) {
    return "sessionExpired";
  }
  if (lowerMessage.includes("not found")) {
    return "notFound";
  }
  if (
    lowerMessage.includes("forbidden") ||
    lowerMessage.includes("access denied")
  ) {
    return "forbidden";
  }
  if (lowerMessage.includes("validation")) {
    return "validationError";
  }
  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return "networkError";
  }
  if (lowerMessage.includes("server error")) {
    return "internalServerError";
  }

  // Default
  return "generic";
}

/**
 * Extracts error message from various error formats
 * @param error The error object
 * @returns The error message string
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const err = error as any;

    // Check common error properties
    if (err.error) return err.error;
    if (err.message) return err.message;
    if (err.details) return err.details;
    if (err.data?.error) return err.data.error;
    if (err.data?.message) return err.data.message;
  }

  return "generic";
}

/**
 * Gets the translated error key from an API error response
 * @param error The error from API
 * @returns The error key for translation
 */
export function translateApiError(error: unknown): string {
  const message = extractErrorMessage(error);
  return getErrorKey(message);
}
