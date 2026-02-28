/**
 * Seed script — run with:
 *   npx tsx scripts/seed.ts
 *
 * Requires MONGODB_URI in .env.local
 */
import mongoose from "mongoose"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(__dirname, "../.env.local") })

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local")

// --- Inline schemas (avoid TS module resolution issues in script context) ---

const MeterFieldSchema = new mongoose.Schema(
  { name: String, label: String, type: String, required: Boolean, unit: String },
  { _id: false }
)

const ObjectSchema = new mongoose.Schema(
  { name: { type: String, required: true }, address: { type: String, required: true } },
  { timestamps: true }
)

const MeterTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  meterSchema: { fields: [MeterFieldSchema] },
})

const MeterReadingSchema = new mongoose.Schema(
  {
    objectId: { type: mongoose.Schema.Types.ObjectId, ref: "Object" },
    meterTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "MeterType" },
    date: String,
    values: mongoose.Schema.Types.Mixed,
    validationStatus: { type: String, default: "valid" },
    confidence: Number,
  },
  { timestamps: true }
)

const ObjectModel = mongoose.models.Object || mongoose.model("Object", ObjectSchema)
const MeterTypeModel = mongoose.models.MeterType || mongoose.model("MeterType", MeterTypeSchema)
const MeterReadingModel = mongoose.models.MeterReading || mongoose.model("MeterReading", MeterReadingSchema)

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log("Connected to MongoDB")

  // --- Objects ---
  const [obj] = await ObjectModel.insertMany([
    { name: "Трудовая 22 стр.42", address: "ул. Трудовая, 22, стр. 42" },
  ])
  console.log("Created object:", obj.name)

  // --- Meter Types ---
  const [electricity, water] = await MeterTypeModel.insertMany([
    {
      name: "Электроэнергия (одно-тарифный)",
      unit: "кВт*ч",
      meterSchema: {
        fields: [
          { name: "total_kwh", label: "Общий кВт*ч", type: "number", required: true },
        ],
      },
    },
    {
      name: "Холодное водоснабжение",
      unit: "м³",
      meterSchema: {
        fields: [
          { name: "total_m3", label: "Общий м³", type: "number", required: true },
        ],
      },
    },
  ])
  console.log("Created meter types:", electricity.name, water.name)

  // --- Initial readings from counters_table PDF (01.02.2026) ---
  // Note: Each meter needs its own reading entry
  // For MVP we create one reading per meter type per the PDF data
  const readings = [
    // Electricity readings
    { objectId: obj._id, meterTypeId: electricity._id, date: "2026-02-01", values: { total_kwh: 1852.076 }, confidence: 1.0 }, // Общий расчётный ЭЭ — РиМ 489.30
    { objectId: obj._id, meterTypeId: electricity._id, date: "2026-02-01", values: { total_kwh: 272448.1 }, confidence: 1.0 },  // Киоски — ЦЭ6803В
    { objectId: obj._id, meterTypeId: electricity._id, date: "2026-02-01", values: { total_kwh: 10865.1 }, confidence: 1.0 },   // Шаурма — ЦЭ6803В М7
    { objectId: obj._id, meterTypeId: electricity._id, date: "2026-02-01", values: { total_kwh: 3099.38 }, confidence: 1.0 },   // Ярче — Меркурий 234
    // Water readings
    { objectId: obj._id, meterTypeId: water._id, date: "2026-02-01", values: { total_m3: 185 }, confidence: 1.0 },  // Общий ХВС
    { objectId: obj._id, meterTypeId: water._id, date: "2026-02-01", values: { total_m3: 102 }, confidence: 1.0 },  // Шаурма ХВС
    { objectId: obj._id, meterTypeId: water._id, date: "2026-02-01", values: { total_m3: 74 }, confidence: 1.0 },   // Ярче ХВС
  ]

  await MeterReadingModel.insertMany(readings)
  console.log(`Created ${readings.length} readings from PDF data`)
  console.log("Seed complete!")
  await mongoose.disconnect()
}

seed().catch((e) => { console.error(e); process.exit(1) })
