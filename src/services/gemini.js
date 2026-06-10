import { z } from "zod";
import {
  AI_CONFIG,
  assertGeminiApiKey,
  buildMuseumImageUrl,
  getGeminiDebugInfo,
} from "@/config/ai";

const responseCache = new Map();
const pendingRequests = new Map();

// ---------------------------------------------------------------------------
// Coercion helpers
//
// Gemini occasionally returns an array field as a plain string even when
// instructed to return JSON arrays.  These preprocessors normalise the value
// before Zod type-checks it, so schema validation never fails on that alone.
// ---------------------------------------------------------------------------

/**
 * Accepts a string OR an array of strings.
 * A plain string is split into sentences / newline-separated lines so the
 * component always receives an array it can map over.
 */
function coerceToStringArray(val) {
  if (Array.isArray(val)) {
    return val.map((item) => (typeof item === "string" ? item : String(item)));
  }
  if (typeof val === "string" && val.trim()) {
    // Try newline split first
    const byLine = val
      .split(/\n+/)
      .map((s) => s.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(Boolean);
    if (byLine.length > 1) return byLine;
    // Fall back to sentence split
    const bySentence = val
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (bySentence.length > 1) return bySentence;
    // Single-item array
    return [val.trim()];
  }
  return [];
}

/** Preprocessed array-of-strings schema with an empty-array fallback. */
const flexArray = (fallback = []) =>
  z.preprocess(coerceToStringArray, z.array(z.string())).catch(fallback);

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const cultureStageNode = z
  .object({
    year: z.string().catch(""),
    title: z.string().catch(""),
    description: z.string().catch(""),
    imageQuery: z.string().catch(""),
  })
  .passthrough();

const cultureMapSchema = z
  .object({
    title: z.string().catch(""),
    category: z.string().catch(""),
    location: z.string().catch(""),
    topic: z.string().catch(""),
    overview: z.string().catch(""),
    origin: cultureStageNode,
    historical: cultureStageNode,
    modern: cultureStageNode,
    today: cultureStageNode,
    future2035: cultureStageNode,
  })
  .passthrough();

const recipeSchema = z
  .object({
    recipeName: z.string().catch(""),
    localName: z.string().catch(""),
    state: z.string().catch(""),
    imagePrompt: z.string().catch(""),
    originStory: flexArray(["Origin story not available."]),
    ingredients: flexArray(["Ingredients not available."]),
    traditionalPreparation: flexArray(["Preparation steps not available."]),
    culturalImportance: z.string().catch(""),
    festivalsOccasions: flexArray(["General celebration"]),
    interestingFact: z.string().catch(""),
    disappearingReason: z.string().catch(""),
  })
  .passthrough();

const travelDaySchema = z
  .object({
    // coerce handles "1" → 1 when Gemini serialises numbers as strings
    day: z.coerce.number().int().positive().catch(1),
    title: z.string().catch(""),
    area: z.string().catch(""),
    activities: flexArray([]),
    placesToVisit: flexArray([]),
    culturalExperiences: flexArray([]),
    localFoodRecommendations: flexArray([]),
    heritageExperiences: flexArray([]),
  })
  .passthrough();

const travelGuideSchema = z
  .object({
    name: z.string().catch(""),
    specialty: z.string().catch(""),
    area: z.string().catch(""),
    note: z.string().catch(""),
  })
  .passthrough();

const travelPlanSchema = z
  .object({
    title: z.string().catch(""),
    summary: z.string().catch(""),
    destination: z.string().catch(""),
    currentCountry: z.string().catch(""),
    travelWindow: z.string().catch(""),
    styleNotes: flexArray([]),
    itinerary: z
      .preprocess(
        (val) => (Array.isArray(val) ? val : []),
        z.array(travelDaySchema).min(1)
      )
      .catch([]),
    optionalGuides: z
      .preprocess(
        (val) => (Array.isArray(val) ? val : val == null ? [] : []),
        z.array(travelGuideSchema)
      )
      .catch([]),
  })
  .passthrough();

const topicSuggestionsSchema = z.object({
  topics: flexArray(["Cultural Heritage", "Local Tradition"]),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  if (!rawText) throw new Error("Gemini returned an empty response.");

  const sanitized = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(sanitized);
  } catch {
    const start = sanitized.indexOf("{");
    const end = sanitized.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(sanitized.slice(start, end + 1));
      } catch {
        throw new Error("Gemini returned malformed JSON.");
      }
    }
    throw new Error("Gemini returned malformed JSON.");
  }
}

