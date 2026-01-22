import { Schema, model, Document, models } from "mongoose";

export interface IPlan extends Document {
  name: "free" | "pro";
  maxUsers: number;
  maxProducts: number;
  maxSales: number;
  features: {
    advancedReports: boolean;
    stockManagement: boolean;
    multipleLocations: boolean;
    apiAccess: boolean;
    customBranding: boolean;
  };
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      enum: ["free", "pro"],
      unique: true,
      required: true,
    },
    maxUsers: {
      type: Number,
      required: true,
    },
    maxProducts: {
      type: Number,
      required: true,
    },
    maxSales: {
      type: Number,
      default: -1,
    },
    features: {
      advancedReports: Boolean,
      stockManagement: Boolean,
      multipleLocations: Boolean,
      apiAccess: Boolean,
      customBranding: Boolean,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Plan || model<IPlan>("Plan", planSchema);
