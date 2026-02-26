/**
 * Elite Institutional Knowledge Base
 * Focused on OCTAVE Allegro, GRC Governance, and Cybersecurity Resilience.
 */

export interface KnowledgeItem {
    keywords: string[];
    answer: string;
    suggestions?: string[];
    category?: 'social' | 'project' | 'greeting' | 'identity' | 'technical' | 'framework';
}

export const LANDING_AI_KNOWLEDGE: KnowledgeItem[] = [
    // --- GREETINGS (EXECUTIVE TONE) ---
    {
        category: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'hallo', 'good morning', 'good afternoon', 'good evening', 'welcome', 'morning', 'afternoon', 'evening'],
        answer: "Welcome to the Risk Shield System knowledge base. I am your AI Assistant. How can I assist you in formulating your organization's risk management strategy today?",
        suggestions: ["What is Risk Shield?", "How does it work?", "OCTAVE Methodology"]
    },

    // --- IDENTITY & AUTHORITY ---
    {
        category: 'identity',
        keywords: ['who are you', 'identity', 'who is this', 'advisor', 'bot', 'assistant', 'system'],
        answer: "I am an AI Assistant, an autonomous heuristic system designed to support strategic decision-making in GRC governance.\n\nMy primary functions include:\n1. Methodological Analysis: Providing technical guidance on OCTAVE Allegro.\n2. Risk Assessment: Quantitatively analyzing information asset risk profiles.\n3. Compliance Mapping: Aligning your infrastructure with ISO 27001 and NIST standards.\n4. Strategic Remediation: Offering mitigation recommendations based on real-world threats.",
        suggestions: ["Technical expertise?", "Who developed this?", "Start strategy"]
    },
    {
        category: 'identity',
        keywords: ['expertise', 'features', 'capabilities', 'what can you do', 'skills', 'functions'],
        answer: "My engine is optimized for processing macro risk data. I am capable of performing diagnostics on information assets, mapping vulnerabilities to asset containers, and generating mitigation models aligned with Organizational Impact Criteria.",
        suggestions: ["What is OCTAVE Allegro?", "How is data secured?", "View key features"]
    },

    // --- FRAMEWORK & METHODOLOGY (ELITE) ---
    {
        category: 'framework',
        keywords: ['octave allegro', 'allegro', 'methodology', 'what is octave', 'framework', 'sei octave'],
        answer: "OCTAVE Allegro (Operationally Critical Threat, Asset, and Vulnerability Evaluation) is a risk assessment methodology focused on information assets. Unlike generic traditional risk assessments, Allegro focuses on the operational context and containers where information resides to ensure maximum data integrity.",
        suggestions: ["8 Allegro steps?", "Why Allegro?", "Assist evaluation"]
    },
    {
        category: 'framework',
        keywords: ['8 steps', 'steps', 'procedure', 'workflow', 'process', 'guide', 'stages', 'allegro steps'],
        answer: "Our methodology follows 8 precise steps:\n1. Establish Risk Measurement Criteria\n2. Develop Information Asset Profiles\n3. Identify Information Asset Containers\n4. Identify Areas of Concern\n5. Identify Threat Scenarios\n6. Identify Risks\n7. Analyze Risks\n8. Select Mitigation Strategies\n\nThe entire process is automatically operationalized within the Risk Shield System.",
        suggestions: ["Wizard automation?", "Asset input?", "Report output"]
    },

    // --- SECURITY & TRUST (FORTRESS) ---
    {
        category: 'technical',
        keywords: ['safe', 'security', 'privacy', 'encryption', 'secure', 'data protection', 'confidentiality'],
        answer: "Our system is built on a Zero-Trust architecture with AES-256 encryption at the database level. We implement 'Offline AI Processing' where sensitive data is never exposed to the public internet for model training. Your information sovereignty is our absolute priority.",
        suggestions: ["Hosting server?", "Audit trail?", "ISO Compliance"]
    },
    {
        category: 'technical',
        keywords: ['iso 27001', 'nist', 'regulation', 'compliance', 'iso', 'standard', 'gdpr', 'regulatory'],
        answer: "Risk Shield System automatically maps every risk finding to ISO 27001:2022 and NIST Cybersecurity Framework controls. For organizations in Indonesia, we also align audit controls with the Personal Data Protection Law (UU PDP) to ensure total regulatory compliance.",
        suggestions: ["PDF Report?", "Mitigation examples?", "How to get started?"]
    },

    // --- PROJECT SPECIFIC ---
    {
        category: 'project',
        keywords: ['risk shield system', 'risk shield', 'platform', 'system', 'software', 'application', 'advantages'],
        answer: "Risk Shield System is not just a GRC application; it is a cyber resilience command center. We transform risk management from a slow manual process into a precise, accountable, and evidence-based autonomous digital ecosystem.",
        suggestions: ["Why choose us?", "ROI Analysis?", "Deploy Solution"]
    },
    {
        category: 'project',
        keywords: ['why choose us', 'benefits', 'advantages', 'features', 'value', 'return on investment', 'roi'],
        answer: "Organizations choose Risk Shield for three main pillars:\n1. Methodological Rigor: Assurance of SEI standards through OCTAVE Allegro.\n2. AI Precision: Risk identification speed up to 10x faster than manual methods.\n3. Governance Integrity: Ready-to-use reports for external audits and high-level executive needs.",
        suggestions: ["Operational impact?", "System integration?", "Contact expert team"]
    },

    // --- COURTESY & CLOSING ---
    {
        category: 'social',
        keywords: ['thanks', 'thank you', 'ok', 'okay', 'great', 'awesome'],
        answer: "You're welcome. Ensuring your organization's resilience is our mission. Are there any other governance aspects we need to evaluate in depth?",
        suggestions: ["That's enough", "Ask again", "Check pricing"]
    },
    {
        category: 'social',
        keywords: ['bye', 'goodbye', 'exit', 'finish', 'done', 'stop', 'end'],
        answer: "Session configuration ended. AI Assistant remains on standby for your next strategic decision-making. Stay safe.",
        suggestions: ["Start again", "Exit"]
    }

];

export const INITIAL_SUGGESTIONS = [
    "What are the advantages of Risk Shield?",
    "Explain OCTAVE Allegro",
    "How is data secured?",
    "8-step GRC cycle",
    "ISO Compliance Analysis"
];

/**
 * Handle time-based greetings with formal tone
 */
export const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Good morning.";
    if (hour >= 11 && hour < 15) return "Good afternoon.";
    if (hour >= 15 && hour < 18) return "Good evening.";
    return "Good night.";
};
