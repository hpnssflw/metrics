"use client"

import { useState } from "react"
import { Loader2, Save, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Props {
  canAct: boolean
  saved: boolean
  onValidate: () => Promise<void>
  onGenerateEmail: () => Promise<void>
  onSave: () => Promise<void>
}

type LoadingState = "validate" | "email" | "save" | null

export function ReadingActions({ canAct, saved, onValidate, onGenerateEmail, onSave }: Props) {
  const [loading, setLoading] = useState<LoadingState>(null)

  const act = async (which: LoadingState, fn: () => Promise<void>, successMsg: string) => {
    setLoading(which)
    try {
      await fn()
      toast.success(successMsg)
    } catch {
      toast.error("Произошла ошибка")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => act("validate", onValidate, "Проверка выполнена")}
        disabled={!canAct || loading !== null}
      >
        {loading === "validate" ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
        Проверить
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => act("email", onGenerateEmail, "Письмо сформировано")}
        disabled={!canAct || loading !== null}
      >
        {loading === "email" ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
        Письмо
      </Button>
      <Button
        size="sm"
        onClick={() => act("save", onSave, "Показания сохранены!")}
        disabled={!canAct || loading !== null || saved}
        variant={saved ? "outline" : "default"}
        className={cn("ml-auto", saved && "text-green-700 border-green-200 bg-green-50")}
      >
        {loading === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saved ? "Сохранено!" : "Сохранить"}
      </Button>
    </div>
  )
}
