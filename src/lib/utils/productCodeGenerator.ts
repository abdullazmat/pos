/**
 * Generates a unique product code
 * Format: PRD-YYYYMMDD-XXXXX (e.g., PRD-20260124-00001)
 */
export function generateProductCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const date = `${year}${month}${day}`;

  // Generate a random 5-digit number
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, "0");

  return `PRD-${date}-${random}`;
}

/**
 * Generates a product code with business ID prefix
 * Format: BID-YYYYMMDD-XXXXX (e.g., BID-20260124-00001)
 */
export function generateProductCodeWithBusinessId(businessId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const date = `${year}${month}${day}`;

  // Use first 3 chars of business ID
  const prefix = businessId.substring(0, 3).toUpperCase();

  // Generate a random 5-digit number
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, "0");

  return `${prefix}-${date}-${random}`;
}

/**
 * Generates a sequential product code
 * Format: SKU-XXXXX (e.g., SKU-00001)
 */
export async function generateSequentialProductCode(
  countExisting: number,
): Promise<string> {
  const sequential = String(countExisting + 1).padStart(5, "0");
  return `SKU-${sequential}`;
}
