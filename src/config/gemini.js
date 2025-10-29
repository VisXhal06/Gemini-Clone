// Client-safe Gemini configuration for Vite/React
// Usage:
//   import { getGenAIClient } from "./config/gemini";
//   const ai = getGenAIClient();

import { GoogleGenAI } from "@google/genai"

export function getGenAIClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Define it in your .env file.")
  }
  return new GoogleGenAI({ apiKey })
}

// Optional helper for simple text prompts
export async function generateText({ model = "gemini-2.0-flash", prompt }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("generateText: 'prompt' must be a non-empty string")
  }
  const ai = getGenAIClient()
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  })

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || ""
  return text
}


