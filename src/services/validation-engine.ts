import { MeterReadingModel } from "@/lib/models/MeterReading"
import { MeterTypeModel } from "@/lib/models/MeterType"
import { connectDB } from "@/lib/mongodb"
import type { ValidationResult } from "@/types"

interface ValidateParams {
  objectId: string
  meterTypeId: string
  date: string
  values: Record<string, number | null>
}

export async function validateReading(params: ValidateParams): Promise<ValidationResult> {
  await connectDB()
  const details: string[] = []
  let status: "valid" | "anomaly" | "invalid" = "valid"

  const meterType = await MeterTypeModel.findById(params.meterTypeId)
  if (!meterType) {
    return { status: "invalid", details: ["Meter type not found"] }
  }

  // Rule 1 & 2: Type and required checks
  for (const field of meterType.meterSchema.fields) {
    const val = params.values[field.name]
    if (field.required && (val === null || val === undefined)) {
      status = "invalid"
      details.push(`Required field "${field.label}" is missing`)
      continue
    }
    if (val !== null && val !== undefined && typeof val !== "number") {
      status = "invalid"
      details.push(`Field "${field.label}" must be a number`)
    }
  }

  if (status === "invalid") return { status, details }

  // Fetch previous reading for this object+meterType
  const previous = await MeterReadingModel.findOne({
    objectId: params.objectId,
    meterTypeId: params.meterTypeId,
    date: { $lt: params.date },
  }).sort({ date: -1 })

  if (!previous) {
    // First reading — valid if numeric checks passed
    details.push("First reading for this meter — baseline established")
    return { status: "valid", details }
  }

  // Fetch history for average calculation (last 6 readings)
  const history = await MeterReadingModel.find({
    objectId: params.objectId,
    meterTypeId: params.meterTypeId,
    date: { $lt: params.date },
  })
    .sort({ date: -1 })
    .limit(6)

  for (const field of meterType.meterSchema.fields) {
    const newVal = params.values[field.name]
    if (newVal === null || newVal === undefined) continue

    const prevVal = previous.values?.[field.name]
    if (prevVal === null || prevVal === undefined) continue

    // Rule 3: Monotonic — new >= previous
    if (newVal < prevVal) {
      status = "invalid"
      details.push(
        `Field "${field.label}": new value ${newVal} is less than previous ${prevVal}`
      )
      continue
    }

    // Rule 4: Delta anomaly check
    if (history.length >= 2) {
      const deltas: number[] = []
      for (let i = 0; i < history.length - 1; i++) {
        const curr = history[i].values?.[field.name]
        const prev = history[i + 1].values?.[field.name]
        if (curr != null && prev != null) {
          deltas.push(curr - prev)
        }
      }

      if (deltas.length > 0) {
        const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length
        const delta = newVal - prevVal
        if (avg > 0 && delta > avg * 3) {
          if (status === "valid") status = "anomaly"
          details.push(
            `Field "${field.label}": delta ${delta.toFixed(2)} exceeds 3× average ${avg.toFixed(2)}`
          )
        }
      }
    }
  }

  if (details.length === 0) details.push("All checks passed")

  return { status, details }
}
