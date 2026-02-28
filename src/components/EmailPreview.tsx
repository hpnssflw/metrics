"use client"

import { Copy, CheckCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
  text: string
}

export function EmailPreview({ text }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Скопировано!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed max-h-72 overflow-y-auto font-sans">
        {text}
      </pre>
      <button
        onClick={copy}
        className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-700 font-medium"
      >
        {copied ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
        {copied ? "Скопировано!" : "Скопировать"}
      </button>
    </div>
  )
}
