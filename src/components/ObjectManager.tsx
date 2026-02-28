"use client"

import { useEffect, useState } from "react"
import { Plus, Building2, ChevronDown, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MObject } from "@/types"

interface Props {
  selected: MObject | null
  onSelect: (obj: MObject | null) => void
}

export function ObjectManager({ selected, onSelect }: Props) {
  const [objects, setObjects] = useState<MObject[]>([])
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await fetch("/api/objects")
    const data = await res.json()
    setObjects(data)
    if (!selected && data.length > 0) onSelect(data[0])
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async () => {
    if (!name.trim() || !address.trim()) return
    setLoading(true)
    const res = await fetch("/api/objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address }),
    })
    if (res.ok) {
      const obj = await res.json()
      toast.success(`«${name}» добавлен`)
      setName(""); setAddress(""); setAdding(false)
      await load()
      onSelect(obj)
    } else {
      toast.error("Ошибка создания")
    }
    setLoading(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={selected?._id ?? ""}
            onChange={(e) => onSelect(objects.find((o) => o._id === e.target.value) ?? null)}
            className="w-full pl-10 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none transition-all cursor-pointer"
          >
            <option value="">Выберите объект...</option>
            {objects.map((o) => (
              <option key={o._id} value={o._id}>{o.name} — {o.address}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-11 h-11 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-500 hover:text-slate-700 shrink-0"
          title="Добавить объект"
        >
          <Plus size={17} />
        </button>
      </div>

      {adding && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setAdding(false)}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Добавить объект</h2>
                <p className="text-xs text-slate-400 mt-0.5">Здание или объект учёта</p>
              </div>
              <button
                onClick={() => setAdding(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5">
              <Input
                placeholder="Название (напр. Офис 42)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <Input
                placeholder="Адрес (напр. ул. Трудовая, 22)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={loading || !name.trim() || !address.trim()}
              className="w-full"
            >
              {loading ? "Добавляю..." : "Добавить"}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
