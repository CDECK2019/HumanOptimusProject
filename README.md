<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Human Optimus

**A multidisciplinary AI Health Council for personal optimization.**

Onboard your context once. Get a comprehensive assessment from seven different wellness disciplines — Western Medicine, Functional Medicine, Traditional Chinese Medicine, Ayurveda, Integrative Pharmacy, Lifestyle Coaching, and Root-Cause Diagnostics — synthesized by a President agent into one unified, exportable report.

</div>

---

## Why this exists

Most "AI health" tools collapse to one model giving generic advice. Human Optimus runs a **panel of distinct experts in parallel** (each on its own LLM, each with its own discipline-specific system prompt and safety guardrails) and then asks a synthesizer to reconcile their views into a single structured response. You see both the President's synthesis *and* every expert's standalone analysis.

It's local-first: your structured profile lives on your own PocketBase server, and council reports are persisted alongside it. Generated reports can be downloaded as Markdown.

---

## Features

- **7-discipline AI Council** — each discipline runs on a different OpenRouter model (Claude, Llama-70B, Qwen-72B, Gemini, GPT-4o-mini, Llama-8B, DeepSeek). The President synthesizes into a strict-JSON report with safety-first reconciliation.
- **Comprehensive assessment in one click** — once onboarding is complete, the Overview hero generates a full council report against your entire profile.
- **Per-discipline transparency** — every report includes collapsible "Council voices" cards showing each expert's standalone analysis.
- **Follow-up chat** — keep talking to the President after the report; quick-action buttons request elaboration from any specific discipline.
- **Persistent report history** — every report is saved (PocketBase or local-dev `localStorage`) and listed under the Reports tab. Export any report to Markdown.
- **Ten-step guided onboarding** — captures lifestyle context, environment, focus domains, weekly rhythm, baseline biometrics, strains, and active programs. Soft-validation banners nudge but don't block.
- **Structured profile editor** — symptoms, interventions, goals, biometrics, labs. ARIA-compliant tabs, keyboard navigation, robust input handling (no NaN labs, no height-input drift).
- **Readiness signal** — data-depth score in the sidebar so you always know how much context the council is working with.
- **Accessible by default** — focus-trapped mobile drawer, body-scroll-lock, ESC to close, keyboard-navigable tabs, semantic ARIA roles.
- **Self-hosted & private** — runs against your own PocketBase server. Optional dev-bypass mode runs entirely in the browser via `localStorage`.

---

## Architecture

```
┌─────────────────────┐
│  React + Vite SPA   │
│  (Tailwind UI)      │
└──────────┬──────────┘
           │
   ┌───────┴────────┐
   │                │
   ▼                ▼
┌─────────┐   ┌──────────────┐
│ Pocket- │   │ OpenRouter   │
│ Base    │   │ (7 expert    │
│ (data)  │   │  models +    │
│         │   │  President)  │
└─────────┘   └──────────────┘
```

### The Council

| Discipline                 | Default model                          | Focus                                                       |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| Western Medicine           | `anthropic/claude-3.5-haiku`           | Allopathic guidelines, red-flag triage                      |
| Functional Medicine        | `meta-llama/llama-3.3-70b-instruct`    | Root-cause physiology, nutrient status                      |
| Traditional Chinese Med    | `qwen/qwen-2.5-72b-instruct`           | Pattern differentiation (Qi, Blood, Yin/Yang)               |
| Ayurveda                   | `google/gemini-2.0-flash-001`          | Doshas, agni, dinacharya                                    |
| Integrative Pharmacist     | `openai/gpt-4o-mini`                   | Drug-supplement interactions, dosing safety                 |
| Lifestyle Coach            | `meta-llama/llama-3.1-8b-instruct`     | Behavior, stress, sleep, sustainable habits                 |
| Root Cause Analyst         | `deepseek/deepseek-chat`               | Diagnostic prioritization, testing roadmap                  |
| **President (synthesis)**  | `anthropic/claude-3.5-sonnet`          | Reconciles, surfaces consensus, JSON-strict output          |

Model assignments live in `services/openRouterService.ts` — swap any slug without touching the UI.

---

## Run locally

### Prerequisites