async function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function normalizeErrorMessage(error, label) {
  const lower = String(error?.message || "").toLowerCase();

  if (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource has been exhausted") ||
    lower.includes("high demand") ||
    lower.includes("overloaded")
  ) {
    return "Gemini is temporarily busy. Please wait a moment and retry.";
  }

  if (
    lower.includes("api key") ||
    lower.includes("permission denied") ||
    lower.includes("unauthenticated") ||
    lower.includes("denied access")
  ) {
    return "Gemini API key is invalid or missing. Add a valid VITE_GEMINI_API_KEY to the Replit Secrets panel and restart the app.";
  }

  if (
    lower.includes("empty response") ||
    lower.includes("malformed json") ||
    lower.includes("schema validation") ||
    lower.includes("unexpected response format")
  ) {
    return `Gemini returned an invalid ${label} response. Please retry.`;
  }

  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "Network connection to Gemini failed. Check your internet connection and try again.";
  }

  if (error?.name === "AbortError") {
    return `The ${label} request took too long. Please try again.`;
  }

  return `Unable to generate the ${label} right now. Please try again.`;
}

function shouldRetryRequest(error) {
  const lower = String(error?.message || "").toLowerCase();

  return (
    lower.includes("429") ||
    lower.includes("503") ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("resource has been exhausted") ||
    lower.includes("service unavailable") ||
    lower.includes("high demand") ||
    lower.includes("overloaded") ||
    lower.includes("failed to fetch") ||
    lower.includes("network")
  );
}

function getCacheKey(label, params) {
  return `${label}:${JSON.stringify(params)}`;
}

// ---------------------------------------------------------------------------
// Core request executor
// ---------------------------------------------------------------------------

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
        console.info(
          "[Gemini] Starting structured request",
          getGeminiDebugInfo(label, attempt + 1)
        );

        const controller = new AbortController();
        timeoutId = window.setTimeout(
          () => controller.abort(),
          AI_CONFIG.gemini.requestTimeoutMs
        );

        const response = await fetch(
          `${AI_CONFIG.gemini.apiUrl}?key=${AI_CONFIG.gemini.apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: {
                role: "system",
                parts: [
                  {
                    text: [
                      "You are the structured JSON engine for StoryVault AI.",
                      "CRITICAL: Return only a single valid JSON object — no markdown, no code fences, no prose, no explanations.",
                      "Every field that is described as an array MUST be a JSON array, even if it contains only one item.",
                      "Every field described as a number MUST be a JSON number (integer), NOT a quoted string.",
                      "Every string field must be a non-empty string.",
                      "Do not omit any key from the requested schema.",
                      "Keep the tone premium, historically respectful, and culturally grounded.",
                    ].join(" "),
                  },
                ],
              },
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4,
                topP: 0.9,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error?.message ||
              `Gemini request failed while generating ${label}.`
          );
        }

        const text = extractTextPayload(data);
        const parsed = parseJsonText(text);
        const validated = schema.safeParse(parsed);

        if (!validated.success) {
          // Detailed diagnostic log — shows exactly which field failed and why
          const issues = validated.error?.issues ?? [];
          console.warn("[Gemini] Schema validation failed", {
            label,
            issueCount: issues.length,
            issues: issues.map((i) => ({
              path: i.path.join("."),
              code: i.code,
              message: i.message,
              received: "received" in i ? i.received : typeof parsed?.[i.path?.[0]],
            })),
            topLevelKeys: parsed ? Object.keys(parsed) : [],
          });

          const fieldList = issues
            .slice(0, 3)
            .map((i) => i.path.join(".") || "root")
            .join(", ");
          // Schema failures are not transient — don't retry
          throw new Error(`schema validation failed for ${label}: [${fieldList}]`);
        }

        console.info("[Gemini] Structured request succeeded", {
          label,
          attempt: attempt + 1,
          model: AI_CONFIG.gemini.model,
        });

        responseCache.set(key, validated.data);
        return validated.data;
      } catch (error) {
        const willRetry =
          attempt < AI_CONFIG.gemini.maxRetries && shouldRetryRequest(error);

        console.warn("[Gemini] Structured request failed", {
          ...getGeminiDebugInfo(label, attempt + 1),
          reason: String(error?.message || "Unknown Gemini error"),
          willRetry,
        });

        lastError = new Error(normalizeErrorMessage(error, label));

        if (!shouldRetryRequest(error)) break;

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

// ---------------------------------------------------------------------------
// Public API — explicit, typed prompts to minimise schema drift
// ---------------------------------------------------------------------------

export async function generateCultureMap({ category, location, topic }) {
  return requestStructuredJson({
    label: "culture map",
    schema: cultureMapSchema,
    cacheKey: getCacheKey("culture map", { category, location, topic }),
    prompt: `
Generate a Culture Map JSON object for the topic "${topic}" under the category "${category}" in "${location}", India.

Return ONLY this exact JSON object (no markdown, no code fences):
{
  "title": "descriptive title string",
  "category": "${category}",
  "location": "${location}",
  "topic": "${topic}",
  "overview": "2-4 sentence overview string",
  "origin":     { "year": "year or period string", "title": "short title", "description": "2-3 sentence description", "imageQuery": "5-8 word image search query" },
  "historical": { "year": "year or period string", "title": "short title", "description": "2-3 sentence description", "imageQuery": "5-8 word image search query" },
  "modern":     { "year": "year or period string", "title": "short title", "description": "2-3 sentence description", "imageQuery": "5-8 word image search query" },
  "today":      { "year": "year or period string", "title": "short title", "description": "2-3 sentence description", "imageQuery": "5-8 word image search query" },
  "future2035": { "year": "2035", "title": "short title", "description": "2-3 sentence description", "imageQuery": "5-8 word image search query" }
}

All five stage objects are required. All values must be non-empty strings.
`.trim(),
  });
}

export async function generateRecipe({ recipeQuery }) {
  return requestStructuredJson({
    label: "traditional recipe",
    schema: recipeSchema,
    cacheKey: getCacheKey("recipe", { recipeQuery }),
    prompt: `
Generate a Traditional Recipe JSON object for "${recipeQuery}".

Return ONLY this exact JSON object (no markdown, no code fences):
{
  "recipeName": "full recipe name string",
  "localName": "local language name string (empty string if unknown)",
  "state": "Indian state name string",
  "imagePrompt": "5-10 word visual description of the dish",
  "originStory": ["sentence 1", "sentence 2", "sentence 3"],
  "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3", "ingredient 4", "ingredient 5"],
  "traditionalPreparation": ["step 1", "step 2", "step 3", "step 4"],
  "culturalImportance": "2-3 sentence string",
  "festivalsOccasions": ["occasion 1", "occasion 2"],
  "interestingFact": "1-2 sentence string",
  "disappearingReason": "1-2 sentence string"
}

