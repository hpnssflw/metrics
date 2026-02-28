"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { ExtractResult } from "@/types"

interface Props {
  apiKey: string
  meterTypeId: string
  onExtracted: (result: ExtractResult) => void
  disabled?: boolean
}

const MAX_BYTES = 2 * 1024 * 1024

export function ImageUploader({ apiKey, meterTypeId, onExtracted, disabled }: Props) {
  const [preview, setPreview] = useState<string>("")
  const [base64, setBase64] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Изображение слишком большое. Макс. 2МБ.")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setBase64(dataUrl.split(",")[1])
    }
    reader.readAsDataURL(file)
  }

  const handleExtract = async () => {
    if (!base64 || !meterTypeId || !apiKey) return
    setLoading(true)
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-gemini-key": apiKey },
        body: JSON.stringify({ imageBase64: base64, meterTypeId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Ошибка распознавания"); return }
      toast.success(`Распознано с точностью ${Math.round((data.confidence ?? 0) * 100)}%`)
      onExtracted(data)
    } catch {
      toast.error("Ошибка сети")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={[
          "rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
          dragging ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-slate-300 bg-slate-50",
          disabled ? "opacity-40 pointer-events-none" : "",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) processFile(file)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
        />
        {preview ? (
          <img src={preview} alt="Счётчик" className="max-h-56 w-full object-contain" />
        ) : (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto">
              <Camera size={22} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Перетащите фото или нажмите для выбора</p>
            <p className="text-xs text-slate-400">JPEG, PNG, HEIC · до 2МБ</p>
          </div>
        )}
      </div>

      <Button
        onClick={handleExtract}
        disabled={!base64 || !meterTypeId || !apiKey || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <><Loader2 size={15} className="animate-spin" /> Распознаю...</>
        ) : (
          <><Upload size={15} /> Распознать показания</>
        )}
      </Button>

      {!apiKey && (
        <p className="text-xs text-red-500 text-center font-medium">Сначала укажите API-ключ Gemini ↑</p>
      )}
      {!meterTypeId && apiKey && (
        <p className="text-xs text-amber-600 text-center font-medium">Сначала выберите тип счётчика</p>
      )}
    </div>
  )
}
