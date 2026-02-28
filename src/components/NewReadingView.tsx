"use client"

import { useState } from "react"
import { ApiKeyInput } from "@/components/ApiKeyInput"
import { ObjectManager } from "@/components/ObjectManager"
import { MeterTypeSelector } from "@/components/MeterTypeSelector"
import { DatePicker } from "@/components/DatePicker"
import { ImageUploader } from "@/components/ImageUploader"
import { ReadingsTable } from "@/components/ReadingsTable"
import { ReadingActions } from "@/components/ReadingActions"
import { ReadingsHistory } from "@/components/ReadingsHistory"
import { EmailPreview } from "@/components/EmailPreview"
import type { MObject, MeterType, ExtractResult, ValidationResult } from "@/types"

function Card({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-4">
      {label && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{label}</p>
      )}
      {children}
    </div>
  )
}

export function NewReadingView() {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("gemini_key") ?? ""
    return ""
  })
  const [selectedObject, setSelectedObject] = useState<MObject | null>(null)
  const [selectedMeterType, setSelectedMeterType] = useState<MeterType | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 7) + "-01"
  )
  const [extracted, setExtracted] = useState<ExtractResult | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, number | null>>({})
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [emailText, setEmailText] = useState<string>("")
  const [saved, setSaved] = useState(false)

  const values = Object.keys(editedValues).length > 0 ? editedValues : extracted?.values ?? {}

  const handleExtracted = (result: ExtractResult) => {
    setExtracted(result)
    setEditedValues(result.values)
    setValidation(null)
    setEmailText("")
    setSaved(false)
  }

  const handleValuesChange = (updated: Record<string, number | null>) => {
    setEditedValues(updated)
    setValidation(null)
  }

  const canAct = !!(selectedObject && selectedMeterType && Object.keys(values).length > 0)

  return (
    <div className="space-y-3">
      {/* API Key */}
      <ApiKeyInput value={apiKey} onChange={setApiKey} />

      {/* Объект, период, тип счётчика */}
      <Card>
        <ObjectManager selected={selectedObject} onSelect={setSelectedObject} />
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
          <MeterTypeSelector selected={selectedMeterType} onSelect={setSelectedMeterType} />
        </div>
      </Card>

      {/* Фото счётчика */}
      <Card label="Фото счётчика">
        <ImageUploader
          apiKey={apiKey}
          meterTypeId={selectedMeterType?._id ?? ""}
          onExtracted={handleExtracted}
          disabled={!apiKey || !selectedMeterType}
        />
      </Card>

      {/* Показания */}
      {selectedMeterType && (
        <Card label="Показания счётчика">
          <ReadingsTable
            meterType={selectedMeterType}
            values={values}
            validation={validation}
            confidence={extracted?.confidence}
            onChange={handleValuesChange}
          />
        </Card>
      )}

      {/* Действия */}
      {selectedMeterType && (
        <Card label="Действия">
          <ReadingActions
            canAct={canAct}
            saved={saved}
            onValidate={async () => {
              if (!selectedObject || !selectedMeterType) return
              const res = await fetch("/api/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  objectId: selectedObject._id,
                  meterTypeId: selectedMeterType._id,
                  date: selectedDate,
                  values,
                }),
              })
              setValidation(await res.json())
            }}
            onGenerateEmail={async () => {
              if (!selectedObject || !selectedMeterType || !apiKey) return
              const res = await fetch("/api/generate-email", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-gemini-key": apiKey },
                body: JSON.stringify({
                  objectName: selectedObject.name,
                  address: selectedObject.address,
                  date: selectedDate,
                  meterTypeName: selectedMeterType.name,
                  meterTypeUnit: selectedMeterType.unit,
                  values,
                }),
              })
              const data = await res.json()
              setEmailText(data.emailText ?? "")
            }}
            onSave={async () => {
              if (!selectedObject || !selectedMeterType) return
              const res = await fetch("/api/readings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  objectId: selectedObject._id,
                  meterTypeId: selectedMeterType._id,
                  date: selectedDate,
                  values,
                  validationStatus: validation?.status ?? "pending",
                  confidence: extracted?.confidence,
                }),
              })
              if (res.ok) setSaved(true)
            }}
          />
        </Card>
      )}

      {/* История */}
      {selectedObject && selectedMeterType && (
        <ReadingsHistory
          objectId={selectedObject._id ?? ""}
          meterTypeId={selectedMeterType._id ?? ""}
          fields={selectedMeterType.meterSchema.fields}
          unit={selectedMeterType.unit}
        />
      )}

      {/* Черновик письма */}
      {emailText && (
        <Card label="Черновик письма">
          <EmailPreview text={emailText} />
        </Card>
      )}
    </div>
  )
}