IMPORTANT: originStory, ingredients, traditionalPreparation, and festivalsOccasions MUST be JSON arrays of strings, not plain text paragraphs.
`.trim(),
  });
}

export async function generateTopicSuggestions({ category, location }) {
  return requestStructuredJson({
    label: "topic suggestions",
    schema: topicSuggestionsSchema,
    prompt: `
List 4 to 6 specific, well-known cultural topics for the category "${category}" in "${location}", India.

Return ONLY this exact JSON object:
{ "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"] }

Use real named items (e.g. "Ghoomar", "Bandhani", "Pushkar Fair"). No descriptions, only names.
`.trim(),
  });
}

export async function generateTravelPlan({ currentCountry, destination, startDate, endDate }) {
  return requestStructuredJson({
    label: "travel plan",
    schema: travelPlanSchema,
    cacheKey: getCacheKey("travel plan", { currentCountry, destination, startDate, endDate }),
    prompt: `
Generate a Cultural Heritage Travel Plan JSON for a traveler from "${currentCountry}" visiting "${destination}", India (${startDate} to ${endDate}).

Return ONLY this exact JSON object (no markdown, no code fences):
{
  "title": "journey title string",
  "summary": "3-4 sentence summary string",
  "destination": "${destination}",
  "currentCountry": "${currentCountry}",
  "travelWindow": "formatted date range string",
  "styleNotes": ["note 1", "note 2", "note 3"],
  "itinerary": [
    {
      "day": 1,
      "title": "day title string",
      "area": "neighbourhood or zone string",
      "activities": ["activity 1", "activity 2", "activity 3"],
      "placesToVisit": ["place 1", "place 2", "place 3"],
      "culturalExperiences": ["experience 1", "experience 2"],
      "localFoodRecommendations": ["food 1", "food 2"],
      "heritageExperiences": ["heritage 1", "heritage 2"]
    }
  ],
  "optionalGuides": [
    { "name": "guide name", "specialty": "specialty string", "area": "area string", "note": "note string" }
  ]
}

CRITICAL RULES:
- "day" must be a JSON integer (1, 2, 3) — NOT a quoted string like "1".
- All array fields (activities, placesToVisit, etc.) MUST be JSON arrays of strings.
- "styleNotes" must contain at least 3 strings.
- "optionalGuides" may be an empty array [] if not applicable.
- Include 1 to 3 day entries in "itinerary".
`.trim(),
  });
}

export { buildImageUrl };
