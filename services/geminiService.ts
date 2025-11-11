
import { GoogleGenAI, Modality, Chat, Type } from "@google/genai";
import type { StoryGenerationResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

let chatInstance: Chat | null = null;

const getChatInstance = () => {
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a friendly and helpful assistant.',
      },
    });
  }
  return chatInstance;
};

export const generateChatResponse = async (message: string): Promise<string> => {
    try {
        const chat = getChatInstance();
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error in generateChatResponse:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
};

const fileToGenerativePart = (base64: string, mimeType: string) => {
    return {
        inlineData: {
            data: base64,
            mimeType,
        },
    };
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = fileToGenerativePart(imageBase64, mimeType);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, imagePart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error in analyzeImage:", error);
        return "Sorry, I couldn't analyze the image. Please try again.";
    }
};

export const generateStoryFromImage = async (imageBase64: string, mimeType: string, genre: string, style: string): Promise<StoryGenerationResult> => {
    try {
        const imagePart = fileToGenerativePart(imageBase64, mimeType);
        const prompt = `You are an expert creative writer. Analyze the mood, scene, and characters in this image. Based on your analysis, write an evocative and compelling opening paragraph for a story set in this world. The story should be in the '${genre}' genre with a '${style}' writing style. After writing the paragraph, also generate 3-5 creative writing prompts or questions relevant to the story's theme, characters, or setting to inspire the user to continue writing.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        story: {
                            type: Type.STRING,
                            description: "The opening paragraph of the story."
                        },
                        prompts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                            description: "An array of 3-5 inspiration prompts or questions."
                        },
                    },
                    required: ["story", "prompts"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error in generateStoryFromImage:", error);
        throw new Error("Sorry, I couldn't generate a story from the image. Please try again.");
    }
};

export const continueStory = async (existingStory: string, imageBase64: string, mimeType: string, genre: string, style: string): Promise<string> => {
    try {
        const imagePart = fileToGenerativePart(imageBase64, mimeType);
        const prompt = `You are an expert creative writer continuing a story. You have the initial image as context. The story is in the '${genre}' genre with a '${style}' writing style. Here is the story so far: "${existingStory}". Please write the next paragraph, maintaining the established tone, style, and narrative coherence. Do not repeat what has already been written. Just provide the next paragraph.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error in continueStory:", error);
        return "Sorry, I couldn't continue the story. Please try again.";
    }
}


export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a dramatic, narrative tone: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        return null;
    } catch (error) {
        console.error("Error in generateSpeech:", error);
        return null;
    }
};
