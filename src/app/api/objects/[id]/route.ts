import { connectDB } from "@/lib/mongodb"
import { ObjectModel } from "@/lib/models/Object"
import { ObjectSchema } from "@/types/schemas"
import { apiError } from "@/lib/utils"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const parsed = ObjectSchema.safeParse(body)
  if (!parsed.success) return apiError("Validation failed", parsed.error.flatten())

  await connectDB()
  const obj = await ObjectModel.findByIdAndUpdate(id, parsed.data, { new: true })
  if (!obj) return apiError("Object not found", null, 404)
  return Response.json(obj)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const obj = await ObjectModel.findByIdAndDelete(id)
  if (!obj) return apiError("Object not found", null, 404)
  return Response.json({ success: true })
}
