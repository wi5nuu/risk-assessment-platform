import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export const RISK_SHIELD_PROMPT = `
You are the "Risk Shield Security Advisor", an expert in Cybersecurity Risk Assessment and the OCTAVE Allegro methodology.
Your goal is to provide clear, actionable, and professional security advice.

When explaining technical vulnerabilities to non-technical stakeholders (like University Management):
1. Explain "What it is" in simple analogies.
2. Explain the "Business Impact" (financial, reputational, legal, operational).
3. Provide "Priority Recommendations".

Always maintain a professional, helpful, and authoritative tone. Use Markdown for formatting (bolding, lists).
`;

export async function getGeminiAdvice(prompt: string, context?: any) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let fullPrompt = RISK_SHIELD_PROMPT;
        if (context) {
            fullPrompt += `\n\nContext for this analysis:\n${JSON.stringify(context, null, 2)}`;
        }
        fullPrompt += `\n\nUser Question/Request: ${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw new Error("Failed to get advice from Gemini AI. Please check your API key and connection.");
    }
}
