import mongoose, { Schema, Document, models, model } from "mongoose"

export interface IMeterReading extends Document {
  objectId: mongoose.Types.ObjectId
  meterTypeId: mongoose.Types.ObjectId
  date: string
  values: Record<string, number | null>
  validationStatus: "valid" | "anomaly" | "invalid" | "pending"
  imageUrl?: string
  confidence?: number
  createdAt: Date
}

const MeterReadingSchema = new Schema<IMeterReading>(
  {
    objectId: { type: Schema.Types.ObjectId, ref: "Object", required: true },
    meterTypeId: { type: Schema.Types.ObjectId, ref: "MeterType", required: true },
    date: { type: String, required: true },
    values: { type: Schema.Types.Mixed, required: true },
    validationStatus: {
      type: String,
      enum: ["valid", "anomaly", "invalid", "pending"],
      default: "pending",
    },
    imageUrl: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
  },
  { timestamps: true }
)

MeterReadingSchema.index({ objectId: 1, meterTypeId: 1, date: -1 })

export const MeterReadingModel =
  models.MeterReading || model<IMeterReading>("MeterReading", MeterReadingSchema)
