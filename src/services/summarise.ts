import { categoriesEnum, type Summary } from "../types/index.js";
import { ai } from "../lib/ai.js";
import { Type } from "@google/genai";
import { ApiError } from "../lib/error.js";


export const summarise = async (text: string, candidateImages: string[]): Promise<Summary> => {

    const prompt = `
${process.env.AI_PROMPT}

Candidate images:
${candidateImages.length ? candidateImages.map((u, i) => `${i + 1}. ${u}`).join("\n") : "(none)"}

Article:
${text}
    `.trim();


    const res = await ai.models.generateContent({
        model: process.env.AI_MODEL!,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    category: {
                        type: Type.STRING,
                        enum: categoriesEnum
                    },
                    thumbnail: { type: [Type.STRING, Type.NULL] },
                },
                required: ["title", "summary", "tags", "category", "thumbnail"],
            },
        }
    });

    try {
        return JSON.parse(res.text as string)
    } catch (error) {
        throw new ApiError(501, "Failed to parse LLM response")
    }

}