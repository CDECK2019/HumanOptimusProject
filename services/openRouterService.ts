import {
  UserProfile,
  CouncilResponse,
  CouncilReport,
  ExpertReport,
  CouncilDiscipline,
} from "../types";
import { PROMPTS } from "../constants";

/**
 * Each discipline gets its own model so the council really has distinct
 * "voices". Choices balance OpenRouter cost/quality and try to match the
 * model's strength to the discipline (e.g. Claude for clinical safety,
 * Qwen-72B for TCM/Chinese-tradition recall, GPT-4o-mini for pharmacology).
 *
 * If a slug 404s for your account, swap it without touching the call sites
 * — the UI is keyed off `discipline`, not the model.
 */
const MODELS: Record<CouncilDiscipline | 'president', string> = {
  western: "anthropic/claude-3.5-haiku",
  functional: "meta-llama/llama-3.3-70b-instruct",
  tcm: "qwen/qwen-2.5-72b-instruct",
  ayurveda: "google/gemini-2.0-flash-001",
  pharmacist: "openai/gpt-4o-mini",
  lifestyle: "meta-llama/llama-3.1-8b-instruct",
  root_cause: "deepseek/deepseek-chat",
  president: "anthropic/claude-3.5-sonnet",
};

interface ExpertSpec {
  discipline: CouncilDiscipline;
  role: string;
  prompt: string;
  model: string;
}

