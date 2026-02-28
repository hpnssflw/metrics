"use client"

import { useEffect, useState } from "react"
import { KeyRound, CheckCircle2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  value: string
  onChange: (v: string) => void
}

export function ApiKeyInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")

  useEffect(() => {
    const stored = sessionStorage.getItem("gemini_key") ?? ""
    if (stored) { onChange(stored); setDraft(stored) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    sessionStorage.setItem("gemini_key", draft)
    onChange(draft)
    setOpen(false)
  }

  const clear = () => {
    sessionStorage.removeItem("gemini_key")
    onChange("")
    setDraft("")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3.5 hover:shadow-md transition-all text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <KeyRound size={15} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400">Gemini API Key</p>
          <p className="text-sm text-slate-700 truncate mt-0.5">
            {value ? "●●●●●●●●●●●●●●●●" : "Нажмите для настройки"}
          </p>
        </div>
        {value ? (
          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        ) : (
          <AlertCircle size={18} className="text-red-400 shrink-0" />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Gemini API Key</h2>
                <p className="text-xs text-slate-400 mt-0.5">Хранится в сессии, не отправляется на сервер</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <Input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="AIzaSy..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
            <div className="flex gap-2">
              <Button onClick={save} className="flex-1">Сохранить</Button>
              {value && (
                <Button onClick={clear} variant="outline" className="text-destructive hover:text-destructive">
                  Удалить
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
