# METRICS

AI-powered utility meter reading and reporting app. Photograph a meter, extract readings with Google Gemini Vision, validate against history, and generate ready-to-send email reports.

## Features

- **AI Extraction** — point camera at any meter, Gemini Vision reads the digits automatically
- **Validation** — AI cross-checks new readings against historical data, flags anomalies
- **Email generation** — produces a formatted report letter with one tap
- **Dashboard** — table of all saved readings across all objects and meter types
- **History** — per-object, per-meter-type reading log with validation status

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, Tailwind CSS v4 |
| UI Kit | shadcn/ui (Button, Input, Table, Badge, Card…) |
| AI | Google Gemini 1.5 Flash (Vision) |
| Database | MongoDB Atlas + Mongoose |
| Validation | Zod |
| Fonts | Inter (latin + cyrillic) |
| Notifications | Sonner |
| Deploy | Vercel |

## Data Models

### Object
Represents a physical property (building, address).

```ts
{
  name:    string   // "Ярче"
  address: string   // "ул. Трудовая, 22, стр. 42"
}
```

### MeterType
Defines a type of meter and its reading schema. Fields are dynamic — add as many readings per meter as needed (e.g. day/night tariffs).

```ts
{
  name: string        // "Общий расчётный ЭЭ"
  unit: string        // "кВт*ч" | "м³"
  meterSchema: {
    fields: [
      {
        name:     string   // field key, e.g. "total"
        label:    string   // display label, e.g. "Общий кВт*ч"
        type:     "number"
        required: boolean
        unit?:    string   // overrides parent unit if set
      }
    ]
  }
}
```

**Example meter types from ул. Трудовая, 22, стр. 42:**

| Наименование | Модель | Номер счётчика | Ед. |
|---|---|---|---|
| Общий расчётный ЭЭ | РиМ 489.30 | 489.30-№02825102 | кВт*ч |
| киоски | ЦЭ6803В | 011076089003233 | кВт*ч |
| Шаурма ЭЭ | ЦЭ6803В M7 P31 | 013147213353124 | кВт*ч |
| Ярче ЭЭ | Меркурий 234 ART-03 | 45231257 | кВт*ч |
| Общий ХВС | ITELMA | 23-334036 | м³ |
| Шаурма ХВС | ITELMA | 25-341411 | м³ |
| Ярче ХВС | ITELMA | 25-341420 | м³ |

### MeterReading
One reading record — a snapshot of all field values for a given object + meter type + period.

```ts
{
  objectId:         ObjectId              // ref → Object
  meterTypeId:      ObjectId              // ref → MeterType
  date:             string                // "2026-02-01"
  values:           Record<string, number> // { total: 1852.076 }
  validationStatus: "valid" | "anomaly" | "invalid" | "pending"
  confidence?:      number                // 0–1, from Gemini
  imageUrl?:        string
  createdAt:        Date
}
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/objects` | List / create objects |
| PUT/DELETE | `/api/objects/[id]` | Update / delete object |
| GET/POST | `/api/meter-types` | List / create meter types |
| GET/POST | `/api/readings` | List / create readings |
| POST | `/api/extract` | Extract readings from photo via Gemini |
| POST | `/api/validate` | Validate readings against history |
| POST | `/api/generate-email` | Generate email report via Gemini |
| GET | `/api/health` | Health check |

## Environment Variables

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/metrics?retryWrites=true&w=majority
```

The Gemini API key is **not** stored server-side. It is entered by the user in the app, stored in `sessionStorage`, and sent per-request via the `x-gemini-key` header.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create env file
cp .env.example .env.local
# → fill in MONGODB_URI

# 3. Seed meter types (optional)
npx ts-node scripts/seed.ts

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Import repo on [vercel.com](https://vercel.com)
2. Add environment variable: `MONGODB_URI`
3. Deploy — no other config needed
