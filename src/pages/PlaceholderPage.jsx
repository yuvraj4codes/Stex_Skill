import React from 'react';
import { Layers } from 'lucide-react';

export default function PlaceholderPage({ title, description, phase }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 max-w-lg mx-auto shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-6 h-6" />
        </div>
        {phase && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-indigo-400 border border-indigo-500/30 mb-3">
            {phase}
          </span>
        )}
        <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}
