import { Schema, model, Document, models } from "mongoose";

export type StockMovementType =
  | "sale"
  | "purchase"
  | "adjustment"
  | "supplier_receipt"
  | "supplier_return";

export interface IStockHistory extends Document {
  businessId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  type: StockMovementType;
  quantity: Schema.Types.Decimal128 | number | string;
  reference?: Schema.Types.ObjectId;
  referenceModel?: string;
  referenceDocumentNumber?: string;
  supplierId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  unitCost?: number;
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
      enum: ["sale", "purchase", "adjustment", "supplier_receipt", "supplier_return"],
      required: true,
    },
    quantity: {
      type: Schema.Types.Decimal128,
      required: true,
      min: 0.0001,
    },
    reference: Schema.Types.ObjectId,
    referenceModel: String,
    referenceDocumentNumber: String,
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    unitCost: Number,
    notes: String,
  },
  {
    timestamps: true,
  },
);

stockHistorySchema.index({ businessId: 1, productId: 1 });
stockHistorySchema.index({ businessId: 1, type: 1, createdAt: -1 });
stockHistorySchema.index({ businessId: 1, supplierId: 1 });

export default models.StockHistory ||
  model<IStockHistory>("StockHistory", stockHistorySchema);
