import { generateContent } from "@/lib/gemini"
import type { GenerateEmailRequest } from "@/types"

export async function generateEmail(
  apiKey: string,
  params: GenerateEmailRequest
): Promise<string> {
  const valuesText = Object.entries(params.values)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v} ${params.meterTypeUnit}`)
    .join("\n")

  const prompt = `Сгенерируй деловое письмо арендодателю на русском языке для передачи показаний счётчика.

Данные:
- Адрес объекта: ${params.address}
- Название объекта: ${params.objectName}
- Тип счётчика: ${params.meterTypeName}
- Дата снятия показаний: ${params.date}
- Показания:
${valuesText}

Требования:
- Официальный деловой стиль
- Краткое и чёткое изложение
- Включи все переданные показания
- Укажи дату
- Без лишних вступлений
- Готово к отправке (без [скобок] и заглушек)`

  const text = await generateContent(apiKey, [
    { role: "user", parts: [{ text: prompt }] },
  ])

  return text.trim()
}
