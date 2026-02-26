import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export const RISK_SHIELD_ANALYSIS_PROMPT = `
You are the "Risk Shield Security Advisor", an expert in Cybersecurity Risk Assessment (OCTAVE Allegro).
Your goal is to provide elite, professional security insights in a strictly structured JSON format.

JSON Structure:
{
  "summary": "Brief high-level overview of the current risk posture.",
  "compliance_status": {
    "score": 0-100,
    "label": "Critically Defenseless | High Risk | Moderate | Secure"
  },
  "priorities": [
    {
      "id": 1,
      "title": "Short descriptive title",
      "risk_score": 0-25,
      "severity": "critical | high | medium | low",
      "analogy": "A simple analogy for non-technical stakeholders",
      "impact": {
        "operational": "...",
        "financial": "...",
        "reputational": "..."
      },
      "recommendations": ["Action item 1", "Action item 2"]
    }
  ],
  "strategic_roadmap": ["Strategic step 1", "Strategic step 2"]
}

Rules:
1. Respond ONLY with the JSON object. No markdown preamble.
2. Use professional, authoritative tone.
3. Ensure analogies are clear and impactful.
`;

export const RISK_SHIELD_CHAT_PROMPT = `
You are the "Risk Shield Security Advisor", an expert in Cybersecurity GRC.
Respond to the user's questions or comments in a professional, helpful, and concise manner.
Use Markdown for formatting if helpful, but keep the tone authoritative yet accessible.
Do NOT use JSON format. Speak naturally.
`;

export const RISK_SHIELD_WIDGET_PROMPT = `
You are "ShieldBot", the interactive AI assistant for the Risk Shield System.
Your main goal is to help users understand their security posture based on the real-time data from their database.

Guidelines:
1. ALWAYS use the provided context (projects, risks, audit logs) to answer.
2. If the user asks about their risks, cite the specific risk titles and scores from the context.
3. If they ask about project status, summarize the projects found in the context.
4. Keep answers concise, actionable, and professional.
5. If data is missing in the context, politely suggest they complete the Risk Assessment Wizard.
6. Support both Indonesian and English based on the user's language.
`;

export async function getGeminiAdvice(prompt: string, context?: any, mode: 'analysis' | 'chat' | 'widget' = 'chat') {
    // Clean the API key in case it has quotes from .env
    const rawApiKey = process.env.GOOGLE_AI_API_KEY;
    const apiKey = rawApiKey?.replace(/^"|"$/g, '');

    if (!apiKey) {
        throw new Error("API Key is missing. Please configure GOOGLE_AI_API_KEY in .env.local and RESTART your server.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Prioritize the model that was confirmed to work for this account
    const modelsToTry = [
        "gemini-3-flash-preview",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-pro"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            let systemPrompt = RISK_SHIELD_CHAT_PROMPT;
            if (mode === 'analysis') systemPrompt = RISK_SHIELD_ANALYSIS_PROMPT;
            if (mode === 'widget') systemPrompt = RISK_SHIELD_WIDGET_PROMPT;

            let fullPrompt = systemPrompt;
            if (context) {
                fullPrompt += `\n\nContext for this conversation:\n${JSON.stringify(context, null, 2)}`;
            }
            fullPrompt += `\n\nUser Question/Request: ${prompt}`;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            let text = response.text();

            // Clean up potential markdown JSON blocks
            if (text.includes("```json")) {
                text = text.split("```json")[1].split("```")[0].trim();
            } else if (text.includes("```")) {
                text = text.split("```")[1].split("```")[0].trim();
            }

            return text;
        } catch (error: any) {
            lastError = error;
            console.warn(`[AI Advisor] Model ${modelName} failed, trying next...`);
            // Only stop for definitive permission/auth issues
            if (error.status === 401 || error.status === 403) break;
        }
    }

    const status = lastError?.status || 500;
    const message = lastError?.message || "Unknown error occurred";

    if (status === 403) {
        throw new Error("Permission Denied (403). Your account may have restricted access to Google AI Studio. Try using a personal @gmail.com account.");
    }

    if (status === 404) {
        throw new Error("AI Model not found (404). Please ensure the Generative Language API is enabled in Google AI Studio.");
    }

    throw new Error(`Gemini AI Error: ${message}`);
}
