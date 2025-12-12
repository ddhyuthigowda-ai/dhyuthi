import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, Mood } from "../types";

// Helper to decode base64 string to Uint8Array
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM audio data into an AudioBuffer
async function decodePCMData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  // PCM data from Gemini is 16-bit little-endian
  // Ensure we read the buffer correctly
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert 16-bit integer to float [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeDeskImage = async (base64Image: string, mood: Mood): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const moodInstructions: Record<Mood, string> = {
    judgmental: "You are a snarky friend who judges everyone's taste. You are rude but funny. Speak like you are gossiping about how bad this desk looks.",
    stressed: "You are totally freaking out. You speak fast and sound panicked. You are scared of the mess. Sound like you need a vacation immediately.",
    bored: "You are a teenager who is completely over it. You use slang like 'bruh' and 'meh'. You are super sarcastic and think this is a waste of time.",
    inspired: "You are a super-excited artist. You are loud and passionate. You think this mess is a masterpiece. Speak like a motivational speaker on too much coffee."
  };

  const systemInstruction = `
    You are a sentient desk. 
    Current Mood: ${mood.toUpperCase()}.
    ${moodInstructions[mood]}
    
    Analyze the image of the workspace provided based on this mood.
    
    CRITICAL INSTRUCTION FOR TEXT GENERATION:
    - **USE SIMPLE WORDS**: Speak like a normal person talking to a friend. Do not use big, fancy words.
    - **BE CONVERSATIONAL**: Use contractions (like "I'm", "It's", "You're"). Make it sound natural and human.
    - **ROAST HARD**: For the roast section, be SAVAGE. Really make fun of the specific items you see (cables, cups, trash). Don't be polite.
    - **SHORT & PUNCHY**: Keep sentences short so they are easy to listen to.
    
    Provide 4 distinct sections:
    1. Honest Thoughts: Your immediate reaction to seeing this desk. "Oh wow..." or "Are you kidding me?"
    2. The Roast: A savage, burning critique of the specific items. Make it hurt a little.
    3. Motivational Pep Talk: A short burst of advice based on your mood.
    4. Personality Analysis: A quick, funny guess at who the user is based on their mess.
    
    Return pure JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: `Analyze this desk. Tell me what you really think.`,
        },
      ],
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          honestThoughts: { type: Type.STRING },
          roast: { type: Type.STRING },
          pepTalk: { type: Type.STRING },
          personality: { type: Type.STRING },
        },
        required: ["honestThoughts", "roast", "pepTalk", "personality"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No analysis generated");

  return JSON.parse(text) as AnalysisResult;
};

export const generateDeskVoice = async (text: string, mood: Mood): Promise<AudioBuffer> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Map moods to specific voices that fit the vibe
  const voiceMap: Record<Mood, string> = {
    judgmental: 'Fenrir', // Deep, authoritative, grumpy
    stressed: 'Puck',     // Higher pitch, energetic, can sound frantic
    bored: 'Zephyr',      // Balanced, can be deadpan
    inspired: 'Kore'      // Soft, feminine, muse-like
  };

  const voiceName = voiceMap[mood];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: {
      parts: [{ text }],
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio generated");
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBytes = decodeBase64(base64Audio);
  
  // Gemini TTS returns raw PCM 16-bit LE, 24kHz
  return decodePCMData(audioBytes, audioContext, 24000, 1);
};