import { connectDB } from "@/lib/mongodb"
import { ObjectModel } from "@/lib/models/Object"
import { ObjectSchema } from "@/types/schemas"
import { apiError } from "@/lib/utils"

export async function GET() {
  await connectDB()
  const objects = await ObjectModel.find().sort({ createdAt: -1 })
  return Response.json(objects)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = ObjectSchema.safeParse(body)
  if (!parsed.success) return apiError("Validation failed", parsed.error.flatten())

  await connectDB()
  const obj = await ObjectModel.create(parsed.data)
  return Response.json(obj, { status: 201 })
}
