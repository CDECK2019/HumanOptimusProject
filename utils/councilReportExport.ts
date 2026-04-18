import type { CouncilReport, CouncilDiscipline } from '../types';

const DISCIPLINE_LABEL: Record<CouncilDiscipline, string> = {
  western: 'Western Medicine',
  functional: 'Functional Medicine',
  tcm: 'Traditional Chinese Medicine',
  ayurveda: 'Ayurveda',
  pharmacist: 'Integrative Pharmacist',
  lifestyle: 'Lifestyle Coach',
  root_cause: 'Root Cause Analyst',
};

function bulletList(items: string[]): string {
  if (!items?.length) return '_None._';
  return items.map((i) => `- ${i}`).join('\n');
}

/** Render a council report as a self-contained markdown document. */
export function reportToMarkdown(report: CouncilReport): string {
  const date = new Date(report.generated_at);
  const synth = report.synthesis;

  return `# Human Optimus — Council Report

**Generated:** ${date.toLocaleString()}
**Question:** ${report.query || '_General comprehensive assessment_'}

---

## President's Synthesis

${synth.key_insights || '_No key insights returned._'}

### Your Next Best Step
${synth.next_best_step || '_None surfaced._'}

---

## Recommendations

### Immediate & Safe
${bulletList(synth.recommendations?.immediate_safe ?? [])}

### Consider / Discuss with Clinician
${bulletList(synth.recommendations?.consider ?? [])}

### Explore with Testing
${bulletList(synth.recommendations?.explore_with_testing ?? [])}

### Avoid / Caution
${bulletList(synth.recommendations?.avoid ?? [])}

---

## Where the Experts Differ

${synth.why_experts_differ || '_All experts substantially aligned._'}

---

## Council Voices

${report.experts
  .map((e) => {
    const heading = `### ${DISCIPLINE_LABEL[e.discipline]} _(model: ${e.model})_`;
    const body = e.failed
      ? `> ${e.content}`
      : e.content;
    return `${heading}\n\n${body}`;
  })
  .join('\n\n---\n\n')}

---

_${synth.disclaimer || 'This is not medical advice. Consult your physician before making changes.'}_
`;
}

/** Trigger a markdown download in the browser. */
export function downloadCouncilReportMarkdown(report: CouncilReport): void {
  const md = reportToMarkdown(report);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date(report.generated_at).toISOString().replace(/[:.]/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `human-optimus-council-${stamp}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
