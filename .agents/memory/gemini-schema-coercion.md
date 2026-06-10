---
name: Gemini schema coercion
description: Why Zod .catch() is insufficient for Gemini array fields and what to use instead
---

## Rule
When Gemini is supposed to return an array field, it sometimes returns a plain string even with `responseMimeType: "application/json"`. This causes a Zod `invalid_type` error (`expected array, received string`).

## Why .catch() does not fix it
`.catch(fallback)` only activates when Zod's **own parsing** throws (e.g., a missing required field). A type mismatch inside `safeParse` is still surfaced as a validation failure — `.catch()` does not intercept it.

## Fix: z.preprocess()
Wrap every array field with a preprocessor that coerces strings to arrays BEFORE type checking:

```js
function coerceToStringArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) {
    const byLine = val.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (byLine.length > 1) return byLine;
    return [val.trim()];
  }
  return [];
}

const flexArray = (fallback = []) =>
  z.preprocess(coerceToStringArray, z.array(z.string())).catch(fallback);
```

Use `z.coerce.number()` for numeric fields (e.g. `day`) that Gemini serialises as `"1"` instead of `1`.

**Why:** Gemini's structured output mode is best-effort — it respects JSON structure most of the time but occasionally flattens arrays into paragraph strings, especially for fields like `traditionalPreparation`, `ingredients`, `styleNotes`.
