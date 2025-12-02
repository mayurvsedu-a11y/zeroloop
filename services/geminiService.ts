import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are an expert Waste Management Consultant and Data Analyst specializing in optimizing restaurant operations. 
Your task is to analyze an uploaded photo of mixed kitchen/plate waste, categorize it, estimate its weight, calculate financial loss, and provide actionable reduction advice.

Follow this logic for classification:
1. Food Scraps (Organic): Unconsumed food, prep trimmings (high loss focus).
2. Cardboard/Paper: Packaging, napkins.
3. Plastic: Single-use containers, films, bags.
4. Glass/Metal: Jars, cans.
5. General Trash/Other: Non-recyclable, non-compostable.

Crucial Step: Estimate weight in grams (g) based on visual cues (density, container size).
Financial Calculation: Assume COGS of ₹0.50 per gram for Food Scraps.

Return strictly valid JSON.
`;

export const analyzeWasteImage = async (base64Image: string): Promise<AnalysisResult> => {
  // Remove the data URL prefix to get just the base64 string
  const base64Data = base64Image.split(",")[1];

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Analyze this image of restaurant waste. Provide a detailed classification, weight estimation, financial impact analysis, and a manager's reduction report based on the visible items.",
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wasteBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Category name (e.g., Food Scraps, Plastic)" },
                  weightGrams: { type: Type.INTEGER, description: "Estimated weight in grams" },
                  recyclableStatus: { type: Type.STRING, description: "Yes, No, or Compost" },
                  notes: { type: Type.STRING, description: "Examples seen in image (e.g., half-eaten fries)" },
                },
                required: ["category", "weightGrams", "recyclableStatus", "notes"],
              },
            },
            totalWeightGrams: { type: Type.INTEGER },
            financialImpact: {
              type: Type.OBJECT,
              properties: {
                cogsRate: { type: Type.NUMBER, description: "Fixed at 0.50" },
                estimatedLoss: { type: Type.NUMBER, description: "Total financial loss from Food Scraps" },
              },
              required: ["cogsRate", "estimatedLoss"],
            },
            managerReport: {
              type: Type.OBJECT,
              properties: {
                biggestLossCategory: { type: Type.STRING },
                recommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 specific actionable recommendations",
                },
              },
              required: ["biggestLossCategory", "recommendations"],
            },
          },
          required: ["wasteBreakdown", "totalWeightGrams", "financialImpact", "managerReport"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI model.");
    }

    const result = JSON.parse(response.text) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the image. Please try again.");
  }
};