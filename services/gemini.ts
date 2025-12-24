
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingCaption = async (treatment: string, promotion: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional and catchy Thai marketing caption for a clinic named 'Arte House Clinic'. 
    Treatment: ${treatment}. 
    Promotion: ${promotion}. 
    The tone should be elegant, trustworthy, and inviting. Include emojis and relevant hashtags.`,
  });

  return response.text || "ขออภัย ไม่สามารถสร้างแคปชั่นได้ในขณะนี้";
};

export interface AIDesignResult {
  headline: string;
  title: string;
  subtitle: string;
  promotion: string;
  template: string;
  fontKeyword: string;
}

export const generateAIDesign = async (description: string): Promise<AIDesignResult | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a professional graphic designer for a premium aesthetic clinic 'Arte House Clinic'.
    User wants a design for: "${description}".
    
    Recommend a layout and creative slogans in Thai.
    Available Templates: STYLE_1 (Elegant floating), STYLE_2 (HI-END Glow), STYLE_3 (Top list focus), LIVE (Live Stream).
    Available Fonts: Prompt, Kanit, Noto Sans Thai, Montserrat, Playfair, Bodoni, Libre Baskerville.

    Output the recommendation strictly in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: "A catchy headline like 'เปลี่ยนคุณเป็นคนใหม่'" },
          title: { type: Type.STRING, description: "Main title (short, punchy) like 'Filler 360'" },
          subtitle: { type: Type.STRING, description: "Sub slogan like 'สวย สับ ฉบับคุณหนู'" },
          promotion: { type: Type.STRING, description: "List of details or promotion points" },
          template: { type: Type.STRING, description: "One of: STYLE_1, STYLE_2, STYLE_3, LIVE" },
          fontKeyword: { type: Type.STRING, description: "The name of one of the fonts mentioned" }
        },
        required: ["headline", "title", "subtitle", "promotion", "template", "fontKeyword"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as AIDesignResult;
  } catch (e) {
    console.error("Failed to parse AI design response", e);
    return null;
  }
};