const EXPERTS: ExpertSpec[] = [
  { discipline: 'western', role: 'Western Medicine Advisor', prompt: PROMPTS.WESTERN, model: MODELS.western },
  { discipline: 'functional', role: 'Functional & Nutritional Medicine Specialist', prompt: PROMPTS.FUNCTIONAL, model: MODELS.functional },
  { discipline: 'tcm', role: 'Traditional Chinese Medicine Practitioner', prompt: PROMPTS.TCM, model: MODELS.tcm },
  { discipline: 'ayurveda', role: 'Ayurvedic Practitioner', prompt: PROMPTS.AYURVEDA, model: MODELS.ayurveda },
  { discipline: 'pharmacist', role: 'Integrative Pharmacist', prompt: PROMPTS.PHARMACIST, model: MODELS.pharmacist },
  { discipline: 'lifestyle', role: 'Lifestyle & Behavioral Health Coach', prompt: PROMPTS.LIFESTYLE, model: MODELS.lifestyle },
  { discipline: 'root_cause', role: 'Root Cause & Diagnostics Analyst', prompt: PROMPTS.ROOT_CAUSE, model: MODELS.root_cause },
];

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  signal?: AbortSignal;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  private async chat(
    model: string,
    systemPrompt: string,
    userContent: string,
    opts: ChatOptions = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is missing.");
    }

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 1000,
    };
    if (opts.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://humanoptimus.app",
        "X-Title": "Human Optimus Council",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: opts.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({} as { error?: { message?: string } }));
      const message = errData?.error?.message || response.statusText;
      throw new Error(`OpenRouter ${response.status}: ${message}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content ?? "";
  }

  private async consultExperts(
    profileCtx: string,
    query: string,
    signal?: AbortSignal
  ): Promise<ExpertReport[]> {
    const promises = EXPERTS.map(async (e): Promise<ExpertReport> => {
      try {
        const content = await this.chat(
          e.model,
          e.prompt,
          `USER PROFILE:\n${profileCtx}\n\nUSER QUERY: "${query}"`,
          { temperature: 0.3, maxTokens: 900, signal }
        );
        const trimmed = content.trim();
        if (!trimmed) {
          return { discipline: e.discipline, role: e.role, model: e.model, content: '[ERROR: empty response]', failed: true };
        }
        return { discipline: e.discipline, role: e.role, model: e.model, content: trimmed, failed: false };
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        return {
          discipline: e.discipline,
          role: e.role,
          model: e.model,
          content: `[ERROR: ${reason}]`,
          failed: true,
        };
      }
    });

    return Promise.all(promises);
  }

  private buildPresidentContext(experts: ExpertReport[], profileCtx: string, query: string): string {
    const briefings = experts
      .map(
        (e) => `---
### ${e.role} (model: ${e.model})
${e.content}
---`
      )
      .join("\n\n");

    return `USER PROFILE:
${profileCtx}

USER QUERY:
"${query}"

EXPERT REPORTS:
${briefings}

Task: Synthesize the above into the JSON object specified by your system prompt. Respond with JSON only.`;
  }

  /**
   * Tolerant JSON extractor. Handles bare JSON, fenced ```json blocks, and
   * cases where the model wraps JSON in stray prose.
   */
  private static extractJson(raw: string): unknown {
    const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // Fall back: try to find the first balanced object in the text.
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start >= 0 && end > start) {
        const slice = cleaned.slice(start, end + 1);
        return JSON.parse(slice);
      }
      throw new Error('No JSON object found in response.');
    }
  }

  private async synthesize(
    experts: ExpertReport[],
    profileCtx: string,
    query: string,
    signal?: AbortSignal
  ): Promise<CouncilResponse> {
    const presidentContext = this.buildPresidentContext(experts, profileCtx, query);

    const attempt = async (jsonMode: boolean, temperature: number) => {
      const raw = await this.chat(
        MODELS.president,
        PROMPTS.PRESIDENT_JSON,
        presidentContext,
        { temperature, maxTokens: 2000, jsonMode, signal }
      );
      return { raw, parsed: OpenRouterService.extractJson(raw) as CouncilResponse };
    };

    try {
      const { parsed } = await attempt(true, 0.3);
      return parsed;
    } catch (firstErr) {
      console.warn('President synthesis failed first attempt, retrying with repair instruction:', firstErr);
      try {
        const raw = await this.chat(
          MODELS.president,
          PROMPTS.PRESIDENT_JSON,
          `${presidentContext}\n\nReminder: respond with the JSON object only. No prose, no markdown fences.`,
          { temperature: 0, maxTokens: 2000, jsonMode: true, signal }
        );
        return OpenRouterService.extractJson(raw) as CouncilResponse;
      } catch (secondErr) {
        console.error('President JSON parse failed twice:', secondErr);
        throw new Error('The Council President failed to produce a structured report. Please try again.');
      }
    }
  }

  private static buildProfileContext(profile: UserProfile): string {
    return JSON.stringify(
      {
        symptoms: profile.symptoms,
        interventions: profile.interventions,
        goals: profile.goals,
        biometrics: profile.biometrics,
        labs: profile.labs,
        lifestyle_intake: profile.lifestyle_intake,
      },
      null,
      2
    );
  }

  /**
   * Run the full council: every expert in parallel, then synthesis. Returns
   * a `CouncilReport` containing both the expert briefings and the
   * President's structured synthesis so the UI can show both.
   */
  public async consultCouncil(
    profile: UserProfile,
    query: string,
    signal?: AbortSignal
  ): Promise<CouncilReport> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is missing. Set VITE_OPENROUTER_API_KEY in your env.');
    }

    const profileCtx = OpenRouterService.buildProfileContext(profile);
    const experts = await this.consultExperts(profileCtx, query, signal);

    const allFailed = experts.every((e) => e.failed);
    if (allFailed) {
      throw new Error('All council experts failed to respond. Check your API key and network.');
    }

    const synthesis = await this.synthesize(experts, profileCtx, query, signal);

    return {
      generated_at: new Date().toISOString(),
      query,
      experts,
      synthesis,
    };
  }

  public async chatWithCouncil(
    profileCtx: string,
    reportCtx: CouncilResponse,
    history: { role: string; content: string }[],
    query: string,
    signal?: AbortSignal
  ): Promise<string> {
    if (!this.apiKey) throw new Error('OpenRouter API key is missing.');

    const systemPrompt = `
You are the Council President of a multidisciplinary AI Health Council.
You have just provided a comprehensive health report to the user.
Now, you are engaging in a text-based conversation to answer follow-up questions, clarify points, or provide specific elaborations.

CONTEXT:
User Profile:
${profileCtx}

Current Report Findings:
Key Insights: ${reportCtx.key_insights}
Recommendations: ${JSON.stringify(reportCtx.recommendations, null, 2)}

INSTRUCTIONS:
1. Answer the user's question directly and conversationally.
2. Reference the "Current Report Findings" specifically (e.g., "As mentioned in the Immediate Actions...").
3. You can draw on the perspectives of the other council members (Western, Functional, TCM, Ayurveda, Pharmacist, Lifestyle, Root Cause) if helpful, but you speak as the unified President.
4. Keep answers concise (under 200 words) unless asked for a deep dive.
5. If asked to "Elaborate" on a specific expert's view, adopt that lens temporarily but maintain your President persona (e.g., "From the TCM perspective, we see...").
6. Always maintain a helpful, encouraging, and medically responsible tone.
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: query },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://humanoptimus.app',
        'X-Title': 'Human Optimus Council',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.president,
        messages,
        temperature: 0.5,
        max_tokens: 1000,
      }),
      signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({} as { error?: { message?: string } }));
      throw new Error(`OpenRouter ${response.status}: ${errData?.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }
}
