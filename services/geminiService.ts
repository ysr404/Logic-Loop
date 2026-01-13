
import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult, TrafficStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const CACHE_KEY = 'graminbus_predictions';
const CACHE_TTL = 3600000; 

function getCache(): Record<string, PredictionResult> {
  const cached = localStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached) : {};
}

function setCache(route: string, result: PredictionResult) {
  const cache = getCache();
  cache[route] = result;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function predictNextBus(busRoute: string, currentStatus: string, traffic: TrafficStatus): Promise<PredictionResult> {
  const cache = getCache();
  const cachedEntry = cache[busRoute];
  if (cachedEntry && (Date.now() - cachedEntry.timestamp < 300000)) { // 5 mins cache for ETA
    return cachedEntry;
  }

  if (!navigator.onLine) {
    return { 
      prediction: "Offline", 
      hindiPrediction: "ऑफलाइन",
      etaMins: 15,
      timestamp: Date.now()
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: Rural bus near Shahpura village. 
      Bus Route: ${busRoute}
      Capacity: ${currentStatus}
      Traffic reported by conductor: ${traffic}
      Predict arrival minutes (ETA) and a short message in English and Hindi.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            hindiPrediction: { type: Type.STRING },
            etaMins: { type: Type.NUMBER }
          },
          required: ["prediction", "hindiPrediction", "etaMins"]
        }
      },
    });
    
    const result = JSON.parse(response.text);
    const finalResult = { ...result, timestamp: Date.now() };
    setCache(busRoute, finalResult);
    return finalResult;
  } catch (error) {
    console.error("Prediction failed", error);
    return { 
      prediction: "Next bus in 20 mins", 
      hindiPrediction: "अगली बस 20 मिनट में",
      etaMins: 20,
      timestamp: Date.now()
    };
  }
}

export function speak(text: string, lang: string = 'hi-IN') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
}
