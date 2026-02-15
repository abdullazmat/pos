import mongoose from "mongoose";

const BudgetAlertSchema = new mongoose.Schema(
  {
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      enum: [80, 100],
    },
    percentage: {
      type: Number,
      required: true,
    },
    spent: {
      type: Number,
      required: true,
    },
    limitAmount: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailError: {
      type: String,
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

BudgetAlertSchema.index({ business: 1, createdAt: -1 });
BudgetAlertSchema.index({ budget: 1, level: 1 });
BudgetAlertSchema.index({ business: 1, acknowledgedAt: 1 });

export default mongoose.models.BudgetAlert ||
  mongoose.model("BudgetAlert", BudgetAlertSchema);
