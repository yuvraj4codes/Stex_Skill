import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, Users, MessageSquare, FolderKanban } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure Student-to-Student Platform
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
          Learn. Teach. Connect. <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Build.</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          A peer-to-peer skill exchange and collaboration ecosystem built exclusively for college and university students. Exchange practical skills freely with fellow campus students.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium rounded-xl transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <Users className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">Reciprocal Matching</h3>
            <p className="text-slate-400 text-xs">Match with students who want to learn what you teach and teach what you want.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <MessageSquare className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">Secure Messaging</h3>
            <p className="text-slate-400 text-xs">Communicate directly with accepted connections while privacy and safety remain protected.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <FolderKanban className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">Project Teams</h3>
            <p className="text-slate-400 text-xs">Discover campus project listings and apply with your specific skillset.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
