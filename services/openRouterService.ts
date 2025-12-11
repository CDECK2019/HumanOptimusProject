import { UserProfile, CouncilResponse } from "../types";
import { PROMPTS } from "../constants";

// Model Definitions from Roadmap
const MODELS = {
    WESTERN: "mistralai/mistral-7b-instruct",
    FUNCTIONAL: "google/gemma-2-9b-it",
    TCM: "meta-llama/llama-3.1-8b-instruct",
    PHARMACIST: "mistralai/mistral-7b-instruct",
    LIFESTYLE: "google/gemma-2-9b-it",
    PRESIDENT: "qwen/qwen-2.5-7b-instruct",
};

interface ExpertResponse {
    role: string;
    model: string;
    content: string;
}

export class OpenRouterService {
    private apiKey: string;
    private baseUrl = "https://openrouter.ai/api/v1";

    constructor() {
        this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
        console.log("OpenRouter Service Initialized. Key present:", !!this.apiKey);
    }

    // Helper for OpenRouter Calls
    private async chatCompletion(model: string, systemPrompt: string, userContent: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error("OpenRouter API Key is missing.");
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "HTTP-Referer": "https://humanoptimus.app", // Required by OpenRouter
                    "X-Title": "Health Optimization Council",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userContent }
                    ],
                    temperature: 0.3, // Low temp for medical accuracy
                    max_tokens: 1000,
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(`OpenRouter Error (${response.status}): ${errData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "";

        } catch (error: any) {
            console.error(`Error calling model ${model}:`, error);
            throw new Error(`Failed to consult expert (${model}): ${error.message}`);
        }
    }

    // 1. Parallel Expert Execution
    private async consultExperts(profileCtx: string, query: string): Promise<ExpertResponse[]> {
        const experts = [
            { role: "Western Medicine Advisor", model: MODELS.WESTERN, prompt: PROMPTS.WESTERN },
            { role: "Functional Medicine Specialist", model: MODELS.FUNCTIONAL, prompt: PROMPTS.FUNCTIONAL },
            { role: "TCM Practitioner", model: MODELS.TCM, prompt: PROMPTS.TCM },
            { role: "Integrative Pharmacist", model: MODELS.PHARMACIST, prompt: PROMPTS.PHARMACIST },
            { role: "Lifestyle Coach", model: MODELS.LIFESTYLE, prompt: PROMPTS.LIFESTYLE },
        ];

        // Run all in parallel
        const promises = experts.map(async (expert) => {
            try {
                const content = await this.chatCompletion(expert.model, expert.prompt, `USER PROFILE:\n${profileCtx}\n\nUSER QUERY: "${query}"`);
                return {
                    role: expert.role,
                    model: expert.model,
                    content: content
                };
            } catch (err) {
                // Fail gracefully for individual experts so the whole council doesn't crash
                return {
                    role: expert.role,
                    model: expert.model,
                    content: `[ERROR: Expert failed to respond. Reason: ${(err as Error).message}]`
                };
            }
        });

        return Promise.all(promises);
    }

    // 2. President Synthesis
    private async synthesize(expertResults: ExpertResponse[], profileCtx: string, query: string): Promise<CouncilResponse> {

        // Format expert inputs for the President
        const expertBriefings = expertResults.map(e => `
---
### REPORT FROM: ${e.role} (Model: ${e.model})
${e.content}
---
    `).join("\n");

        const presidentContext = `
USER PROFILE:
${profileCtx}

USER QUERY:
"${query}"

EXPERT REPORTS:
${expertBriefings}

Task: Synthesize these reports into the final JSON format.
`;

        // Qwen-2.5-7B is good, but for strict JSON, we might need to enforce it via prompt strong-arming or simple parsing
        // OpenRouter supports response_format: { type: "json_object" } for some models, but let's be safe with prompt engineering first.

        // We append a reminder to the system prompt to ensure JSON
        const schemaDef = `{
  "key_insights": "string",
  "recommendations": {
    "immediate_safe": ["string", "string"],
    "consider": ["string"],
    "explore_with_testing": ["string"],
    "avoid": ["string"]
  },
  "why_experts_differ": "string",
  "next_best_step": "string",
  "disclaimer": "string"
}`;
        const jsonPrompt = PROMPTS.PRESIDENT + `\n\nCRITICAL: You must return ONLY valid JSON matching this exact schema. Do not wrap in markdown.\n\nSchema:\n${schemaDef}`;

        const rawJson = await this.chatCompletion(MODELS.PRESIDENT, jsonPrompt, presidentContext);
        console.log("President Raw Response:", rawJson); // Debugging

        try {
            // Strip markdown code blocks if present
            const cleanJson = rawJson.replace(/```json\n?|\n?```/g, "").trim();
            return JSON.parse(cleanJson) as CouncilResponse;
        } catch (e) {
            console.error("Failed to parse President's JSON:", rawJson);
            throw new Error("The Council President failed to produce a structured report. Please try again.");
        }
    }

    // Main Public Method
    public async consultCouncil(profile: UserProfile, query: string): Promise<CouncilResponse> {
        if (!this.apiKey) {
            throw new Error("API Key is missing. Please provide a valid OpenRouter API Key.");
        }

        // Prepare Context
        const profileCtx = JSON.stringify({
            symptoms: profile.symptoms,
            interventions: profile.interventions,
            goals: profile.goals,
            biometrics: profile.biometrics,
            labs: profile.labs,
            tier: profile.tier
        }, null, 2);

        // Step 1: Consult Experts
        const expertResults = await this.consultExperts(profileCtx, query);

        // Step 2: Synthesize
        const finalReport = await this.synthesize(expertResults, profileCtx, query);

        return finalReport;
    }
}