- **Node.js** 18+ and npm
- An **OpenRouter API key** ([openrouter.ai](https://openrouter.ai))
- *(Optional but recommended)* A running **PocketBase** server. See [pocketbase.io/docs](https://pocketbase.io/docs/).

### 1. Install

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
VITE_OPENROUTER_API_KEY=sk-or-...

# Optional: defaults to http://127.0.0.1:8090
VITE_POCKETBASE_URL=http://127.0.0.1:8090

# Optional: skip auth + persist to localStorage instead of PocketBase
VITE_DEV_SKIP_AUTH=true
```

### 3. Set up PocketBase (if not using dev-bypass)

Start your PocketBase server, then apply the migrations from `pb_migrations/`:

```bash
# from inside your pocketbase directory
./pocketbase serve
```

PocketBase auto-runs JS migrations on boot. The migrations create:
- `health_snapshots` (with `onboarding_complete` + `intake_profile_json`)
- `symptoms`, `interventions`, `goals`, `biometrics`, `labs`
- `council_reports` (stores every generated report per user)

### 4. Run

```bash
npm run dev
```

App boots at [http://localhost:3000](http://localhost:3000).

### 5. Build

```bash
npm run build
npm run preview
```

---

## Usage flow

1. **Sign up / sign in** (or skip with `VITE_DEV_SKIP_AUTH=true`).
2. **Complete the 10-step onboarding** — context, environment, coverage, time investments, focus domains, weekly rhythm, body baseline, strains, programs.
3. **Land on the Overview** — readiness score appears, and the green "Generate council report" hero unlocks once readiness ≥ 25.
4. **Click "Generate council report"** — 7 disciplines run in parallel, then the President synthesizes. Takes ~15–30s.
5. **Review the synthesis** — key insights, four tiers of recommendations (immediate / consider / explore-with-testing / avoid), where experts differ, and your single next best step.
6. **Expand any "Council voice"** to read that discipline's full standalone analysis.
7. **Export to Markdown** or **chat with the council** for follow-ups.
8. **Reports tab** keeps every report you've ever generated.

---

## Project layout

```
.
├── App.tsx                         # Root component, routing, council orchestration
├── components/
│   ├── AppShell.tsx                # Sidebar, mobile drawer, readiness display
│   ├── OverviewDashboard.tsx       # Post-onboarding home + Generate Report hero
│   ├── CoachWorkspace.tsx          # Profile editor + ad-hoc council prompt
│   ├── CouncilView.tsx             # Synthesis + per-expert collapsibles
│   ├── ChatInterface.tsx           # Follow-up chat with the President
│   ├── ReportsHistoryPanel.tsx     # Past reports list + open/export/delete
│   ├── OnboardingWizard.tsx        # 10-step lifestyle intake
│   ├── ProfileForm.tsx             # Symptoms/interventions/goals/biometrics/labs
│   ├── ProfileSettings.tsx         # Account, JSON export/import, restart onboarding
│   ├── HabitsPanel.tsx             # Weekly rhythm view
│   ├── InsightsPlaceholder.tsx     # Gated insights view
│   └── AuthView.tsx                # Sign-in / sign-up
├── services/
│   ├── openRouterService.ts        # 7-expert parallel calls + JSON-strict synthesis
│   ├── councilReportStore.ts       # Save/list/delete reports (PB + localStorage fallback)
│   ├── dataService.ts              # PocketBase CRUD with parallel upsert + delete-diff
│   ├── pocketbase.ts               # PB client init
│   ├── authBypass.ts               # Dev-only localStorage profile
│   └── intakeMerge.ts              # Merge onboarding intake → structured profile
├── utils/
│   ├── readinessScore.ts           # Data-depth scoring
│   └── councilReportExport.ts      # Markdown export
├── constants.ts                    # All seven discipline prompts + PRESIDENT prompts
├── types.ts                        # UserProfile, CouncilReport, ExpertReport, etc.
├── intakeTypes.ts                  # HealthIntake (onboarding wizard)
└── pb_migrations/                  # PocketBase JS migrations (collections + indexes)
```

---

## Customizing the council

Edit `services/openRouterService.ts`:

- **Swap models** — change any slug in the `MODELS` map.
- **Add a discipline** — add a prompt in `constants.ts`, register a new `CouncilDiscipline` in `types.ts`, push an `ExpertSpec` into the `EXPERTS` array, and add visual metadata in `components/CouncilView.tsx`'s `DISCIPLINE_META`.
- **Tweak the synthesis schema** — edit `PROMPTS.PRESIDENT_JSON` in `constants.ts` and the matching `CouncilResponse` shape in `types.ts`.

---

## Tech stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS** (currently via CDN — see deferrals below)
- **Lucide React** for icons
- **PocketBase** for backend
- **OpenRouter** for LLM orchestration

---

## Known deferrals

- **Tailwind via CDN** — `index.html` still loads `cdn.tailwindcss.com` for development simplicity. Migrating to local PostCSS/JIT is a clean future PR.
- **PDF export** — Markdown export is shipped; PDF would require adding `jspdf` or a print stylesheet.
- **Insights page** is currently a placeholder — the data-depth gate works, but trend charts are not yet wired.

---

## License

Private / personal project. Self-hosted; not for resale.
