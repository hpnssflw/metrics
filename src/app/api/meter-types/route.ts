import { connectDB } from "@/lib/mongodb"
import { MeterTypeModel } from "@/lib/models/MeterType"
import { MeterTypeSchema } from "@/types/schemas"
import { apiError } from "@/lib/utils"

export async function GET() {
  await connectDB()
  const types = await MeterTypeModel.find()
  return Response.json(types)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = MeterTypeSchema.safeParse(body)
  if (!parsed.success) return apiError("Validation failed", parsed.error.flatten())

  await connectDB()
  const type = await MeterTypeModel.create(parsed.data)
  return Response.json(type, { status: 201 })
}
