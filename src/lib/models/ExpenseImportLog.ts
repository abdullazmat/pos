import mongoose from "mongoose";

const ExpenseImportLogSchema = new mongoose.Schema(
  {
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
    fileName: {
      type: String,
      required: true,
    },
    totalRows: {
      type: Number,
      required: true,
    },
    successCount: {
      type: Number,
      required: true,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    errors: [
      {
        row: Number,
        field: String,
        message: String,
      },
    ],
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

ExpenseImportLogSchema.index({ business: 1, createdAt: -1 });

export default mongoose.models.ExpenseImportLog ||
  mongoose.model("ExpenseImportLog", ExpenseImportLogSchema);
