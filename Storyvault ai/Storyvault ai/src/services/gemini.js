import { z } from "zod";
import {
  AI_CONFIG,
  assertGeminiApiKey,
  buildMuseumImageUrl,
  getGeminiDebugInfo,
} from "@/config/ai";

const responseCache = new Map();
const pendingRequests = new Map();

const cultureStageNode = z.object({
  year: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(10),
  imageQuery: z.string().min(5),
});

const cultureMapSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(3),
  location: z.string().min(2),
  topic: z.string().min(2),
  overview: z.string().min(20),
  origin: cultureStageNode,
  historical: cultureStageNode,
  modern: cultureStageNode,
  today: cultureStageNode,
  future2035: cultureStageNode,
});

const recipeSchema = z.object({
  recipeName: z.string().min(3),
  localName: z.string().min(1),
  state: z.string().min(2),
  imagePrompt: z.string().min(5),
  originStory: z.array(z.string().min(5)).min(2).max(4),
  ingredients: z.array(z.string().min(2)).min(4).max(12),
  traditionalPreparation: z.array(z.string().min(5)).min(3).max(6),
  culturalImportance: z.string().min(15),
  festivalsOccasions: z.array(z.string().min(2)).min(1).max(5),
  interestingFact: z.string().min(10),
  disappearingReason: z.string().min(15),
});

const travelDaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(3),
  area: z.string().min(2),
  activities: z.array(z.string().min(3)).min(2).max(6),
  placesToVisit: z.array(z.string().min(3)).min(2).max(6),
  culturalExperiences: z.array(z.string().min(3)).min(2).max(5),
  localFoodRecommendations: z.array(z.string().min(3)).min(2).max(5),
  heritageExperiences: z.array(z.string().min(3)).min(2).max(5),
});

const travelGuideSchema = z.object({
  name: z.string().min(3),
  specialty: z.string().min(5),
  area: z.string().min(2),
  note: z.string().min(10),
});

const travelPlanSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(40),
  destination: z.string().min(2),
  currentCountry: z.string().min(2),
  travelWindow: z.string().min(4),
  styleNotes: z.array(z.string().min(5)).min(3).max(6),
  itinerary: z.array(travelDaySchema).min(1).max(3),
  optionalGuides: z.array(travelGuideSchema).max(3).default([]),
});

function buildImageUrl(prompt, imageSize = "landscape_4_3") {
  return buildMuseumImageUrl(prompt, imageSize);
}

function extractTextPayload(responseData) {
  return (
    responseData?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

function parseJsonText(rawText) {
  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  const sanitized = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(sanitized);
  } catch {
    const jsonStart = sanitized.indexOf("{");
    const jsonEnd = sanitized.lastIndexOf("}");

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(sanitized.slice(jsonStart, jsonEnd + 1));
      } catch {
        throw new Error("Gemini returned malformed JSON.");
      }
    }

    throw new Error("Gemini returned malformed JSON.");
  }
}

async function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeErrorMessage(error, label) {
  const message = String(error?.message || "").trim();
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("429") ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("resource has been exhausted")
  ) {
    return "Gemini is temporarily rate-limited. Please wait a moment and retry.";
  }

  if (
    lowerMessage.includes("api key") ||
    lowerMessage.includes("permission denied") ||
    lowerMessage.includes("unauthenticated") ||
    lowerMessage.includes("denied access")
  ) {
    return "Gemini API key is invalid or missing. Add a valid VITE_GEMINI_API_KEY to the Replit Secrets panel and restart the app.";
  }

  if (
    lowerMessage.includes("empty response") ||
    lowerMessage.includes("malformed json") ||
    lowerMessage.includes("unexpected response format")
  ) {
    return `Gemini returned an invalid ${label} response. Please retry.`;
  }

  if (lowerMessage.includes("failed to fetch") || lowerMessage.includes("network")) {
    return "Network connection to Gemini failed. Check your internet connection and try again.";
  }

  if (error?.name === "AbortError") {
    return `The ${label} request took too long. Please try again.`;
  }

  return `Unable to generate the ${label} right now. Please try again.`;
}

function shouldRetryRequest(error) {
  const message = String(error?.message || "").toLowerCase();

  if (
    message.includes("429") ||
    message.includes("503") ||
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("resource has been exhausted") ||
    message.includes("service unavailable")
  ) {
    return true;
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network")
  ) {
    return true;
  }

  return false;
}

function getCacheKey(label, params) {
  return `${label}:${JSON.stringify(params)}`;
}

