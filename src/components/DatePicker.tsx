"use client"

import { Calendar } from "lucide-react"

interface Props {
  value: string // YYYY-MM-DD
  onChange: (v: string) => void
}

export function DatePicker({ value, onChange }: Props) {
  const monthValue = value.slice(0, 7)

  return (
    <div className="relative">
      <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
      <input
        type="month"
        value={monthValue}
        onChange={(e) => onChange(e.target.value + "-01")}
        className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer"
      />
    </div>
  )
}
