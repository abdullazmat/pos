import { Schema, model, Document, models } from "mongoose";
import { MAX_DISCOUNT_PERCENT } from "@/lib/utils/discounts";

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phone?: string;
  role: "admin" | "supervisor" | "cashier";
  isActive: boolean;
  discountLimit?: number | null;
  internalPin?: string;
  businessId: Schema.Types.ObjectId;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ROLE_DEFAULT_DISCOUNT_LIMITS: Record<IUser["role"], number> = {
  admin: MAX_DISCOUNT_PERCENT,
  supervisor: MAX_DISCOUNT_PERCENT,
  cashier: MAX_DISCOUNT_PERCENT,
};

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "supervisor", "cashier"],
      default: "cashier",
    },
    discountLimit: {
      type: Number,
      min: 0,
      max: MAX_DISCOUNT_PERCENT,
      default: function (this: IUser) {
        return ROLE_DEFAULT_DISCOUNT_LIMITS[this.role ?? "cashier"] ?? 0;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    internalPin: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default models.User || model<IUser>("User", userSchema);
