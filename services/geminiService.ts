import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIDetectedItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for structured item detection
const itemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "物品的简短名称 (中文)" },
    category: { type: Type.STRING, description: "通用分类 (例如：数码产品, 服装, 厨房用品, 书籍) (中文)" },
    description: { type: Type.STRING, description: "关于物品外观和功能的简短描述 (中文)" },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "5个与物品相关的关键词标签 (中文)" 
    },
    suggestedStorageType: { type: Type.STRING, description: "通常存放的位置类型 (例如：衣柜, 抽屉, 书架, 储物箱) (中文)" }
  },
  required: ["name", "category", "description", "tags", "suggestedStorageType"]
};

export const analyzeItemImage = async (base64Image: string): Promise<AIDetectedItem> => {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "分析这张图片并提取物品详情，用于家庭收纳系统。请务必使用中文回答，分类要准确。"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: itemSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIDetectedItem;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw error;
  }
};

export const getOrganizationTips = async (query: string, userItems: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `你是一位专业的家庭收纳整理师（类似近藤麻理惠风格），语气温柔、鼓励人心。
      用户的问题是: "${query}".
      
      这是用户目前拥有的一些物品摘要: ${userItems}.
      
      请提供一个简洁、友好且可操作的收纳建议（中文，150字以内）。使用Markdown格式。`,
    });

    return response.text || "我现在想不出什么好建议，稍微再问我一次吧！";
  } catch (error) {
    console.error("Gemini Tips Error:", error);
    return "抱歉，我现在连接不到整理大脑，请稍后再试。";
  }
};