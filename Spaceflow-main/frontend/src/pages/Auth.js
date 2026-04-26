import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Loader2, ArrowLeft, ShieldCheck, Mail, Lock, User, Globe, Moon, Sun } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    pending_manager_name: "",
    pending_manager_email: "",
    verification_code: ""
  });
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Identity Verified");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    if (formData.role === "employee" && !formData.pending_manager_email) {
      toast.error("Managerial context required for subordinates");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification dispatch failed");

      toast.success("Security code dispatched");
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration initialization failed");

      toast.success("Identity initialized. Awaiting governance approval.");
      setIsLogin(true);
      setStep(1);
    } catch (err) {
      toast.error(err.message);
      if (err.message.includes("No manager found")) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/20">

      {/* ── Left Narrative Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-black">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          style={{ filter: theme === 'dark' ? 'brightness(0.6)' : 'brightness(0.8)' }}
        >
          <source src="/videos/product.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/videos/logofinall.png" alt="clickAway" className="h-14 w-14 object-contain shadow-lg transition-transform group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">click<span className="text-primary">A</span>way</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 leading-none">Intelligence Ecosystem</span>
            </div>
          </Link>

          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tight text-white leading-none">
                Experience the<br />
                <span className="italic text-white/30 font-light font-serif">Intelligence.</span>
              </h2>
              <p className="text-white/40 font-medium max-w-sm leading-relaxed">
                Securely authenticate to access your organization's workspace governance terminal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/5">
              {[
                { val: "256-bit", label: "Encryption" },
                { val: "SSO", label: "Readiness" },
                { val: "ISO", label: "Compliant" },
                { val: "MFA", label: "Standard" }
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-serif italic text-white/50">{stat.val}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/20">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col relative">
        {/* Top actions */}
        <div className="absolute top-8 left-8 lg:left-12 right-12 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Public Domain
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
          <div className="w-full max-w-md space-y-12">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">
                {isLogin ? "Authenticate Identity" : "Initialize Account"}
              </h1>
              <p className="text-muted-foreground font-medium text-sm">
                {isLogin
                  ? "Access your specialized workspace terminal."
                  : "Begin the governance onboarding process."}
              </p>
            </div>

            {/* Form Area */}
            <div className="space-y-10">
              {isLogin ? (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="sf-label">Corporate Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="sf-input pl-12"
                          placeholder="name@organization.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pr-1">
                        <label className="sf-label">Security Password</label>
                        <a href="#" className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest">Forgot?</a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="sf-input pl-12"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="sf-btn-primary w-full py-4 text-base shadow-xl shadow-primary/20">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"}
                  </button>
                </form>
              ) : (
                <>
                  {step === 1 ? (
                    <form onSubmit={handleRegisterStep1} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="sf-label">Full Name</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="sf-input"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="sf-label">Platform Role</label>
                          <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="sf-input appearance-none"
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="sf-label">Professional Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="sf-input"
                          placeholder="name@organization.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="sf-label">Platform Password</label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="sf-input"
                          placeholder="Min. 12 characters"
                        />
                      </div>

                      {formData.role === "employee" && (
                        <div className="p-5 bg-accent/30 border border-border/40 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Governance Context</span>
                          </div>
                          <div className="space-y-2">
                            <label className="sf-label">Managerial Identity (Email)</label>
                            <input
                              type="email"
                              required
                              value={formData.pending_manager_email}
                              onChange={e => setFormData({ ...formData, pending_manager_email: e.target.value })}
                              className="sf-input bg-background"
                              placeholder="manager@organization.com"
                            />
                          </div>
                        </div>
                      )}

                      <button type="submit" disabled={loading} className="sf-btn-primary w-full py-4 text-base">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Continue Initialization"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterStep2} className="space-y-8">
                      <div className="p-8 bg-accent/30 border border-border/40 rounded-3xl text-center space-y-3">
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                          Security code dispatched to<br />
                          <span className="text-foreground font-bold">{formData.email}</span>
                        </p>
                      </div>
                      <div className="space-y-4">
                        <label className="sf-label text-center block">6-Digit Verification Terminal</label>
                        <input
                          type="text"
                          required
                          value={formData.verification_code}
                          onChange={e => setFormData({ ...formData, verification_code: e.target.value })}
                          className="sf-input text-center text-4xl tracking-[0.4em] font-light py-6"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)} className="sf-btn-secondary flex-1 py-4">Back</button>
                        <button type="submit" disabled={loading} className="sf-btn-primary flex-[2] py-4">
                          {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Identity"}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* Toggle State */}
              <div className="pt-10 border-t border-border/40 flex flex-col items-center gap-6">
                <p className="text-xs text-muted-foreground font-medium">
                  {isLogin ? "New to the platform?" : "Already possess an identity?"}
                </p>
                <button
                  onClick={() => { setIsLogin(!isLogin); setStep(1); }}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-primary transition-all underline decoration-border underline-offset-8 decoration-2"
                >
                  {isLogin ? "Create New Profile" : "Verify Existing Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
