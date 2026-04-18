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
 * Slugs verified against OpenRouter's catalog April 2026. If a slug 404s for
 * your account, swap it here — the UI is keyed off `discipline`, not the
 * model. The synthesize step also walks `PRESIDENT_FALLBACKS` if the
 * primary President model fails.
 */
const MODELS: Record<CouncilDiscipline | 'president', string> = {
  western: "anthropic/claude-haiku-4.5",
  functional: "meta-llama/llama-3.3-70b-instruct",
  tcm: "qwen/qwen-2.5-72b-instruct",
  ayurveda: "google/gemini-2.5-flash",
  pharmacist: "openai/gpt-4o-mini",
  lifestyle: "meta-llama/llama-3.1-8b-instruct",
  root_cause: "deepseek/deepseek-chat",
  president: "anthropic/claude-sonnet-4.5",
};

/**
 * Tried in order if the primary President model errors (e.g. is deprecated
 * or your account doesn't have access). Models fall back from highest to
 * most accessible quality.
 */
const PRESIDENT_FALLBACKS: string[] = [
  "anthropic/claude-sonnet-4.6",
  "openai/gpt-4o-mini",
  "meta-llama/llama-3.3-70b-instruct",
];

/**
 * Per-expert fallback chain. If an expert's primary model 404s, errors, or
 * the account doesn't have access, walk this list in order. Picked so the
 * council still produces output even on a restricted OpenRouter key.
 */
const EXPERT_FALLBACKS: string[] = [
  "openai/gpt-4o-mini",
  "anthropic/claude-haiku-4.5",
  "meta-llama/llama-3.3-70b-instruct",
];

/**
 * Hard cap on any single OpenRouter call. Anything slower than this is
 * almost certainly stuck and is better off retried via a fallback model than
 * left to hang the UI in "Convening…" forever.
 */
