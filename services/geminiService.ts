
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Always use process.env.API_KEY directly as per SDK guidelines.
export const getGeminiResponse = async (
  prompt: string, 
  mode: 'basic' | 'think' | 'search' = 'basic'
): Promise<ChatMessage> => {
  // Creating a new instance of GoogleGenAI right before making an API call to ensure it uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    if (mode === 'think') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      // response.text is a property, not a method.
      return { role: 'model', text: response.text || "عذراً، حدث خطأ في معالجة الطلب." };
    }

    if (mode === 'search') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls = groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "رابط",
        uri: chunk.web?.uri || ""
      })).filter((u: any) => u.uri) || [];

      return { 
        role: 'model', 
        text: response.text || "تم الحصول على النتائج.",
        groundingUrls: urls
      };
    }

    // Default Flash for basic tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return { role: 'model', text: response.text || "" };

  } catch (error) {
    // Fixed: Properly handling the catch block and providing a user-friendly error message
    console.error("Gemini API Error:", error);
    return { 
      role: 'model', 
      text: "عذراً، حدث خطأ أثناء التواصل مع خادم الذكاء الاصطناعي. يرجى المحاولة لاحقاً." 
    };
  }
};
