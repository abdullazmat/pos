import { Schema, model, Document, models } from "mongoose";

export interface IKeyboardConfig extends Document {
  businessId: Schema.Types.ObjectId;
  profile: "classic" | "numeric" | "speedster" | "custom";
  shortcuts: {
    searchProduct: string;
    quantity: string;
    applyDiscount: string;
    paymentMethod: string;
    finalizeSale: string;
    cancelSale: string;
    removeLastItem: string;
    openDrawer: string;
    addProduct: string;
    quickPayment: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const keyboardConfigSchema = new Schema<IKeyboardConfig>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },
    profile: {
      type: String,
      enum: ["classic", "numeric", "speedster", "custom"],
      default: "classic",
    },
    shortcuts: {
      searchProduct: { type: String, default: "F2" },
      quantity: { type: String, default: "F3" },
      applyDiscount: { type: String, default: "F4" },
      paymentMethod: { type: String, default: "F5" },
      finalizeSale: { type: String, default: "F9" },
      cancelSale: { type: String, default: "F10" },
      removeLastItem: { type: String, default: "F8" },
      openDrawer: { type: String, default: "F11" },
      addProduct: { type: String, default: "Enter" },
      quickPayment: { type: String, default: "F12" },
    },
  },
  {
    timestamps: true,
  },
);

export default models.KeyboardConfig ||
  model<IKeyboardConfig>("KeyboardConfig", keyboardConfigSchema);
