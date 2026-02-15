import mongoose from "mongoose";

const RecurringExpenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    category: {
      type: String,
      trim: true,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ["monthly", "weekly", "biweekly", "annual"],
      required: true,
    },
    executionDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    requiresConfirmation: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "check", "transfer"],
      default: "cash",
    },
    lastGeneratedDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
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

RecurringExpenseSchema.index({ business: 1, active: 1 });
RecurringExpenseSchema.index({ business: 1, frequency: 1 });

export default mongoose.models.RecurringExpense ||
  mongoose.model("RecurringExpense", RecurringExpenseSchema);
