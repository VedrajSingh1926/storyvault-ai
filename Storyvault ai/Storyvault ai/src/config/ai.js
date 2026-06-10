const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_REQUEST_TIMEOUT_MS = 25000;
const GEMINI_MAX_RETRIES = 3;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const IMAGE_ENDPOINT =
  "https://coresg-normal.trae.ai/api/ide/v1/text_to_image";

export const AI_CONFIG = Object.freeze({
  gemini: {
    apiKey: GEMINI_API_KEY,
    model: GEMINI_MODEL,
    apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    requestTimeoutMs: GEMINI_REQUEST_TIMEOUT_MS,
    maxRetries: GEMINI_MAX_RETRIES,
  },
  images: {
    endpoint: IMAGE_ENDPOINT,
    defaultSize: "landscape_4_3",
  },
});

export function getMissingGeminiKeyMessage() {
  return "Gemini API key is missing. Add VITE_GEMINI_API_KEY to your local .env file and restart the app.";
}

export function assertGeminiApiKey() {
  if (!AI_CONFIG.gemini.apiKey) {
    throw new Error(getMissingGeminiKeyMessage());
  }
}

export function buildMuseumImageUrl(prompt, imageSize = AI_CONFIG.images.defaultSize) {
  const encodedPrompt = encodeURIComponent(String(prompt || "").trim());
  return `${AI_CONFIG.images.endpoint}?prompt=${encodedPrompt}&image_size=${imageSize}`;
}

export function getGeminiDebugInfo(label, attempt) {
  return {
    label,
    attempt,
    model: AI_CONFIG.gemini.model,
    hasApiKey: Boolean(AI_CONFIG.gemini.apiKey),
    keySource: "VITE_GEMINI_API_KEY",
    timeoutMs: AI_CONFIG.gemini.requestTimeoutMs,
    maxRetries: AI_CONFIG.gemini.maxRetries,
  };
}
