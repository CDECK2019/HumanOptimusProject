import React from 'react';
import { CouncilResponse } from '../types';
import { ShieldCheck, Info, Microscope, AlertTriangle, FlaskConical, ArrowRight, User } from 'lucide-react';


interface CouncilViewProps {
  data: CouncilResponse;
  onReset: () => void;
}

export const CouncilView: React.FC<CouncilViewProps> = ({ data, onReset }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-8">

      {/* President's Report (Unified Card Style with Subtle Elevation) */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Subtle Header Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

        <div className="p-8 md:p-10 text-slate-900">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar / Icon */}
            <div className="p-3 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center shrink-0">
              <User className="text-indigo-600" size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-slate-900">Council President's Report</h2>
              <p className="text-slate-500 text-sm font-medium">Synthesized Intelligence Briefing</p>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed font-display">
            {data.key_insights}
          </div>

          {/* Next Step Integration */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-indigo-900 font-bold uppercase tracking-wide text-xs mb-1">Your Next Best Step</h4>
              <p className="text-indigo-700 font-medium">{data.next_best_step}</p>
            </div>
            <button
              onClick={onReset}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap text-sm"
            >
              Start New Session <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Immediate Safe Actions (Emerald) */}
        <div className="bg-white rounded-2xl p-7 border border-emerald-100 shadow-lg shadow-emerald-900/5 relative overflow-hidden group hover:border-emerald-200 transition-all hover:-translate-y-1 duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <div className="mb-6 flex items-center gap-4">
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Immediate & Safe</h3>
              <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest">Start Today</p>
            </div>
          </div>

          {data.recommendations?.immediate_safe?.length > 0 ? (
            <ul className="space-y-4">
              {data.recommendations.immediate_safe.map((rec, i) => (
                <li key={i} className="flex gap-4 items-start group/item">
                  <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 font-bold text-xs">
                    {i + 1}
                  </div>
                  <span className="text-slate-600 leading-relaxed group-hover/item:text-slate-900 transition-colors border-b border-dashed border-transparent group-hover/item:border-emerald-200">{rec}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-slate-400 italic text-sm mt-2">No immediate actions recommended.</p>}
        </div>

        {/* Consider (Blue) */}
        <div className="bg-white rounded-2xl p-7 border border-blue-100 shadow-lg shadow-blue-900/5 relative overflow-hidden group hover:border-blue-200 transition-all hover:-translate-y-1 duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <div className="mb-6 flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700 border border-blue-100 flex items-center justify-center">
              <FlaskConical size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                Consider / Discuss
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-sans tracking-wide">ASK YOUR DOCTOR</span>
              </h3>
              <p className="text-[11px] text-blue-700 font-bold uppercase tracking-widest">Subject to Review</p>
            </div>
          </div>

          {data.recommendations?.consider?.length > 0 ? (
            <ul className="space-y-4">
              {data.recommendations.consider.map((rec, i) => (
                <li key={i} className="flex gap-4 items-start group/item">
                  <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0 group-hover/item:scale-125 transition-transform" />
                  <span className="text-slate-600 leading-relaxed group-hover/item:text-slate-900 transition-colors">{rec}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-slate-400 italic text-sm mt-2">No items to discuss.</p>}
        </div>

        {/* Explore with Testing (Amber) */}
        <div className="bg-white rounded-2xl p-7 border border-amber-100 shadow-lg shadow-amber-900/5 relative overflow-hidden group hover:border-amber-200 transition-all hover:-translate-y-1 duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <div className="mb-6 flex items-center gap-4">
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-100 flex items-center justify-center">
              <Microscope size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Explore with Testing</h3>
              <p className="text-[11px] text-amber-700 font-bold uppercase tracking-widest">Data Required</p>
            </div>
          </div>

          {data.recommendations?.explore_with_testing?.length > 0 ? (
            <ul className="space-y-4">
              {data.recommendations.explore_with_testing.map((rec, i) => (
                <li key={i} className="flex gap-4 items-start group/item">
                  <div className="mt-2 w-2 h-2 rounded-full bg-amber-500 shrink-0 group-hover/item:scale-125 transition-transform" />
                  <span className="text-slate-600 leading-relaxed group-hover/item:text-slate-900 transition-colors">{rec}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-slate-400 italic text-sm mt-2">No further testing required.</p>}
        </div>

        {/* Avoid (Rose) */}
        <div className="bg-white rounded-2xl p-7 border border-rose-100 shadow-lg shadow-rose-900/5 relative overflow-hidden group hover:border-rose-200 transition-all hover:-translate-y-1 duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <div className="mb-6 flex items-center gap-4">
            <div className="p-2.5 bg-rose-50 rounded-lg text-rose-700 border border-rose-100 flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Avoid / Caution</h3>
              <p className="text-[11px] text-rose-700 font-bold uppercase tracking-widest">Potential Risks</p>
            </div>
          </div>

          {data.recommendations?.avoid?.length > 0 ? (
            <ul className="space-y-4">
              {data.recommendations.avoid.map((rec, i) => (
                <li key={i} className="flex gap-4 items-start group/item">
                  <div className="mt-2 w-2 h-2 rounded-full bg-rose-500 shrink-0 group-hover/item:scale-125 transition-transform" />
                  <span className="text-slate-600 leading-relaxed group-hover/item:text-slate-900 transition-colors">{rec}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-slate-400 italic text-sm mt-2">No specific cautions identified.</p>}
        </div>
      </div>

      {/* Expert Divergence */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl text-slate-600 mt-1 shadow-sm border border-slate-100">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display mb-3">Where the Experts Differ</h3>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed italic border-l-4 border-slate-300 pl-6 py-1 font-medium text-base">
              "{data.why_experts_differ}"
            </div>
          </div>
        </div>
      </div>


      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center max-w-2xl mx-auto opacity-70">
        {data.disclaimer}
      </p>
    </div>
  );
};
