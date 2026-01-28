import Product from "@/lib/models/Product";

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

/**
 * Generates a date-based product code with a 3-digit business prefix
 * Format: BBB-YYYYMMDD-XXXXX (e.g., 697-20260125-40100)
 */
export async function generateDateBasedProductCode(
  businessId: string,
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const date = `${year}${month}${day}`;

  // Derive a stable 3-digit prefix from businessId
  const raw = String(businessId || "");
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) % 1000;
  }
  const prefix = String(hash).padStart(3, "0");

  const random = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `${prefix}-${date}-${random}`;
}

/**
 * Generates a simple 4-digit sequential product code
 * Format: XXXX (e.g., 0001, 0002, etc.)
 */
export async function generateSimple4DigitCode(
  businessId: string,
): Promise<string> {
  try {
    // Find the highest numeric code for this business
    const highestProduct = (await Product.findOne(
      { businessId },
      { code: 1 },
      { sort: { createdAt: -1 }, lean: true },
    )) as any;

    // If no products exist, start from 0001
    if (!highestProduct || !highestProduct?.code) {
      return "0001";
    }

    // Try to parse the existing code as a number
    const lastCodeNum = parseInt(highestProduct?.code, 10);

    if (!isNaN(lastCodeNum)) {
      // It's a numeric code, increment it
      const nextCode = lastCodeNum + 1;
      // Keep it to 4 digits max (0001-9999)
      if (nextCode > 9999) {
        // If we exceed 4 digits, reset to 0001 (circular)
        return "0001";
      }
      return String(nextCode).padStart(4, "0");
    }

    // If the code is not numeric, just start from the next available number
    // Count all numeric codes and use count + 1
    const allProducts = (await Product.find(
      { businessId },
      { code: 1 },
      { lean: true },
    )) as any[];

    const numericCodes = allProducts
      .map((p) => parseInt(p?.code, 10))
      .filter((n) => !isNaN(n))
      .sort((a, b) => b - a);

    const nextNum = numericCodes.length > 0 ? numericCodes[0] + 1 : 1;
    if (nextNum > 9999) {
      return "0001";
    }
    return String(nextNum).padStart(4, "0");
  } catch (error) {
    console.error("Error generating 4-digit code:", error);
    // Fallback: generate a random 4-digit code
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return random;
  }
}
