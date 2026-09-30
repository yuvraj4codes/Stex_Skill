import React from 'react';
import { GraduationCap } from 'lucide-react';
import { APP_CONFIG } from '../utils/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 text-center">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">{APP_CONFIG.name}</span>
        </div>
        <p className="text-xs text-slate-500">{APP_CONFIG.tagline}</p>
        <p className="text-[11px] text-slate-600">
          Built for college and university students. Non-monetary peer skill exchange.
        </p>
      </div>
    </footer>
  );
}
