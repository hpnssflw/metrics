import { GenerateEmailRequestSchema } from "@/types/schemas"
import { apiError, parseGeminiKey } from "@/lib/utils"
import { generateEmail } from "@/services/email-generator"

export async function POST(request: Request) {
  const apiKey = parseGeminiKey(request)
  if (!apiKey) return apiError("Gemini API key required (x-gemini-key header)", null, 401)

  const body = await request.json()
  const parsed = GenerateEmailRequestSchema.safeParse(body)
  if (!parsed.success) return apiError("Validation failed", parsed.error.flatten())

  try {
    const emailText = await generateEmail(apiKey, parsed.data)
    return Response.json({ emailText })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email generation failed"
    return apiError(message, null, 500)
  }
}
