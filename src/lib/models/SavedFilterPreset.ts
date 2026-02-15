import mongoose from "mongoose";

const SavedFilterPresetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    filters: {
      search: { type: String, default: "" },
      datePreset: { type: String, default: "all" },
      dateFrom: { type: String, default: "" },
      dateTo: { type: String, default: "" },
      category: { type: String, default: "all" },
      source: { type: String, default: "all" },
      amountMin: { type: String, default: "" },
      amountMax: { type: String, default: "" },
      paymentMethod: { type: String, default: "all" },
      reviewed: { type: String, default: "all" },
      supplier: { type: String, default: "all" },
    },
    isDefault: {
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

SavedFilterPresetSchema.index({ business: 1, user: 1 });
SavedFilterPresetSchema.index({ business: 1, isDefault: 1 });

export default mongoose.models.SavedFilterPreset ||
  mongoose.model("SavedFilterPreset", SavedFilterPresetSchema);
