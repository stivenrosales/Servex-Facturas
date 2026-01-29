
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

// Obtener la API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log('🔑 API Key status:', apiKey ? '✅ Configurada' : '❌ No configurada');
console.log('🔑 API Key length:', apiKey?.length || 0);

if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY no está configurada en .env.local');
  console.error('📋 Variables disponibles:', import.meta.env);
  throw new Error('La API key de Gemini no está configurada. Por favor, agrega GEMINI_API_KEY en tu archivo .env.local');
}

console.log('✅ Inicializando GoogleGenAI con API key...');
const ai = new GoogleGenAI({ apiKey });

export async function extractInvoiceData(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<InvoiceData> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Extract the details from this invoice ${mimeType.includes('pdf') ? 'document (PDF)' : 'image'}.
            If this is a multi-page PDF, extract data from all pages and combine line items.
            Identify the RUC (Tax ID), Company Name (Nombre de la empresa), Address (Dirección),
            and all line items including description, quantity, and amount.
            Be extremely accurate with the RUC (11 digits for Peru).
            Ensure the response is valid JSON according to the schema provided.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ruc: { type: Type.STRING },
          nombreEmpresa: { type: Type.STRING },
          direccion: { type: Type.STRING },
          fechaEmision: { type: Type.STRING },
          moneda: { type: Type.STRING },
          montoTotalFactura: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                descripcion: { type: Type.STRING },
                cantidad: { type: Type.NUMBER },
                precioUnitario: { type: Type.NUMBER },
                montoTotal: { type: Type.NUMBER },
              },
              required: ["descripcion", "cantidad", "montoTotal"],
            },
          },
        },
        required: ["ruc", "nombreEmpresa", "items", "montoTotalFactura"],
      },
    },
  });

  const response = await model;
  const data = JSON.parse(response.text);

  return {
    ...data,
    id: `INV-${Date.now()}`,
  };
}
