
import React from 'react';
import { CouncilResponse } from '../types';
import { ShieldCheck, Info, Microscope, AlertTriangle, FileText, FlaskConical, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Cards';

interface CouncilViewProps {
  data: CouncilResponse;
  onReset: () => void;
}

export const CouncilView: React.FC<CouncilViewProps> = ({ data, onReset }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header Summary */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <Users className="text-indigo-300" /> Council President's Report
        </h2>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Key Strategic Insight</h3>
          <p className="text-lg leading-relaxed">{data.key_insights}</p>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Immediate Safe Actions */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader
            title="Immediate & Safe"
            subtitle="Consensus approved actions to start today"
            icon={<ShieldCheck className="text-emerald-500" size={24} />}
          />
          <CardContent>
            {data.recommendations?.immediate_safe?.length > 0 ? (
              <ul className="space-y-3">
                {data.recommendations.immediate_safe.map((rec, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-400 italic">No immediate actions recommended.</p>}
          </CardContent>
        </Card>

        {/* Consider */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader
            title="Consider / Discuss"
            subtitle="Topics to research or ask your doctor"
            icon={<FlaskConical className="text-blue-500" size={24} />}
          />
          <CardContent>
            {data.recommendations?.consider?.length > 0 ? (
              <ul className="space-y-3">
                {data.recommendations.consider.map((rec, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-400 italic">No items to discuss.</p>}
          </CardContent>
        </Card>

        {/* Explore with Testing */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader
            title="Explore with Testing"
            subtitle="Requires data before action"
            icon={<Microscope className="text-amber-500" size={24} />}
          />
          <CardContent>
            {data.recommendations?.explore_with_testing?.length > 0 ? (
              <ul className="space-y-3">
                {data.recommendations.explore_with_testing.map((rec, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-400 italic">No further testing required.</p>}
          </CardContent>
        </Card>

        {/* Avoid */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader
            title="Avoid / Caution"
            subtitle="Potential interactions or unnecessary steps"
            icon={<AlertTriangle className="text-red-500" size={24} />}
          />
          <CardContent>
            {data.recommendations?.avoid?.length > 0 ? (
              <ul className="space-y-3">
                {data.recommendations.avoid.map((rec, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-400 italic">No specific cautions identified.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Expert Divergence */}
      <Card>
        <CardHeader title="Why the Experts Differ" icon={<Users className="text-slate-400" />} />
        <CardContent>
          <p className="text-slate-600 leading-relaxed italic border-l-4 border-slate-200 pl-4">
            "{data.why_experts_differ}"
          </p>
        </CardContent>
      </Card>

      {/* Next Step */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-indigo-900 font-bold uppercase tracking-wide text-sm mb-1">Your Next Best Step</h4>
          <p className="text-indigo-800 text-lg font-medium">{data.next_best_step}</p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors flex items-center gap-2"
        >
          Start New Session <ArrowRight size={16} />
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center max-w-2xl mx-auto pt-8">
        {data.disclaimer}
      </p>
    </div>
  );
};
