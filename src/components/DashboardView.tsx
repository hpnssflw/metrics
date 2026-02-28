"use client"

import { useEffect, useState, useMemo } from "react"
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MObject, MeterType } from "@/types"

interface Reading {
  _id: string
  objectId: string
  meterTypeId: string
  date: string
  values: Record<string, number>
  validationStatus: string
  confidence?: number
}

interface ExpandedRow {
  key: string
  period: string
  rawDate: string
  address: string
  meterTypeName: string
  fieldLabel: string
  value: number | undefined
  unit: string
  status: string
}

function formatPeriod(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
  } catch {
    return dateStr
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "valid") return (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 gap-1">
      <CheckCircle2 size={11} /> ОК
    </Badge>
  )
  if (status === "anomaly") return (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 gap-1">
      <AlertTriangle size={11} /> Аномалия
    </Badge>
  )
  if (status === "invalid") return (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 gap-1">
      <XCircle size={11} /> Ошибка
    </Badge>
  )
  return (
    <Badge variant="secondary" className="gap-1">
      <Clock size={11} /> Не проверено
    </Badge>
  )
}

export function DashboardView() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [objects, setObjects] = useState<MObject[]>([])
  const [meterTypes, setMeterTypes] = useState<MeterType[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [r, o, m] = await Promise.all([
      fetch("/api/readings").then((x) => x.json()),
      fetch("/api/objects").then((x) => x.json()),
      fetch("/api/meter-types").then((x) => x.json()),
    ])
    setReadings(Array.isArray(r) ? r : [])
    setObjects(Array.isArray(o) ? o : [])
    setMeterTypes(Array.isArray(m) ? m : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const rows = useMemo<ExpandedRow[]>(() => {
    return readings.flatMap((reading) => {
      const obj = objects.find((o) => o._id === reading.objectId)
      const mt = meterTypes.find((t) => t._id === reading.meterTypeId)
      if (!mt) return []

      return mt.meterSchema.fields.map((field) => ({
        key: `${reading._id}-${field.name}`,
        period: formatPeriod(reading.date),
        rawDate: reading.date,
        address: obj ? `${obj.name} — ${obj.address}` : reading.objectId,
        meterTypeName: mt.name,
        fieldLabel: field.label,
        value: reading.values[field.name],
        unit: field.unit ?? mt.unit,
        status: reading.validationStatus,
      }))
    })
  }, [readings, objects, meterTypes])

  const stats = {
    total: readings.length,
    objects: new Set(readings.map((r) => r.objectId)).size,
    valid: readings.filter((r) => r.validationStatus === "valid").length,
  }

  return (
    <div className="space-y-4">
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Записей", value: stats.total },
          { label: "Объектов", value: stats.objects },
          { label: "Проверено", value: stats.valid },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Таблица */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Все показания</p>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="h-8 gap-1.5">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Обновить
          </Button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Загрузка...</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center space-y-1">
            <p className="text-sm text-muted-foreground">Показаний ещё нет</p>
            <p className="text-xs text-muted-foreground/60">Добавьте первое показание во вкладке «Новые показания»</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Период</TableHead>
                  <TableHead className="whitespace-nowrap">Адрес</TableHead>
                  <TableHead className="whitespace-nowrap">Счётчик / Показатель</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Значение</TableHead>
                  <TableHead className="whitespace-nowrap">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="whitespace-nowrap font-medium">{row.period}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[160px] truncate">
                      {row.address}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{row.fieldLabel}</TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums font-mono">
                      {row.value !== undefined ? (
                        <>
                          <span className="font-semibold">{row.value.toLocaleString("ru-RU")}</span>
                          <span className="text-muted-foreground ml-1 text-xs">{row.unit}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
