import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Loader2, ArrowLeft, ShieldCheck, Mail, Lock, User, Command, Sun, Moon } from "lucide-react";

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
    <div className="min-h-screen flex bg-white animate-fade-in" style={{ animationDuration: '800ms' }}>

      {/* ── Left Narrative Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#1e2329]">
        <div className="absolute inset-0 z-0">
           <img
              src="/videos/camera.jpeg"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
              alt=""
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#171a21]/90 to-[#1e2329]/60" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <Link to="/" className="flex items-center gap-3 w-max">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/5">
               <Command className="text-primary w-5 h-5" />
            </div>
            <span className="font-bold text-xs tracking-[0.2em] uppercase text-white">clickAway</span>
          </Link>

          <div className="space-y-8">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Premium Workspace</div>
            <h2 className="text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Manage your<br />workspace.
            </h2>
            <p className="text-white/60 font-medium max-w-sm leading-relaxed text-sm">
              The all-in-one platform for resource booking and team collaboration. Join the modern enterprise today.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-semibold text-white/50">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> 99.9% Uptime</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Real-time Updates</div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Secure Access</div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col relative items-center justify-center transition-colors duration-700 bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] dark:from-[#121212] dark:via-[#0a0a0a] dark:to-[#050505]">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="absolute top-8 right-8 p-3 rounded-xl backdrop-blur-md shadow-sm transition-all duration-500 bg-white/50 border border-slate-200 text-slate-500 hover:text-slate-900 dark:bg-white/10 dark:border-white/10 dark:text-white/60 dark:hover:text-white"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="w-full max-w-sm space-y-10 px-8 relative z-10">
          
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors w-max text-slate-500 hover:text-slate-900 dark:text-white/40 dark:hover:text-white">
            <ArrowLeft size={14} />
            Go Back
          </Link>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight transition-colors duration-500 text-slate-900 dark:text-white">
              {isLogin ? "Sign In" : "Create Account"}
            </h1>
            <p className="font-medium text-sm transition-colors duration-500 text-slate-600 dark:text-white/60">
              {isLogin
                ? "Sign in to your account to manage your bookings."
                : "Create a new profile to access the platform."}
            </p>
          </div>

          {/* Form Area */}
          <div className="space-y-8">
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 text-slate-500 dark:text-white/40">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 text-slate-400 dark:text-white/40" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="sf-input pl-12"
                        placeholder="demo1@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pr-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 text-slate-500 dark:text-white/40">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 text-slate-400 dark:text-white/40" />
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
                <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] rounded-xl py-4 text-sm font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-[#38bdf8] transition-all flex justify-center items-center text-white dark:text-black">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "SIGN IN"}
                </button>
              </form>
            ) : (
              <>
                {step === 1 ? (
                  <form onSubmit={handleRegisterStep1} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 text-slate-500 dark:text-white/40">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 text-slate-400 dark:text-white/40" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="sf-input pl-12"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 text-slate-500 dark:text-white/40">Platform Role</label>
                      <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        className="sf-input appearance-none cursor-pointer"
                      >
                        <option value="employee" className="bg-background text-foreground">Employee</option>
                        <option value="manager" className="bg-background text-foreground">Manager</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 text-slate-500 dark:text-white/40">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 text-slate-400 dark:text-white/40" />
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
                      <label className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 text-slate-500 dark:text-white/40">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 text-slate-400 dark:text-white/40" />
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="sf-input pl-12"
                          placeholder="Min. 12 characters"
                        />
                      </div>
                    </div>

                    {formData.role === "employee" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 text-slate-500 dark:text-white/40">Manager Email (Required)</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 text-slate-400 dark:text-white/40" />
                          <input
                            type="email"
                            required
                            value={formData.pending_manager_email}
                            onChange={e => setFormData({ ...formData, pending_manager_email: e.target.value })}
                            className="sf-input pl-12"
                            placeholder="manager@organization.com"
                          />
                        </div>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-[#0ea5e9] rounded-xl py-4 text-sm font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-[#38bdf8] transition-all flex justify-center items-center text-white dark:text-black">
                      {loading ? <Loader2 className="animate-spin" size={20} /> : "CONTINUE"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterStep2} className="space-y-8">
                    <div className="p-8 rounded-2xl text-center space-y-2 transition-colors duration-500 bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
                      <p className="text-sm font-medium leading-relaxed transition-colors duration-500 text-slate-600 dark:text-white/60">
                        Security code dispatched to<br />
                        <span className="font-bold transition-colors duration-500 text-slate-900 dark:text-white">{formData.email}</span>
                      </p>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-center block transition-colors duration-500 text-slate-500 dark:text-white/40">6-Digit Verification Code</label>
                      <input
                        type="text"
                        required
                        value={formData.verification_code}
                        onChange={e => setFormData({ ...formData, verification_code: e.target.value })}
                        className="sf-input text-center text-3xl tracking-[0.4em] font-black h-20"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 bg-transparent rounded-xl py-4 text-sm font-bold transition-all border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/20 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white">
                        BACK
                      </button>
                      <button type="submit" disabled={loading} className="flex-[2] bg-[#0ea5e9] rounded-xl py-4 text-sm font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-[#38bdf8] transition-all flex justify-center items-center text-white dark:text-black">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "CONFIRM"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Toggle State */}
            <div className="pt-8 flex justify-center items-center gap-2">
              <span className="text-xs font-medium transition-colors duration-500 text-slate-600 dark:text-white/60">
                {isLogin ? "New to clickAway?" : "Already have an account?"}
              </span>
              <button
                onClick={() => { setIsLogin(!isLogin); setStep(1); }}
                className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary dark:hover:text-primary text-slate-900 dark:text-white"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
