import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/api";
import { Loader2, Building2 } from "lucide-react";

const DEMO = [
  { label: "Admin", email: "admin@company.com", password: "admin123" },
  { label: "Manager", email: "manager@company.com", password: "manager123" },
  { label: "Employee", email: "employee@company.com", password: "employee123" },
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
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "admin" ? "/admin" : from, { replace: true });
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Visual */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(15,23,42,0.95)), url('https://images.unsplash.com/photo-1641803936642-e4ce33a633bc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGJsdWUlMjBzbGF0ZSUyMHBhdHRlcm58ZW58MHx8fHwxNzc2ODM1NzM4fDA&ixlib=rb-4.1.0&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-md px-10 text-white">
          <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center mb-8">
            <Building2 size={24} />
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-blue-200 mb-3">
            Smart Resource Booking · v2
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-tight mb-4">
            Rooms, desks, and every minute — orchestrated.
          </h1>
          <p className="text-base text-slate-200/90 font-medium leading-relaxed">
            Live validation, behavioural reliability scoring, QR check-in and the smartest suggestions
            engine your office has ever met.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { k: "97%", v: "On-time check-ins" },
              { k: "3.2×", v: "Faster booking" },
              { k: "0", v: "Double-bookings" },
            ].map((s) => (
              <div key={s.v} className="border-l-2 border-blue-400 pl-3">
                <div className="text-2xl font-black tracking-tighter">{s.k}</div>
                <div className="text-[10px] uppercase tracking-widest text-blue-200/80 font-semibold">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-2">
              Sign in
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Welcome back.</h2>
            <p className="text-sm text-slate-600 mt-2">
              Use a seeded account below or your own corporate credentials.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                Email
              </label>
              <input
                type="email"
                data-testid="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                Password
              </label>
              <input
                type="password"
                data-testid="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {err && (
              <div
                data-testid="login-error"
                className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md"
              >
                {err}
              </div>
            )}

            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={busy}
              className="w-full bg-blue-600 text-white font-semibold rounded-md px-4 py-2.5 hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-8">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              Demo accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.label}
                  data-testid={`demo-login-${d.label.toLowerCase()}-btn`}
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.password);
                  }}
                  type="button"
                  className="border border-slate-200 rounded-md p-2 text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    {d.label}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 truncate">{d.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
