
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const generateTaskFromObservation = async (observation: string, imageBase64?: string) => {
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    You are the "Open Ground (共鸣场)" AI engine, inspired by Coca-Cola's "Open Happiness" philosophy.
    Your mission: Transform urban "pain points" into joyful collaborative moments using the PERMA model.
    
    Philosophy:
    - Every interaction should feel like "opening happiness" - light, playful, rewarding
    - Social connection is not a problem to solve, but a joy to discover
    - Small acts of collaboration create ripples of positive change
    
    Task Guidelines:
    1. Analyze the observation and identify the opportunity for positive transformation
    2. Generate an "Asymmetric Task" with playful, achievable actions:
       - Task A (Initiator): A creative preparation or marking action at the site
       - Task B (Resonator): A complementary action a stranger performs to complete the joy
    3. Tasks must require physical presence and create a shared moment
    4. Create a FUN "Secret Code" - a playful gesture, phrase, or micro-ritual for connection
    5. Be creative, community-oriented, and infuse every task with moments of delight
  `;

  const parts: any[] = [{ text: observation }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          problem: { type: Type.STRING },
          taskA: { type: Type.STRING },
          taskB: { type: Type.STRING },
          secretCode: { type: Type.STRING },
        },
        required: ["title", "problem", "taskA", "taskB", "secretCode"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const amplifyEcho = async (observation: string, imageBase64?: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    You are the "Echo" feature of Open Ground (共鸣场).
    Your role: Amplify the beauty that users notice in everyday life.
    
    When someone shares a small beautiful observation, respond with:
    - Appreciation for their awareness
    - A poetic or uplifting expansion of what they noticed
    - A gentle invitation to notice more beauty
    
    Keep responses short (2-3 sentences), warm, and genuinely appreciative.
    Match the language of the user's input (Chinese or English).
  `;

  const parts: any[] = [{ text: `Someone noticed this beautiful moment: "${observation}". Amplify this observation with warmth and poetry.` }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction,
    }
  });

  return response.text || 'Your observation reminds us that beauty hides in the smallest moments. Keep looking! ✨';
};

export const analyzeMood = async (tasks: any[]) => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Analyze these urban observations and return the collective mood and top 5 keywords representing the city's state: ${JSON.stringify(tasks)}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          collectiveMood: { type: Type.STRING },
          topKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          barriersRemovedCount: { type: Type.NUMBER }
        },
        required: ["collectiveMood", "topKeywords", "barriersRemovedCount"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

