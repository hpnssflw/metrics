import { ValidateRequestSchema } from "@/types/schemas"
import { apiError } from "@/lib/utils"
import { validateReading } from "@/services/validation-engine"

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = ValidateRequestSchema.safeParse(body)
  if (!parsed.success) return apiError("Validation failed", parsed.error.flatten())

  try {
    const result = await validateReading(parsed.data)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed"
    return apiError(message, null, 500)
  }
}
