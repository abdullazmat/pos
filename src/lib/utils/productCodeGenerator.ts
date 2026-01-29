import Product from "@/lib/models/Product";
import ProductSequence from "@/lib/models/ProductSequence";

/**
 * Generates the next internal product ID (numeric, incremental, variable length)
 * This is intended for internal system use only.
 */
export async function generateNextProductInternalId(
  businessId: string,
): Promise<number> {
  const sequence = await ProductSequence.findOneAndUpdate(
    { businessId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return sequence.seq;
}

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
 * Generates a simple numeric sequential product code
 * Format: N (e.g., 1, 2, 3, 10000, etc.)
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

    // If no products exist, start from 1
    if (!highestProduct || !highestProduct?.code) {
      return "1";
    }

    // Try to parse the existing code as a number
    const lastCodeNum = parseInt(highestProduct?.code, 10);

    if (!isNaN(lastCodeNum)) {
      // It's a numeric code, increment it
      const nextCode = lastCodeNum + 1;
      return String(nextCode);
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
    return String(nextNum);
  } catch (error) {
    console.error("Error generating numeric code:", error);
    // Fallback: generate a random numeric code (variable length)
    const random = String(Math.floor(Math.random() * 1000000) + 1);
    return random;
  }
}
