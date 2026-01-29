import { Schema, model, Document, models } from "mongoose";

export interface IProductSequence extends Document {
  businessId: Schema.Types.ObjectId;
  seq: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSequenceSchema = new Schema<IProductSequence>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

productSequenceSchema.index({ businessId: 1 }, { unique: true });

export default models.ProductSequence ||
  model<IProductSequence>("ProductSequence", productSequenceSchema);
