import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "check", "transfer"],
      default: "cash",
    },
    notes: {
      type: String,
      trim: true,
    },
    attachment: {
      fileName: { type: String },
      fileUrl: { type: String },
      fileSize: { type: Number },
      mimeType: { type: String },
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    source: {
      type: String,
      enum: ["manual", "vendor", "recurring", "import"],
      default: "manual",
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    vendorDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplierDocument",
      default: null,
    },
    recurringExpenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringExpense",
      default: null,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
ExpenseSchema.index({ business: 1, date: -1 });
ExpenseSchema.index({ business: 1, source: 1 });
ExpenseSchema.index({ purchaseId: 1 }, { sparse: true });
ExpenseSchema.index({ vendorDocumentId: 1 }, { sparse: true });
ExpenseSchema.index({ recurringExpenseId: 1 }, { sparse: true });
ExpenseSchema.index({ supplier: 1 }, { sparse: true });
ExpenseSchema.index({ business: 1, category: 1 });
ExpenseSchema.index({ business: 1, paymentMethod: 1 });

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
