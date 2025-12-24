
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingCaption = async (treatment: string, promotion: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a high-energy Facebook Live description for 'Arte House Clinic'. 
    Focus on creating urgency (FOMO) for this treatment: ${treatment}. 
    Promotion details: ${promotion}. 
    Include call-to-actions like 'CF ใต้คอมเมนต์' or 'ทักแชทด่วน'. 
    Tone: Professional yet very engaging for live sales.`,
  });

  return response.text || "ขออภัย ไม่สามารถสร้างแคปชั่นได้ในขณะนี้";
};

export interface AIDesignResult {
  headline: string;
  title: string;
  subtitle: string;
  promotion: string;
  price: string;
  template: string;
  fontKeyword: string;
}

export const generateAIDesign = async (description: string): Promise<AIDesignResult | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a specialist in Facebook Live commerce design. 
    User is planning a live stream for: "${description}".
    
    Recommend high-impact sales text in Thai.
    Available Live Templates: 
    - LIVE_MINIMAL (Clean, corner focus)
    - LIVE_BANNER (Full bottom banner with price)
    - LIVE_SIDEBAR (Side info bar)
    - LIVE_FULL_PROMO (Heavy promotional text)
    
    Available Fonts: Prompt, Kanit, Noto Sans Thai, Montserrat, Playfair, Bodoni, Libre Baskerville.

    Output the recommendation strictly in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: "Hook text like 'นาทีทอง!'" },
          title: { type: Type.STRING, description: "Main Service like 'Filler 1 แถม 1'" },
          subtitle: { type: Type.STRING, description: "Limited time offer like 'เฉพาะในไลฟ์เท่านั้น'" },
          promotion: { type: Type.STRING, description: "Main selling points" },
          price: { type: Type.STRING, description: "Price tag like 'เพียง 9,900.-'" },
          template: { type: Type.STRING, description: "One of: LIVE_MINIMAL, LIVE_BANNER, LIVE_SIDEBAR, LIVE_FULL_PROMO" },
          fontKeyword: { type: Type.STRING, description: "The name of one of the fonts mentioned" }
        },
        required: ["headline", "title", "subtitle", "promotion", "price", "template", "fontKeyword"]
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
