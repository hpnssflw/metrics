import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "METRICS",
  description: "AI-powered utility meter reading and reporting",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900 antialiased`}>
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
