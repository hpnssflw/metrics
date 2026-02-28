import mongoose, { Schema, Document, models, model } from "mongoose"

export interface IObject extends Document {
  name: string
  address: string
  createdAt: Date
}

const ObjectSchema = new Schema<IObject>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
)

export const ObjectModel = models.Object || model<IObject>("Object", ObjectSchema)
