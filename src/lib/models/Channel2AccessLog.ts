import { Schema, model, Document, models } from "mongoose";

export type Channel2Action =
  | "ACTIVATE"
  | "DEACTIVATE"
  | "TIMEOUT"
  | "CREATE_DOC"
  | "VIEW_DOCS";

export interface IChannel2AccessLog extends Document {
  businessId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  userEmail: string;
  userRole: string;
  action: Channel2Action;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const channel2AccessLogSchema = new Schema<IChannel2AccessLog>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["ACTIVATE", "DEACTIVATE", "TIMEOUT", "CREATE_DOC", "VIEW_DOCS"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: String,
    metadata: Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
  },
);

channel2AccessLogSchema.index({ businessId: 1, timestamp: -1 });
channel2AccessLogSchema.index({ businessId: 1, userId: 1, timestamp: -1 });

export default models.Channel2AccessLog ||
  model<IChannel2AccessLog>("Channel2AccessLog", channel2AccessLogSchema);