async function requestStructuredJson({ prompt, schema, label, cacheKey = null }) {
  assertGeminiApiKey();

  const key = cacheKey || getCacheKey(label, { prompt });

  if (responseCache.has(key)) {
    console.info("[Gemini] Cache hit", { label });
    return responseCache.get(key);
  }

  if (pendingRequests.has(key)) {
    console.info("[Gemini] Deduplicating in-flight request", { label });
    return pendingRequests.get(key);
  }

  const promise = (async () => {
    let lastError = null;

    for (let attempt = 0; attempt <= AI_CONFIG.gemini.maxRetries; attempt += 1) {
      let timeoutId;

      try {
        console.info("[Gemini] Starting structured request", getGeminiDebugInfo(label, attempt + 1));
        const controller = new AbortController();
        timeoutId = window.setTimeout(() => {
          controller.abort();
        }, AI_CONFIG.gemini.requestTimeoutMs);

        const response = await fetch(`${AI_CONFIG.gemini.apiUrl}?key=${AI_CONFIG.gemini.apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              role: "system",
              parts: [
                {
                  text: [
                    "You are the structured JSON engine for StoryVault AI.",
                    "Return valid JSON only.",
                    "Do not include markdown, commentary, code fences, or explanations.",
                    "Keep the tone premium, historically respectful, and culturally grounded.",
                    "Avoid hallucinating unsafe facts and stay plausible when exact dates are uncertain.",
                  ].join(" "),
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.45,
              topP: 0.9,
              responseMimeType: "application/json",
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const message =
            data?.error?.message ||
            `Gemini request failed while generating ${label}.`;
          throw new Error(message);
        }

        const text = extractTextPayload(data);
        const parsed = parseJsonText(text);
        const validated = schema.safeParse(parsed);

        if (!validated.success) {
          console.warn("[Gemini] Schema validation failed", {
            label,
            issues: validated.error?.issues?.slice(0, 3),
          });
          throw new Error("Gemini returned an unexpected response format.");
        }

        console.info("[Gemini] Structured request succeeded", {
          label,
          attempt: attempt + 1,
          model: AI_CONFIG.gemini.model,
        });

        responseCache.set(key, validated.data);
        return validated.data;
      } catch (error) {
        const willRetry = attempt < AI_CONFIG.gemini.maxRetries && shouldRetryRequest(error);
        console.warn("[Gemini] Structured request failed", {
          ...getGeminiDebugInfo(label, attempt + 1),
          reason: String(error?.message || "Unknown Gemini error"),
          willRetry,
        });

        lastError = new Error(normalizeErrorMessage(error, label));

        if (!shouldRetryRequest(error)) {
          break;
        }

        if (attempt < AI_CONFIG.gemini.maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 2000;
          console.info("[Gemini] Backing off before retry", { label, delayMs: backoffDelay });
          await wait(backoffDelay);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error(`Unable to generate the ${label} right now. Please try again.`);
  })();

  pendingRequests.set(key, promise);

  try {
    return await promise;
  } finally {
    pendingRequests.delete(key);
  }
}

export async function generateCultureMap({ category, location, topic }) {
  return requestStructuredJson({
    label: "culture map",
    schema: cultureMapSchema,
    cacheKey: getCacheKey("culture map", { category, location, topic }),
    prompt: `Culture Map JSON for ${category} in ${location}: ${topic}. Return {title,category,location,topic,overview,origin{year,title,description,imageQuery},historical{year,title,description,imageQuery},modern{year,title,description,imageQuery},today{year,title,description,imageQuery},future2035{year,title,description,imageQuery}}. Descriptions max 60 words. Use periods for uncertain dates. Short image queries.`.trim(),
  });
}

export async function generateRecipe({ recipeQuery }) {
  return requestStructuredJson({
    label: "traditional recipe",
    schema: recipeSchema,
    cacheKey: getCacheKey("recipe", { recipeQuery }),
    prompt: `Recipe JSON for "${recipeQuery}". Return {recipeName,localName,state,imagePrompt,originStory[string,string,string],ingredients[string],traditionalPreparation[string],culturalImportance,festivalsOccasions[string],interestingFact,disappearingReason}. Concise text. Short image prompt. Real Indian state.`.trim(),
  });
}

const topicSuggestionsSchema = z.object({
  topics: z.array(z.string().min(2)).min(2).max(10),
});

export async function generateTopicSuggestions({ category, location }) {
  return requestStructuredJson({
    label: "topic suggestions",
    schema: topicSuggestionsSchema,
    prompt: `Suggest 3 to 6 prominent cultural topics for category "${category}" in "${location}", India. Return exact JSON: { "topics": ["Topic 1", "Topic 2"] }`.trim(),
  });
}

export async function generateTravelPlan({
  currentCountry,
  destination,
  startDate,
  endDate,
}) {
  return requestStructuredJson({
    label: "travel plan",
    schema: travelPlanSchema,
    cacheKey: getCacheKey("travel plan", { currentCountry, destination, startDate, endDate }),
    prompt: `Travel plan JSON for ${currentCountry} to ${destination} (${startDate} to ${endDate}). Max 3 days. Return {title,summary,destination,currentCountry,travelWindow,styleNotes[string],itinerary[{day,title,area,activities[string],placesToVisit[string],culturalExperiences[string],localFoodRecommendations[string],heritageExperiences[string]}],optionalGuides[{name,specialty,area,note}]}. Focus on place, cultural activity, food. Condensed format.`.trim(),
  });
}

export { buildImageUrl };