const REQUEST_TIMEOUT_MS = 60_000;

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

    // Compose a timeout signal with the caller's signal so a stuck OpenRouter
    // request never leaves the UI hanging. Uses AbortSignal.any when available
    // (Chrome 116+/Firefox 124+/Safari 17.4+) and a manual relay otherwise.
    const timeoutCtl = new AbortController();
    const timeoutId = setTimeout(() => timeoutCtl.abort(new Error('Request timeout')), REQUEST_TIMEOUT_MS);
    let composedSignal: AbortSignal = timeoutCtl.signal;
    let onCallerAbort: (() => void) | null = null;
    if (opts.signal) {
      const anyFn = (AbortSignal as unknown as { any?: (s: AbortSignal[]) => AbortSignal }).any;
      if (typeof anyFn === 'function') {
        composedSignal = anyFn([timeoutCtl.signal, opts.signal]);
      } else {
        if (opts.signal.aborted) timeoutCtl.abort(opts.signal.reason);
        else {
          onCallerAbort = () => timeoutCtl.abort(opts.signal!.reason);
          opts.signal.addEventListener('abort', onCallerAbort, { once: true });
        }
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://humanoptimus.app",
          "X-Title": "Human Optimus Council",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: composedSignal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({} as { error?: { message?: string } }));
        const message = errData?.error?.message || response.statusText;
        throw new Error(`OpenRouter ${response.status} (${model}): ${message}`);
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      // Caller-aborted: surface as-is so consult flow knows the user bailed.
      if (opts.signal?.aborted) throw new Error('Request aborted by caller.');
      // Timed out: clearer message.
      if (timeoutCtl.signal.aborted) {
        throw new Error(`OpenRouter request to ${model} timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s.`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (onCallerAbort && opts.signal) opts.signal.removeEventListener('abort', onCallerAbort);
    }
  }

  /**
   * Run one expert, walking `[primary, ...EXPERT_FALLBACKS]` until one
   * succeeds or all fail. The returned `ExpertReport.model` reflects whichever
   * model actually produced the content so the UI shows the truth.
   */
  private async consultOneExpert(
    e: ExpertSpec,
    profileCtx: string,
    query: string,
    signal?: AbortSignal
  ): Promise<ExpertReport> {
    const userContent = `USER PROFILE:\n${profileCtx}\n\nUSER QUERY: "${query}"`;
    const candidates = [e.model, ...EXPERT_FALLBACKS.filter((m) => m !== e.model)];
    let lastErr: unknown = null;

    for (const model of candidates) {
      if (signal?.aborted) {
        return { discipline: e.discipline, role: e.role, model, content: '[ERROR: aborted]', failed: true };
      }
      try {
        const content = await this.chat(model, e.prompt, userContent, {
          temperature: 0.3,
          maxTokens: 900,
          signal,
        });
        const trimmed = content.trim();
        if (!trimmed) {
          lastErr = new Error('empty response');
          console.warn(`[council] ${e.discipline} returned empty on ${model}, trying next…`);
          continue;
        }
        if (model !== e.model) {
          console.info(`[council] ${e.discipline} succeeded via fallback ${model} (primary ${e.model} failed).`);
        }
        return { discipline: e.discipline, role: e.role, model, content: trimmed, failed: false };
      } catch (err) {
        lastErr = err;
        console.warn(`[council] ${e.discipline} failed on ${model}:`, err instanceof Error ? err.message : err);
      }
    }

    const reason = lastErr instanceof Error ? lastErr.message : 'all expert models failed';
    return {
      discipline: e.discipline,
      role: e.role,
      model: e.model,
      content: `[ERROR: ${reason}]`,
      failed: true,
    };
  }

  private async consultExperts(
    profileCtx: string,
    query: string,
    signal?: AbortSignal
  ): Promise<ExpertReport[]> {
    return Promise.all(EXPERTS.map((e) => this.consultOneExpert(e, profileCtx, query, signal)));
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

  /**
   * Try the President model with JSON mode; if it fails, retry once with a
   * repair instruction at temperature 0; if that still fails, walk the
   * `PRESIDENT_FALLBACKS` chain (one attempt each). Aborts skip immediately.
   */
  private async synthesize(
    experts: ExpertReport[],
    profileCtx: string,
    query: string,
    signal?: AbortSignal
  ): Promise<CouncilResponse> {
    const presidentContext = this.buildPresidentContext(experts, profileCtx, query);
    const repairContext = `${presidentContext}\n\nReminder: respond with the JSON object only. No prose, no markdown fences.`;

    const tryModel = async (model: string, isRepair = false): Promise<CouncilResponse> => {
      const raw = await this.chat(
        model,
        PROMPTS.PRESIDENT_JSON,
        isRepair ? repairContext : presidentContext,
        { temperature: isRepair ? 0 : 0.3, maxTokens: 2000, jsonMode: true, signal }
      );
      return OpenRouterService.extractJson(raw) as CouncilResponse;
    };

    const attempts: { model: string; isRepair: boolean }[] = [
      { model: MODELS.president, isRepair: false },
      { model: MODELS.president, isRepair: true },
      ...PRESIDENT_FALLBACKS.map((model) => ({ model, isRepair: false })),
    ];

    let lastErr: unknown = null;
    for (const { model, isRepair } of attempts) {
      if (signal?.aborted) throw new Error('Council request aborted.');
      try {
        return await tryModel(model, isRepair);
      } catch (err) {
        lastErr = err;
        const tag = isRepair ? `${model} (repair retry)` : model;
        console.warn(`President synthesis attempt failed on ${tag}:`, err);
      }
    }

    console.error('President JSON parse failed across all fallbacks:', lastErr);
    const reason = lastErr instanceof Error ? lastErr.message : 'unknown error';
    throw new Error(`The Council President failed to produce a structured report (${reason}). Please try again.`);
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

    console.info('[council] Convening', { query: query.slice(0, 80), experts: EXPERTS.length });
    const t0 = performance.now();
    const profileCtx = OpenRouterService.buildProfileContext(profile);
    const experts = await this.consultExperts(profileCtx, query, signal);

    const failedDisciplines = experts.filter((e) => e.failed).map((e) => e.discipline);
    if (failedDisciplines.length === experts.length) {
      const sample = experts[0]?.content?.replace(/^\[ERROR:\s*/, '').replace(/\]$/, '') || 'unknown';
      throw new Error(
        `All council experts failed. Last error: ${sample}. Check your OpenRouter key, balance, and that the listed models are enabled on your account.`
      );
    }
    if (failedDisciplines.length > 0) {
      console.warn(`[council] ${failedDisciplines.length}/${experts.length} experts unavailable:`, failedDisciplines);
    }

    const synthesis = await this.synthesize(experts, profileCtx, query, signal);
    console.info(`[council] Done in ${Math.round(performance.now() - t0)}ms (${experts.length - failedDisciplines.length} expert voices reporting).`);

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
