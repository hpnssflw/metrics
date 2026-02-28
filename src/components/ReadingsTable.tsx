"use client"

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MeterType, ValidationResult } from "@/types"

interface Props {
  meterType: MeterType
  values: Record<string, number | null>
  validation: ValidationResult | null
  confidence?: number
  onChange: (updated: Record<string, number | null>) => void
}

export function ReadingsTable({ meterType, values, validation, confidence, onChange }: Props) {
  const getFieldStatus = (fieldName: string) => {
    if (!validation) return null
    const field = meterType.meterSchema.fields.find((f) => f.name === fieldName)
    const issue = validation.details?.find((d) => d.includes(`"${field?.label}"`))
    if (validation.status === "valid") return "valid"
    if (issue && validation.status === "anomaly") return "anomaly"
    if (issue && validation.status === "invalid") return "invalid"
    if (validation.status === "anomaly" || validation.status === "invalid") return "valid"
    return null
  }

  return (
    <div className="space-y-4">
      {confidence !== undefined && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 shrink-0">Точность AI</span>
          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500",
                confidence > 0.8 ? "bg-green-500" : confidence > 0.5 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className={cn("text-xs font-semibold tabular-nums shrink-0",
            confidence > 0.8 ? "text-green-600" : confidence > 0.5 ? "text-amber-600" : "text-red-600"
          )}>
            {Math.round(confidence * 100)}%
          </span>
        </div>
      )}

      <div className="space-y-0.5">
        {meterType.meterSchema.fields.map((field) => {
          const status = getFieldStatus(field.name)
          return (
            <div key={field.name} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <label className="flex-1 text-sm text-slate-700 min-w-0">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  value={values[field.name] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : parseFloat(e.target.value)
                    onChange({ ...values, [field.name]: v })
                  }}
                  className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  placeholder={field.required ? "обяз." : "—"}
                />
                <span className="w-5 flex justify-center shrink-0">
                  {status === "valid" && <CheckCircle2 size={15} className="text-green-500" />}
                  {status === "anomaly" && <AlertTriangle size={15} className="text-amber-500" />}
                  {status === "invalid" && <XCircle size={15} className="text-red-500" />}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {validation && (
        <div className={cn(
          "rounded-xl p-3.5",
          validation.status === "valid" && "bg-green-50 border border-green-100",
          validation.status === "anomaly" && "bg-amber-50 border border-amber-100",
          validation.status === "invalid" && "bg-red-50 border border-red-100",
        )}>
          <p className={cn("font-semibold text-sm mb-1",
            validation.status === "valid" && "text-green-700",
            validation.status === "anomaly" && "text-amber-700",
            validation.status === "invalid" && "text-red-700",
          )}>
            {validation.status === "valid" ? "✓ Значения корректны"
              : validation.status === "anomaly" ? "⚠ Обнаружена аномалия"
              : "✗ Проверка не пройдена"}
          </p>
          <div className="space-y-0.5">
            {validation.details.map((d, i) => (
              <p key={i} className={cn("text-xs",
                validation.status === "valid" ? "text-green-600"
                  : validation.status === "anomaly" ? "text-amber-600" : "text-red-600"
              )}>• {d}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
