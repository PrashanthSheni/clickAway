import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Loader2, ArrowLeft, Command, Shield, Zap, Target, Lock, Mail, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1 = Details, 2 = Verification
  const { login } = useAuth();
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
      toast.success("Welcome back!", { description: "You've successfully signed in." });
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    if (formData.role === "employee" && !formData.pending_manager_email) {
      toast.error("Manager email is required.");
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
      if (!res.ok) throw new Error(data.detail || "Failed to send code");

      toast.success("Verification code sent", { description: "Please check your email for the code." });
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
      if (!res.ok) throw new Error(data.detail || "Registration failed");

      toast.success("Account created!", { description: "Your manager will need to approve your account before you can sign in." });
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
    <div className="min-h-screen flex bg-white text-[#1a1f2e] font-inter selection:bg-[#00bbff]/20 selection:text-[#00bbff] overflow-hidden">
      {/* Left Panel: Brand & Vision */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#1a1f2e]">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.7, 0.6]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src="/images/solutions_hero.jpg" 
            alt="Workspace" 
            className="w-full h-full object-cover grayscale brightness-[0.4]"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f2e] via-[#1a1f2e]/40 to-transparent opacity-80" />

        <div className="relative z-10 flex flex-col justify-between p-20 w-full">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-[#00bbff]/50 transition-all backdrop-blur-md">
              <Command size={20} className="text-[#00bbff]" />
            </div>
            <span className="font-bold tracking-[0.2em] text-white uppercase text-sm">
              click<span className="text-[#00bbff]">Away</span>
            </span>
          </Link>

          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-[#00bbff] text-[10px] font-bold uppercase tracking-[0.4em] mb-6">Premium Workspace</p>
              <h1 className="font-plus text-7xl font-bold tracking-tight leading-[1.1] mb-8 text-white">
                Manage your<br />
                <span className="text-slate-400">workspace.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
                The all-in-one platform for resource booking and team collaboration. Join the modern enterprise today.
              </p>
            </motion.div>
          </div>

          <div className="flex gap-12 pt-12 border-t border-white/10">
            {[
              { val: "99.9%", label: "Reliability", icon: Target },
              { val: "Real-time", label: "Updates", icon: Zap },
              { val: "Secure", label: "Access", icon: Shield }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={12} className="text-[#00bbff]" />
                  <span className="text-2xl font-bold text-white tracking-tighter">{stat.val}</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-16 relative bg-[#f8fafc]">
        <div className="max-w-md w-full mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#00bbff] transition-all mb-12 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-12">
                <h2 className="font-plus text-5xl font-bold tracking-tight mb-4 text-[#1a1f2e]">
                  {isLogin ? "Sign In" : "Create Account"}
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {isLogin 
                    ? "Sign in to your account to manage your bookings." 
                    : "Join your team and start booking spaces today."}
                </p>
              </div>

              {isLogin ? (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00bbff] transition-colors" size={18} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00bbff]/50 rounded-xl pl-12 pr-6 py-4 text-[#1a1f2e] placeholder:text-slate-300 transition-all outline-none font-bold shadow-sm"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00bbff] transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00bbff]/50 rounded-xl pl-12 pr-6 py-4 text-[#1a1f2e] placeholder:text-slate-300 transition-all outline-none font-bold shadow-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-[#1a1f2e] text-white h-16 rounded-xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#00bbff] transition-all shadow-xl hover:shadow-[#00bbff]/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  {step === 1 ? (
                    <form onSubmit={handleRegisterStep1} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-[#1a1f2e] focus:border-[#00bbff]/50 transition-all outline-none font-bold shadow-sm placeholder:text-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Role</label>
                          <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-[#1a1f2e] focus:border-[#00bbff]/50 transition-all outline-none font-bold shadow-sm appearance-none cursor-pointer"
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-[#1a1f2e] focus:border-[#00bbff]/50 transition-all outline-none font-bold shadow-sm placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-[#1a1f2e] focus:border-[#00bbff]/50 transition-all outline-none font-bold shadow-sm placeholder:text-slate-300"
                        />
                      </div>

                      {formData.role === "employee" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-5 bg-[#00bbff]/5 border border-[#00bbff]/10 rounded-2xl space-y-4"
                        >
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#00bbff]">Manager Approval</p>
                          <div className="space-y-2">
                            <input
                              type="email"
                              required
                              placeholder="Direct Manager Email"
                              value={formData.pending_manager_email}
                              onChange={e => setFormData({ ...formData, pending_manager_email: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-[#1a1f2e] focus:border-[#00bbff]/50 transition-all outline-none text-sm font-bold shadow-sm placeholder:text-slate-300"
                            />
                          </div>
                        </motion.div>
                      )}

                      <button type="submit" disabled={loading} className="w-full bg-[#1a1f2e] text-white h-16 rounded-xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#00bbff] transition-all shadow-xl active:scale-[0.98]">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterStep2} className="space-y-8">
                      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          Verification code sent to<br />
                          <span className="text-[#00bbff] font-bold">{formData.email}</span>
                        </p>
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Verification Code</label>
                        <input
                          type="text"
                          required
                          value={formData.verification_code}
                          onChange={e => setFormData({ ...formData, verification_code: e.target.value })}
                          className="w-full bg-transparent border-b-2 border-slate-200 focus:border-[#00bbff] text-center text-5xl tracking-[0.5em] font-bold text-[#1a1f2e] outline-none pb-4 transition-all"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)} className="px-8 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-[#1a1f2e] text-white h-16 rounded-xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#00bbff] transition-all shadow-xl active:scale-[0.98]">
                          {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify Account"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Toggle Link */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
            <p className="text-xs text-slate-400 font-medium">
              {isLogin ? "New to clickAway?" : "Already have an account?"}
            </p>
            <button
              onClick={() => { setIsLogin(!isLogin); setStep(1); }}
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 hover:text-[#00bbff] transition-colors"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
