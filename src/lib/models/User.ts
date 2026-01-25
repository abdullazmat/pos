import { Schema, model, Document, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phone?: string;
  role: "admin" | "supervisor" | "cashier";
  isActive: boolean;
  businessId: Schema.Types.ObjectId;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
    isActive: {
      type: Boolean,
      default: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
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
