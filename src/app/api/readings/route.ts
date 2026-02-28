import { connectDB } from "@/lib/mongodb"
import { MeterReadingModel } from "@/lib/models/MeterReading"
import { MeterReadingSchema } from "@/types/schemas"
import { apiError } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const objectId = searchParams.get("objectId")
  const meterTypeId = searchParams.get("meterTypeId")

  await connectDB()
  const filter: Record<string, string> = {}
  if (objectId) filter.objectId = objectId
  if (meterTypeId) filter.meterTypeId = meterTypeId

  const readings = await MeterReadingModel.find(filter).sort({ date: -1 }).limit(50)
  return Response.json(readings)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = MeterReadingSchema.safeParse(body)
  if (!parsed.success) return apiError("Validation failed", parsed.error.flatten())

  await connectDB()
  const reading = await MeterReadingModel.create(parsed.data)
  return Response.json(reading, { status: 201 })
}
