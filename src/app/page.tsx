"use client"

import { useState } from "react"
import { LayoutDashboard, PlusCircle } from "lucide-react"
import { DashboardView } from "@/components/DashboardView"
import { NewReadingView } from "@/components/NewReadingView"
import { cn } from "@/lib/utils"

type Screen = "dashboard" | "new"

export default function Home() {
  const [screen, setScreen] = useState<Screen>("dashboard")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          {/* Logo row */}
          <div className="flex items-center justify-center pt-4 pb-3">
            <h1 className="text-lg font-bold tracking-[0.25em] text-foreground">METRICS</h1>
          </div>
          {/* Tab nav */}
          <div className="flex">
            {(
              [
                { id: "dashboard", label: "Сводка", icon: LayoutDashboard },
                { id: "new", label: "Новые показания", icon: PlusCircle },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  screen === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
        {screen === "dashboard" ? <DashboardView /> : <NewReadingView />}
      </main>
    </div>
  )
}
