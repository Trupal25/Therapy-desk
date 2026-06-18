/**
 * lib/gemini.ts
 *
 * Google Gemini API helper for SOAP note generation.
 * Uses the REST API directly — no SDK dependency needed.
 *
 * Checks model availability in order of preference and caches the result.
 * Required env var:
 *   GEMINI_API_KEY=<your Gemini API key>
 */

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/** Models to try, in order of preference (best → fallback) */
const MODEL_PREFERENCE = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
] as const;

type GeminiModel = (typeof MODEL_PREFERENCE)[number];

/** Cache resolved model for 10 minutes to avoid hammering the list endpoint */
let cachedModel: { name: GeminiModel; resolvedAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return key;
}

/**
 * Lists available models from the Gemini API and returns the
 * best model from our preference list that is available.
 */
export async function resolveAvailableModel(): Promise<GeminiModel> {
  // Return cached result if still fresh
  if (cachedModel && Date.now() - cachedModel.resolvedAt < CACHE_TTL_MS) {
    return cachedModel.name;
  }

  const apiKey = getApiKey();

  try {
    const res = await fetch(`${GEMINI_BASE_URL}/models?key=${apiKey}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`Gemini model list failed (${res.status}), defaulting to first preference.`);
      const fallback = MODEL_PREFERENCE[0];
      cachedModel = { name: fallback, resolvedAt: Date.now() };
      return fallback;
    }

    const data = await res.json();
    const availableIds = new Set<string>(
      (data.models || []).map((m: { name: string }) => {
        // API returns "models/gemini-2.5-flash" → extract "gemini-2.5-flash"
        const parts = m.name.split("/");
        return parts[parts.length - 1];
      })
    );

    console.log(`🔍 Available Gemini models: ${[...availableIds].join(", ")}`);

    for (const preferred of MODEL_PREFERENCE) {
      if (availableIds.has(preferred)) {
        console.log(`✅ Resolved Gemini model: ${preferred}`);
        cachedModel = { name: preferred, resolvedAt: Date.now() };
        return preferred;
      }
    }

    // None matched exactly — try partial match (e.g. "gemini-2.5-flash-preview-...")
    for (const preferred of MODEL_PREFERENCE) {
      const partial = [...availableIds].find((id) => id.startsWith(preferred));
      if (partial) {
        console.log(`✅ Resolved Gemini model (partial match): ${partial}`);
        cachedModel = { name: partial as GeminiModel, resolvedAt: Date.now() };
        return partial as GeminiModel;
      }
    }

    // Ultimate fallback
    console.warn("⚠️ No preferred model found, using gemini-2.0-flash as fallback.");
    const fallback = "gemini-2.0-flash" as GeminiModel;
    cachedModel = { name: fallback, resolvedAt: Date.now() };
    return fallback;
  } catch (err) {
    console.error("Failed to list Gemini models:", err);
    const fallback = MODEL_PREFERENCE[0];
    cachedModel = { name: fallback, resolvedAt: Date.now() };
    return fallback;
  }
}

export interface SoapFields {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

/**
 * Calls the Gemini API to generate a structured SOAP note from raw therapist notes.
 * Returns the parsed SOAP fields and the model name used.
 */
export async function generateSoapWithGemini(
  rawNotes: string,
  sessionType?: string
): Promise<{ soap: SoapFields; model: string }> {
  const apiKey = getApiKey();
  const model = await resolveAvailableModel();

  const sessionContext = sessionType
    ? `\nSession Type: ${sessionType}`
    : "";

  const prompt = `You are a clinical psychology documentation assistant. Convert the following raw therapist session shorthand notes into a highly professional, structured clinical SOAP note suitable for medical records.

Follow these clinical documentation standards:
- Use clinical terminology appropriate for mental health documentation
- Be specific and measurable where possible
- Avoid subjective language in the Objective section
- Include risk assessment considerations when relevant
- Format the Plan section as numbered actionable items
${sessionContext}

Raw Session Notes:
"${rawNotes}"

IMPORTANT: Respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact keys:
{
  "subjective": "(Patient's self-reported symptoms, concerns, and experiences in clinical language)",
  "objective": "(Therapist's clinical observations: affect, appearance, behavior, cognition, speech patterns)",
  "assessment": "(Clinical formulation, diagnostic impressions, progress evaluation, risk assessment)",
  "plan": "(Numbered treatment plan items: interventions, homework, follow-up scheduling, referrals)"
}`;

  const endpoint = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;

  console.log(`🤖 Sending SOAP generation request to Gemini (${model})...`);
  const startTime = Date.now();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });

  const durationMs = Date.now() - startTime;

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Gemini API error (${res.status}):`, errText);
    throw new Error(`Gemini API returned ${res.status}: ${errText}`);
  }

  const data = await res.json();

  // Extract text from Gemini response
  const responseText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    console.error("Gemini returned empty response:", JSON.stringify(data));
    throw new Error("Gemini returned an empty response");
  }

  // Clean up the response text (strip any markdown artifacts)
  let cleanedText = responseText.trim();
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.slice(7);
  }
  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  const parsed = JSON.parse(cleanedText);

  if (!parsed.subjective || !parsed.objective || !parsed.assessment || !parsed.plan) {
    throw new Error("Gemini response missing required SOAP fields");
  }

  console.log(`✅ SOAP note generated via ${model} in ${durationMs}ms`);

  return {
    soap: {
      subjective: parsed.subjective,
      objective: parsed.objective,
      assessment: parsed.assessment,
      plan: parsed.plan,
    },
    model: `gemini/${model}`,
  };
}
