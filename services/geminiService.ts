
import { GoogleGenAI, Modality, Chat } from "@google/genai";

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

export const generateStoryFromImage = async (imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = fileToGenerativePart(imageBase64, mimeType);
        const prompt = "Analyze the mood, scene, and characters in this image. Based on your analysis, write an evocative and compelling opening paragraph for a story set in this world. The tone should be mysterious and engaging.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error in generateStoryFromImage:", error);
        return "Sorry, I couldn't generate a story from the image. Please try again.";
    }
};


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
