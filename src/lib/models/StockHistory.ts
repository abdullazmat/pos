import { Schema, model, Document, models } from "mongoose";

export interface IStockHistory extends Document {
  businessId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  type: "sale" | "purchase" | "adjustment";
  quantity: number;
  reference?: Schema.Types.ObjectId;
  referenceModel?: string;
  notes?: string;
  createdAt: Date;
}

const stockHistorySchema = new Schema<IStockHistory>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["sale", "purchase", "adjustment"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reference: Schema.Types.ObjectId,
    referenceModel: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

stockHistorySchema.index({ businessId: 1, productId: 1 });

export default models.StockHistory ||
  model<IStockHistory>("StockHistory", stockHistorySchema);
