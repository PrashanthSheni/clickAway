import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";

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
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    if (formData.role === "employee" && !formData.pending_manager_email) {
      toast.error("Manager email is required for employees");
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

      toast.success("Verification code sent to your email!");
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

      toast.success("Registration successful! Your account is pending approval.");
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
    <div className="min-h-screen flex bg-[#09090B] text-white overflow-hidden">
      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="/videos/background.png" 
          alt="Modern workspace" 
          className="absolute inset-0 w-100 h-100 object-cover grayscale brightness-[0.4] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#09090B] opacity-100" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-100">
          <Link to="/" className="flex items-center gap-3">
            <img src="/videos/logo2.png" alt="Logo" className="h-10 w-auto" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-1">Enterprise</span>
          </Link>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-6">Spaceflow Identity</p>
            <h1 className="font-serif text-6xl font-light tracking-tight leading-[1.1] mb-8">
              Experience the<br />
              <em className="italic text-white/30">Intelligence.</em>
            </h1>
            <p className="text-sm text-white/30 leading-relaxed max-w-sm">
              Enter our secure ecosystem for modern workforce orchestration and intelligent space management.
            </p>
          </div>

          <div className="flex gap-12 pt-12 border-t border-white/5">
            {[["97%", "Check-in Rate"], ["3.2×", "Efficiency"], ["0", "Conflicts"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-light font-serif mb-1">{val}</div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-16 relative">
        <div className="max-w-md w-full mx-auto">
          {/* Back button */}
          <Link to="/" className="absolute top-12 left-8 lg:left-24 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Return
          </Link>

          {/* Heading */}
          <div className="mb-12">
            <h2 className="font-serif text-4xl font-light tracking-tight mb-3">
              {isLogin ? "Welcome Back" : "Join the Platform"}
            </h2>
            <p className="text-sm text-white/40">
              {isLogin 
                ? "Enter your credentials to access your dashboard." 
                : "Initialize your enterprise account to begin."}
            </p>
          </div>

          {/* Core Form Area */}
          <div className="space-y-8">
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="sf-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="sf-input"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="sf-label">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="sf-input"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={loading} className="sf-btn-primary w-full mt-4 h-12">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign In"}
                </button>
              </form>
            ) : (
              <>
                {step === 1 ? (
                  <form onSubmit={handleRegisterStep1} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="sf-label">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="sf-input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="sf-label">Enterprise Role</label>
                        <select
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                          className="sf-input appearance-none bg-[#121214]"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="sf-label">Professional Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="sf-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="sf-label">Secure Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="sf-input"
                      />
                    </div>

                    {formData.role === "employee" && (
                      <div className="p-4 bg-white/5 border border-white/5 rounded-sm space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Manager Approval Required</p>
                        <div className="space-y-1.5">
                          <label className="sf-label">Manager Email</label>
                          <input
                            type="email"
                            required
                            value={formData.pending_manager_email}
                            onChange={e => setFormData({ ...formData, pending_manager_email: e.target.value })}
                            className="sf-input"
                          />
                        </div>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="sf-btn-primary w-full mt-4 h-12">
                      {loading ? <Loader2 className="animate-spin" size={16} /> : "Continue"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterStep2} className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 text-center">
                      <p className="text-xs text-white/60 leading-relaxed">
                        Security code sent to<br />
                        <span className="text-white font-bold">{formData.email}</span>
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="sf-label text-center">Verification Code</label>
                      <input
                        type="text"
                        required
                        value={formData.verification_code}
                        onChange={e => setFormData({ ...formData, verification_code: e.target.value })}
                        className="sf-input text-center text-2xl tracking-[0.5em] font-light"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep(1)} className="sf-btn-secondary flex-1 h-12">Back</button>
                      <button type="submit" disabled={loading} className="sf-btn-primary flex-[2] h-12">
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Confirm"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* State Toggle */}
            <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
              <p className="text-xs text-white/20">
                {isLogin ? "New to Spaceflow?" : "Already initialized?"}
              </p>
              <button
                onClick={() => { setIsLogin(!isLogin); setStep(1); }}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors"
              >
                {isLogin ? "Initialize Account" : "Access Identity"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
