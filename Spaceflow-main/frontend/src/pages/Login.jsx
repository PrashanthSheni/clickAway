import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/api";
import { Loader2, Zap, CheckCircle } from "lucide-react";

const DEMO = [
  { label: "Admin", email: "admin@company.com", password: "admin123", color: "#6366F1" },
  { label: "Manager", email: "manager@company.com", password: "manager123", color: "#10B981" },
  { label: "Employee", email: "employee@company.com", password: "employee123", color: "#F59E0B" },
];

const FEATURES = [
  "AI-powered booking prioritization",
  "QR code check-in system",
  "Behavioural reliability scoring",
  "Real-time availability calendar",
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "admin" ? "/admin" : from, { replace: true });
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#F0F2F5]">

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F172A] overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366F1, transparent)" }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #10B981, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #6366F1, transparent)" }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-extrabold tracking-tight text-lg leading-none">clickAway</div>
            <div className="text-indigo-400 text-[10px] font-semibold uppercase tracking-widest">Resource Suite</div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">Next-gen workplace</div>
          <h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Every space.<br />Every second.<br />
            <span className="text-indigo-400">Orchestrated.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            The intelligent booking platform for modern teams. Live availability, AI prioritization, and zero double-bookings.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-indigo-600/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={11} className="text-indigo-400" />
                </div>
                <span className="text-sm text-slate-300 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
          {[["97%", "On-time checkins"], ["3.2×", "Faster booking"], ["0", "Double-bookings"]].map(([k, v]) => (
            <div key={v}>
              <div className="text-2xl font-black text-white tracking-tight">{k}</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-400/80 font-semibold mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-gray-900">clickAway</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-2">Sign in to manage your bookings</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} data-testid="login-form" className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                data-testid="login-email-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password</label>
              <input
                type="password"
                data-testid="login-password-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div data-testid="login-error" className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <span className="font-bold">Error:</span> {err}
              </div>
            )}

            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 shadow-sm text-sm mt-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 text-center">
              Quick demo access
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO.map(d => (
                <button
                  key={d.label}
                  data-testid={`demo-login-${d.label.toLowerCase()}-btn`}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.password); }}
                  className="group border-2 border-gray-200 hover:border-indigo-300 bg-white rounded-xl p-3 text-left transition-all hover:shadow-sm"
                >
                  <div className="w-6 h-6 rounded-md mb-2 flex items-center justify-center"
                    style={{ backgroundColor: d.color + "20" }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{d.label}</div>
                  <div className="text-[10px] font-semibold text-gray-700 truncate group-hover:text-indigo-700 transition-colors">
                    {d.email.split("@")[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
