import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    document: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    discountLimit: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
ClientSchema.index({ business: 1, name: 1 });

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
