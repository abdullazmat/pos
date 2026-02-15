import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    period: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      default: "monthly",
    },
    limitAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    alert80Sent: {
      type: Boolean,
      default: false,
    },
    alert100Sent: {
      type: Boolean,
      default: false,
    },
    emailAlerts: {
      type: Boolean,
      default: false,
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

BudgetSchema.index({ business: 1, category: 1, period: 1, year: 1, month: 1 });
BudgetSchema.index({ business: 1, year: 1 });

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);
