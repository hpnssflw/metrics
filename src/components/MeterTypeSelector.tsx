"use client"

import { useEffect, useState } from "react"
import { Gauge, ChevronDown } from "lucide-react"
import type { MeterType } from "@/types"

interface Props {
  selected: MeterType | null
  onSelect: (mt: MeterType | null) => void
}

export function MeterTypeSelector({ selected, onSelect }: Props) {
  const [types, setTypes] = useState<MeterType[]>([])

  useEffect(() => {
    fetch("/api/meter-types")
      .then((r) => r.json())
      .then((data) => {
        setTypes(data)
        if (!selected && data.length > 0) onSelect(data[0])
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <Gauge size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <select
        value={selected?._id ?? ""}
        onChange={(e) => onSelect(types.find((t) => t._id === e.target.value) ?? null)}
        className="w-full pl-10 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none transition-all cursor-pointer"
      >
        <option value="">Тип счётчика...</option>
        {types.map((t) => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}
