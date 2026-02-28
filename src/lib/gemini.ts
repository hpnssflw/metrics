const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

export interface GeminiMessage {
  role: "user" | "model"
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
}

async function callGemini(
  apiKey: string,
  model: string,
  contents: GeminiMessage[]
): Promise<string> {
  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${model} error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini returned empty response")
  return text
}

export async function generateContent(
  apiKey: string,
  contents: GeminiMessage[]
): Promise<string> {
  try {
    return await callGemini(apiKey, "gemini-2.0-flash", contents)
  } catch {
    // Fallback to pro
    return await callGemini(apiKey, "gemini-1.5-pro", contents)
  }
}
