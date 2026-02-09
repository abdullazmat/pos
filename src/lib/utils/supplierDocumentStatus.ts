import type {
  ISupplierDocument,
  SupplierDocumentStatus,
} from "@/lib/models/SupplierDocument";

export const DEFAULT_DUE_SOON_DAYS = 5;

export const computeSupplierDocumentStatus = (
  doc: Pick<
    ISupplierDocument,
    | "status"
    | "balance"
    | "dueDate"
    | "appliedPaymentsTotal"
    | "appliedCreditsTotal"
  >,
  now: Date = new Date(),
  dueSoonDays: number = DEFAULT_DUE_SOON_DAYS,
): SupplierDocumentStatus => {
  if (doc.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (doc.balance <= 0) {
    return "APPLIED";
  }

  if (
    (doc.appliedPaymentsTotal || 0) > 0 ||
    (doc.appliedCreditsTotal || 0) > 0
  ) {
    return "PARTIALLY_APPLIED";
  }

  if (doc.dueDate) {
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    if (doc.dueDate.getTime() < endOfToday.getTime()) {
      return "OVERDUE";
    }

    const dueSoonThreshold = new Date(now);
    dueSoonThreshold.setDate(dueSoonThreshold.getDate() + dueSoonDays);
    dueSoonThreshold.setHours(23, 59, 59, 999);

    if (doc.dueDate.getTime() <= dueSoonThreshold.getTime()) {
      return "DUE_SOON";
    }
  }

  return "PENDING";
};
