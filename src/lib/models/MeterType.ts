import { Schema, Document, models, model } from "mongoose"

export interface IMeterField {
  name: string
  label: string
  type: "number"
  required: boolean
  unit?: string
}

export interface IMeterType extends Document {
  name: string
  unit: string
  meterSchema: {
    fields: IMeterField[]
  }
}

const MeterFieldSchema = new Schema<IMeterField>(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, default: "number" },
    required: { type: Boolean, default: false },
    unit: { type: String },
  },
  { _id: false }
)

const MeterTypeSchema = new Schema<IMeterType>({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  meterSchema: {
    fields: [MeterFieldSchema],
  },
})

export const MeterTypeModel = models.MeterType || model<IMeterType>("MeterType", MeterTypeSchema)
