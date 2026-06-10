---
name: Gemini retry keywords
description: Error message strings from Gemini that indicate transient capacity issues and should trigger retry
---

## Rule
The following Gemini error message strings are transient (capacity / rate-limit) and must be included in `shouldRetryRequest`:

- `"429"` — explicit rate limit
- `"503"` / `"service unavailable"` — server down
- `"rate limit"` / `"quota"` / `"resource has been exhausted"` — quota hit
- `"high demand"` — maps to "This model is currently experiencing high demand"
- `"overloaded"` — alternate phrasing for the same condition
- `"failed to fetch"` / `"network"` — transient connectivity

**Why:** The "high demand" message was observed in production logs but was NOT in the original retry set, causing the request to be treated as a permanent failure and immediately surfacing an error to the user instead of retrying with backoff.
