import React, { useEffect, useState } from 'react';
import { Download, Eye, Loader2, RefreshCcw, Sparkles, Trash2 } from 'lucide-react';
import { CouncilReportStore, type StoredCouncilReport } from '../services/councilReportStore';
import { downloadCouncilReportMarkdown } from '../utils/councilReportExport';
import { CouncilView } from './CouncilView';
import type { CouncilReport } from '../types';

interface ReportsHistoryPanelProps {
  /** When set, jumps the user back into the Coach with a fresh prompt. */
  onGenerateNew: () => void;
}

export const ReportsHistoryPanel: React.FC<ReportsHistoryPanelProps> = ({ onGenerateNew }) => {
  const [items, setItems] = useState<StoredCouncilReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<CouncilReport | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await CouncilReportStore.list(20);
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleDelete = async (id: string) => {
    await CouncilReportStore.remove(id);
    await refresh();
    if (active && (active as StoredCouncilReport).generated_at && items.find((r) => r.id === id)?.generated_at === active.generated_at) {
      setActive(null);
    }
  };

  if (active) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
        >
          ← Back to all reports
        </button>
        <CouncilView
          report={active}
          onReset={() => setActive(null)}
          onExport={() => downloadCouncilReportMarkdown(active)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Reports</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">Past council reports</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Every comprehensive assessment you generate is saved here. Open one to re-read or export it.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={onGenerateNew}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500"
          >
            <Sparkles className="h-4 w-4" /> New report
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 rounded-3xl border border-slate-100 bg-white p-8 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reports…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/70 p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-display text-xl font-bold text-slate-900">No reports yet</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Generate your first council report from the Overview to see it here.
          </p>
          <button
            type="button"
            onClick={onGenerateNew}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500"
          >
            <Sparkles className="h-4 w-4" /> Generate first report
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((report) => {
            const date = new Date(report.generated_at);
            const successCount = report.experts.filter((e) => !e.failed).length;
            return (
              <li
                key={report.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {date.toLocaleString()} · {successCount} of {report.experts.length} disciplines
                    </p>
                    <p className="mt-1 truncate font-display text-base font-bold text-slate-900">
                      {report.query || 'General comprehensive assessment'}
                    </p>
                    {report.synthesis.key_insights && (
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
                        {report.synthesis.key_insights}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setActive(report)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <Eye className="h-3.5 w-3.5" /> Open
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadCouncilReportMarkdown(report)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      <Download className="h-3.5 w-3.5" /> .md
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(report.id)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-400 transition hover:border-rose-200 hover:text-rose-600"
                      aria-label="Delete report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
