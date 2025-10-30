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

// ✅ Helper for text prompts with optional image support
export async function generateText({ model = "gemini-2.0-flash", prompt, files }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("generateText: 'prompt' must be a non-empty string")
  }
  
  const ai = getGenAIClient()
  
  // ✅ Build parts array for multi-modal content
  const parts = [{ text: prompt }]
  
  // ✅ Add image files if provided
  if (files && files.length > 0) {
    for (const file of files) {
      if (file.type && file.type.startsWith('image/')) {
        // Remove data URL prefix (data:image/png;base64,...)
        const base64Data = file.data.split(',')[1]
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        })
      }
    }
  }

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: parts
      }
    ]
  })

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || ""
  return text
}

// ✅ Helper to convert File to base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}