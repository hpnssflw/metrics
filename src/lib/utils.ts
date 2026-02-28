import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function apiError(message: string, details?: unknown, status = 400) {
  return NextResponse.json({ error: message, details }, { status })
}

export function parseGeminiKey(request: Request): string | null {
  return request.headers.get("x-gemini-key") || null
}
