import { generateContent } from "@/lib/gemini"
import { MeterTypeModel } from "@/lib/models/MeterType"
import { connectDB } from "@/lib/mongodb"
import { ExtractResultSchema } from "@/types/schemas"
import type { ExtractResult } from "@/types"

export async function extractMeterReading(
  apiKey: string,
  imageBase64: string,
  meterTypeId: string
): Promise<ExtractResult> {
  await connectDB()

  const meterType = await MeterTypeModel.findById(meterTypeId)
  if (!meterType) throw new Error("Meter type not found")

  const schemaDescription = meterType.meterSchema.fields
    .map(
      (f: import("@/lib/models/MeterType").IMeterField) =>
        `  "${f.name}": number${f.required ? " (required)" : " (optional, null if not visible)"}`
    )
    .join(",\n")

  const prompt = `You are a meter reading extraction engine. Analyze the meter display in this image.

Return ONLY valid JSON with this exact structure:
{
${schemaDescription},
  "confidence": number between 0 and 1
}

Rules:
- Extract numeric values shown on the meter display
- If a value is not visible or unclear, return null for optional fields
- confidence: your certainty (0.0 = uncertain, 1.0 = certain)
- Return ONLY the JSON, no explanation, no markdown`

  const attempt = async (): Promise<ExtractResult> => {
    const text = await generateContent(apiKey, [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      },
    ])

    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    const { confidence, ...values } = parsed
    return ExtractResultSchema.parse({ values, confidence })
  }

  try {
    return await attempt()
  } catch {
    // Retry once
    return await attempt()
  }
}
