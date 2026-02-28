import { z } from "zod"

export const MeterFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.literal("number"),
  required: z.boolean(),
  unit: z.string().optional(),
})

export const ObjectSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  createdAt: z.string().optional(),
})

export const MeterTypeSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required"),
  meterSchema: z.object({
    fields: z.array(MeterFieldSchema),
  }),
})

export const MeterReadingSchema = z.object({
  _id: z.string().optional(),
  objectId: z.string(),
  meterTypeId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  values: z.record(z.string(), z.number().nullable()),
  validationStatus: z.enum(["valid", "anomaly", "invalid", "pending"]).default("pending"),
  imageUrl: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  createdAt: z.string().optional(),
})

export const ExtractRequestSchema = z.object({
  imageBase64: z.string().min(1),
  meterTypeId: z.string().min(1),
})

export const ExtractResultSchema = z.object({
  values: z.record(z.string(), z.number().nullable()),
  confidence: z.number().min(0).max(1),
})

export const ValidateRequestSchema = z.object({
  objectId: z.string(),
  meterTypeId: z.string(),
  date: z.string(),
  values: z.record(z.string(), z.number().nullable()),
})

export const ValidationResultSchema = z.object({
  status: z.enum(["valid", "anomaly", "invalid"]),
  details: z.array(z.string()),
})

export const GenerateEmailRequestSchema = z.object({
  objectName: z.string(),
  address: z.string(),
  date: z.string(),
  meterTypeName: z.string(),
  meterTypeUnit: z.string(),
  values: z.record(z.string(), z.number().nullable()),
})
