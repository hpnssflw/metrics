"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react"
import type { MeterField } from "@/types"

interface Reading {
  _id: string
  date: string
  values: Record<string, number>
  validationStatus: string
  confidence?: number
}

interface Props {
  objectId: string
  meterTypeId: string
  fields: MeterField[]
  unit: string
}

function StatusIcon({ status }: { status: string }) {
  if (status === "valid") return <CheckCircle2 size={14} className="text-green-500" />
  if (status === "anomaly") return <AlertTriangle size={14} className="text-amber-500" />
  if (status === "invalid") return <XCircle size={14} className="text-red-500" />
  return <Clock size={14} className="text-slate-300" />
}

function formatPeriod(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", { month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

export function ReadingsHistory({ objectId, meterTypeId, fields, unit }: Props) {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/readings?objectId=${objectId}&meterTypeId=${meterTypeId}`)
      .then((r) => r.json())
      .then((data) => setReadings(Array.isArray(data) ? data : []))
      .catch(() => setReadings([]))
      .finally(() => setLoading(false))
  }, [objectId, meterTypeId])

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">История показаний</p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">Загрузка...</div>
      ) : readings.length === 0 ? (
        <div className="py-10 text-center space-y-1">
          <p className="text-sm text-slate-400">История пуста</p>
          <p className="text-xs text-slate-300">Здесь появятся сохранённые показания</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400">Период</th>
                {fields.map((f) => (
                  <th key={f.name} className="text-right px-4 py-2.5 text-xs font-semibold text-slate-400 whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 text-center">✓</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr
                  key={r._id}
                  className={`hover:bg-slate-50/60 transition-colors ${i < readings.length - 1 ? "border-b border-slate-50" : ""}`}
                >
                  <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{formatPeriod(r.date)}</td>
                  {fields.map((f) => (
                    <td key={f.name} className="px-4 py-3 text-right text-slate-600 tabular-nums">
                      {r.values[f.name] !== undefined ? (
                        <>
                          <span className="font-medium">{r.values[f.name].toLocaleString()}</span>
                          <span className="text-slate-400 text-xs ml-1">{unit}</span>
                        </>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={r.validationStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
