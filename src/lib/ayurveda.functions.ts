import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getHerbs, findHerbByName, type Herb } from "../server/herbs.server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const GEMINI_MODEL = "gemini-2.5-flash";
const OPENAI_MODEL = "gpt-4o-mini";

type ChatBody = {
  messages: unknown[];
  [key: string]: unknown;
};

async function callOnce(url: string, key: string, model: string, body: ChatBody) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, model }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${url} ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

function extractJSON(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response");
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Try Gemini first. On any failure (network, non-OK, missing content, or invalid JSON
 * when expectJSON is true), fall back to OpenAI.
 * Returns the raw assistant text content.
 */
async function callAIWithFallback(body: ChatBody, expectJSON = true): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const tryProvider = async (
    label: string,
    url: string,
    key: string | undefined,
    model: string,
  ): Promise<string> => {
    if (!key) throw new Error(`${label} API key not configured`);
    const json = await callOnce(url, key, model, body);
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error(`${label} returned empty content`);
    if (expectJSON) {
      // Validate parseable JSON; throw to trigger fallback otherwise.
      extractJSON(text);
    }
    return text;
  };

  try {
    return await tryProvider("Gemini", GEMINI_URL, geminiKey, GEMINI_MODEL);
  } catch (geminiErr) {
    console.error("[AI] Gemini failed, falling back to OpenAI:", geminiErr);
    try {
      return await tryProvider("OpenAI", OPENAI_URL, openaiKey, OPENAI_MODEL);
    } catch (openaiErr) {
      console.error("[AI] OpenAI fallback also failed:", openaiErr);
      throw new Error(
        `Both AI providers failed. Gemini: ${(geminiErr as Error).message}. OpenAI: ${(openaiErr as Error).message}`,
      );
    }
  }
}

// =============== IDENTIFY PLANT ===============

export type PlantDetail = {
  matched: boolean;
  name: string;
  scientific_name?: string;
  family?: string;
  confidence: number;
  preview?: string;
  rasa?: string[];
  guna?: string[];
  virya?: string;
  vipaka?: string;
  pacify?: string[];
  aggravate?: string[];
  prabhav?: string[];
  conditions: { name: string; symptoms?: string; remedy?: string }[];
  benefits: string[];
  remedies: string[];
  climate?: string;
  regional_availability?: string;
  precautions: string[];
  traditional_uses?: string;
  alternative_plants: string[];
  ai_explanation?: string;
  key_features: string[];
};

