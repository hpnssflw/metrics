import { z } from "zod"
import {
  ObjectSchema,
  MeterTypeSchema,
  MeterReadingSchema,
  ExtractRequestSchema,
  ValidateRequestSchema,
  GenerateEmailRequestSchema,
  ValidationResultSchema,
  ExtractResultSchema,
} from "./schemas"

export type MObject = z.infer<typeof ObjectSchema>
export type MeterType = z.infer<typeof MeterTypeSchema>
export type MeterReading = z.infer<typeof MeterReadingSchema>
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>
export type ValidateRequest = z.infer<typeof ValidateRequestSchema>
export type GenerateEmailRequest = z.infer<typeof GenerateEmailRequestSchema>
export type ValidationResult = z.infer<typeof ValidationResultSchema>
export type ExtractResult = z.infer<typeof ExtractResultSchema>

export type ValidationStatus = "valid" | "anomaly" | "invalid" | "pending"

export interface MeterField {
  name: string
  label: string
  type: "number"
  required: boolean
  unit?: string
}

export interface ApiError {
  error: string
  details?: unknown
}
