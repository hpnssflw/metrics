import { ExtractRequestSchema } from "@/types/schemas"
import { apiError, parseGeminiKey } from "@/lib/utils"
import { extractMeterReading } from "@/services/extractor"

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB in base64 chars ≈ 2.7MB, we check raw

export async function POST(request: Request) {
  const apiKey = parseGeminiKey(request)
  if (!apiKey) return apiError("Gemini API key required (x-gemini-key header)", null, 401)

  const body = await request.json()
  const parsed = ExtractRequestSchema.safeParse(body)
  if (!parsed.success) return apiError("Validation failed", parsed.error.flatten())

  // Check image size (base64 length * 0.75 ≈ bytes)
  const estimatedBytes = parsed.data.imageBase64.length * 0.75
  if (estimatedBytes > MAX_IMAGE_SIZE) {
    return apiError("Image too large. Maximum size is 2MB", null, 413)
  }

  try {
    const result = await extractMeterReading(apiKey, parsed.data.imageBase64, parsed.data.meterTypeId)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed"
    return apiError(message, null, 500)
  }
}