export const identifyPlant = createServerFn({ method: "POST" })
  .inputValidator((data: { imageDataUrl: string }) => {
    return z.object({ imageDataUrl: z.string().min(20) }).parse(data);
  })
  .handler(async ({ data }) => {
    const herbs = await getHerbs();
    const herbList = herbs.map((h) => h.name).join(", ");

    // Step 1: vision identification + key features, restricted to dataset names
    const visionText = await callAIWithFallback({
      messages: [
        {
          role: "system",
          content:
            "You are an expert botanist specializing in Ayurvedic medicinal plants. Identify the plant in the image. You MUST pick the closest match from the provided dataset of plant names. Respond with a single JSON object only — no prose.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Identify this plant. Choose the BEST matching name from this dataset (use the exact spelling):\n${herbList}\n\nReturn JSON: { "name": "<dataset name>", "scientific_name": "...", "family": "...", "confidence": 0-100, "key_features": ["leaf shape", "stem", ...], "explanation": "why you chose this" }`,
            },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
    });

    const vision = extractJSON(visionText) as {
      name: string;
      scientific_name?: string;
      family?: string;
      confidence?: number;
      key_features?: string[];
      explanation?: string;
    };

    const herb = findHerbByName(herbs, vision.name);

    // Step 2: enrich with conditions, remedies, benefits, etc.
    const enrichText = await callAIWithFallback({
      messages: [
        {
          role: "system",
          content:
            "You are an Ayurvedic pharmacologist. Provide accurate, source-grounded information about the given herb. Return ONLY a JSON object — no prose.",
        },
        {
          role: "user",
          content: `Plant: ${vision.name}${herb?.preview ? `\nKnown profile: ${herb.preview}` : ""}\n\nReturn JSON with these keys. IMPORTANT: write everything in plain, simple English that anyone can understand. DO NOT use Sanskrit/Ayurvedic technical jargon like "rasa", "guna", "virya", "vipaka", "vata", "pitta", "kapha", "dosha", "prabhav". Instead use everyday words like "taste", "warming/cooling effect", "calms the body", "improves digestion", etc.\n{
  "conditions": [{"name": "Cough", "symptoms": "Dry throat, irritation", "remedy": "Mix 2g of the plant powder with 1 tsp honey, take twice daily."}],
  "benefits": ["Helps soothe a sore throat", "..."],
  "remedies": ["For cough: Boil 1 tsp leaves in a cup of water, strain, drink warm with honey."],
  "climate": "Grows best in warm, humid regions with partial sunlight.",
  "regional_availability": "Common across South India, especially Kerala, Tamil Nadu, Karnataka.",
  "precautions": ["Avoid during pregnancy", "..."],
  "traditional_uses": "Plain-language description of how it has traditionally been used.",
  "alternative_plants": ["Ashwagandha", "..."]
}\nProvide 6-12 conditions, 6-10 benefits, 6-12 detailed home remedy formulations, 3-5 precautions, 4-6 alternatives. Every sentence must be easy for a non-expert to understand.`,
        },
      ],
    });

    const enriched = extractJSON(enrichText) as Partial<PlantDetail>;

    const result: PlantDetail = {
      matched: !!herb,
      name: herb?.name ?? vision.name,
      scientific_name: vision.scientific_name,
      family: vision.family,
      confidence: vision.confidence ?? 70,
      preview: herb?.preview,
      rasa: herb?.rasa,
      guna: herb?.guna,
      virya: herb?.virya,
      vipaka: herb?.vipaka,
      pacify: herb?.pacify,
      aggravate: herb?.aggravate,
      prabhav: herb?.prabhav,
      conditions: enriched.conditions ?? [],
      benefits: enriched.benefits ?? [],
      remedies: enriched.remedies ?? [],
      climate: enriched.climate,
      regional_availability: enriched.regional_availability,
      precautions: enriched.precautions ?? [],
      traditional_uses: enriched.traditional_uses,
      alternative_plants: enriched.alternative_plants ?? [],
      ai_explanation: vision.explanation,
      key_features: vision.key_features ?? [],
    };
    return result;
  });

// =============== FIND REMEDIES ===============

export type RemedyMatch = {
  plant_name: string;
  scientific_name?: string;
  match_pct: number;
  why_recommended: string;
  how_it_works: string;
  dosha_effect: string;
  safe_home_remedy: string;
  precautions: string;
  diet_lifestyle?: string;
  yoga_therapy?: string;
};

export const findRemedies = createServerFn({ method: "POST" })
  .inputValidator((data: { symptoms: string; location?: string }) => {
    return z
      .object({ symptoms: z.string().min(2), location: z.string().optional() })
      .parse(data);
  })
  .handler(async ({ data }) => {
    const herbs = await getHerbs();
    const compact = herbs
      .slice(0, 700)
      .map(
        (h: Herb) =>
          `${h.name} | rasa:${(h.rasa ?? []).join(",")} | virya:${h.virya ?? ""} | pacify:${(h.pacify ?? []).join(",")} | uses:${h.preview ?? ""}`,
      )
      .join("\n");

    const text = await callAIWithFallback({
      messages: [
        {
          role: "system",
          content:
            "You are an experienced Ayurvedic practitioner. Recommend plants from the provided dataset based on the user's symptoms. Output ONLY a JSON object.",
        },
        {
          role: "user",
          content: `Symptoms / disease: ${data.symptoms}\nLocation: ${data.location || "not specified"}\n\nDATASET (choose plant names from here):\n${compact}\n\nIMPORTANT: Write all text in plain, simple English that anyone can understand. DO NOT use Sanskrit / technical Ayurvedic jargon like "rasa", "guna", "virya", "vipaka", "prabhav", "vata", "pitta", "kapha", "dosha". Use everyday words such as "taste", "warming effect", "calms the body and mind", "improves digestion", "balances energy".\n\nReturn JSON:\n{
  "diet_lifestyle": "Short paragraph in plain English.",
  "yoga_therapy": "Short paragraph in plain English.",
  "results": [
    {
      "plant_name": "<exact dataset name>",
      "scientific_name": "...",
      "match_pct": 0-100,
      "why_recommended": "Plain-English reason linked to the user's symptoms.",
      "how_it_works": "Plain-English description of how the plant helps the body — e.g. 'Has a warming effect that loosens mucus and soothes the throat.'",
      "dosha_effect": "Plain-English summary — e.g. 'Calms excess heat in the body and reduces inflammation.'",
      "safe_home_remedy": "Step-by-step instructions a regular person can follow at home.",
      "precautions": "Plain-English warnings. Always consult a qualified Ayurvedic practitioner."
    }
  ]
}\nReturn 4-8 best matches, sorted by match_pct desc. Prefer plants commonly available in the given location.`,
        },
      ],
    });

    const parsed = extractJSON(text) as {
      diet_lifestyle?: string;
      yoga_therapy?: string;
      results?: RemedyMatch[];
    };
    return {
      diet_lifestyle: parsed.diet_lifestyle ?? "",
      yoga_therapy: parsed.yoga_therapy ?? "",
      results: parsed.results ?? [],
    };
  });
