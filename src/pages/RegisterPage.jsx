import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';

const YEAR_OPTIONS = [
  '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgraduate', 'PhD',
];

function PasswordStrength({ password }) {
  const strength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-slate-700'}`} />
        ))}
      </div>
      <p className={`text-xs ${strength >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>{labels[strength]}</p>
    </div>
  );
}

function Field({ label, id, name, type, placeholder, value, onChange, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input id={id} name={name} type={type} autoComplete={autoComplete} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
    </div>
  );
}

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: '', email: '', college: '', course: '', yearSemester: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); setError(''); };

  const validateStep1 = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!form.email.trim()) return 'Please enter your email.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.';
    if (!form.college.trim()) return 'Please enter your college name.';
    if (!form.course.trim()) return 'Please enter your course/degree.';
    if (!form.yearSemester) return 'Please select your year.';
    return null;
  };

  const validateStep2 = () => {
    if (!form.password) return 'Please enter a password.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleNext = () => { const err = validateStep1(); if (err) { setError(err); return; } setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setLoading(true);
    const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName, college: form.college, course: form.course, yearSemester: form.yearSemester });
    setLoading(false);
    if (error) { setError(error.message || 'Registration failed. Please try again.'); } else { setSuccess(true); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check your email!</h2>
          <p className="text-slate-400 text-sm mb-6">We've sent a verification link to <span className="text-indigo-400 font-medium">{form.email}</span>. Click the link to activate your STEX account.</p>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">STEX</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{s}</div>
                  <span className={`text-xs ${step >= s ? 'text-slate-300' : 'text-slate-600'}`}>{s === 1 ? 'Student Info' : 'Security'}</span>
                </div>
                {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-indigo-600' : 'bg-slate-800'}`} />}
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{step === 1 ? 'Join STEX' : 'Secure your account'}</h1>
          <p className="text-slate-400 text-sm mb-7">{step === 1 ? 'Free for all college students. No credit card required.' : 'Choose a strong password for your account.'}</p>
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Full Name" id="reg-fullName" name="fullName" type="text" placeholder="Priya Sharma" value={form.fullName} onChange={handleChange} autoComplete="name" />
              <Field label="Email Address" id="reg-email" name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} autoComplete="email" />
              <Field label="College / University" id="reg-college" name="college" type="text" placeholder="Delhi Technological University" value={form.college} onChange={handleChange} />
              <Field label="Course / Degree" id="reg-course" name="course" type="text" placeholder="B.Tech Computer Science" value={form.course} onChange={handleChange} />
              <div>
                <label htmlFor="reg-year" className="block text-sm font-medium text-slate-300 mb-1.5">Year / Semester</label>
                <select id="reg-year" name="yearSemester" value={form.yearSemester} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm appearance-none">
                  <option value="" disabled>Select your year...</option>
                  {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button type="button" onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 mt-2">
                Continue<ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm pr-12" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <input id="reg-confirm" name="confirmPassword" type="password" autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
              </div>
              <p className="text-xs text-slate-500">By creating an account you agree to STEX's <span className="text-indigo-400">Terms of Service</span> and <span className="text-indigo-400">Privacy Policy</span>.</p>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:border-slate-600 hover:text-white transition-all">Back</button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create Account'}
                </button>
              </div>
            </form>
          )}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign In</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-600 mt-6">Learn. Teach. Connect. Build.</p>
      </div>
    </div>
  );
}
