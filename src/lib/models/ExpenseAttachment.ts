import mongoose from "mongoose";

const ExpenseAttachmentSchema = new mongoose.Schema(
  {
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
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
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["image", "pdf"],
      required: true,
    },
    mimeType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    ocrApplied: {
      type: Boolean,
      default: false,
    },
    ocrConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    ocrRawText: {
      type: String,
      default: null,
    },
    ocrExtracted: {
      date: { type: String, default: null },
      amount: { type: Number, default: null },
      taxId: { type: String, default: null },
      issuer: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  },
);

ExpenseAttachmentSchema.index({ expense: 1 });
ExpenseAttachmentSchema.index({ business: 1, createdAt: -1 });

export default mongoose.models.ExpenseAttachment ||
  mongoose.model("ExpenseAttachment", ExpenseAttachmentSchema);
