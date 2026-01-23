import { Schema, model, Document, models } from "mongoose";

export interface IBusiness extends Document {
  name: string;

  businessId?: string;
  owner: Schema.Types.ObjectId;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  cuitRucDni?: string;
  ticketMessage?: string;
  city?: string;
  country?: string;
  subscriptionId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    address: String,
    website: String,
    cuitRucDni: String,
    ticketMessage: {
      type: String,
      default: "¡GRACIAS POR SU COMPRA!\nVuelva pronto",
    },
    city: String,
    country: String,
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
    },
  },
  {
    timestamps: true,
  },
);

export default models.Business || model<IBusiness>("Business", businessSchema);
