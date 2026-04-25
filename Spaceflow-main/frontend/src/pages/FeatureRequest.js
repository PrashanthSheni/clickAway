import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, MessageSquare, Lightbulb, Zap, Rocket, Target, Shield, ChevronRight, Loader2, Command } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export default function FeatureRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "AI & Intelligence",
    description: "",
    priority: "Medium"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mocking the save process
    setTimeout(() => {
      setLoading(false);
      toast.success("Request Received", {
        description: "Thank you! We've received your request and will review it with our product team.",
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20 max-w-5xl"
    >
      <header className="pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Feedback & Ideas</span>
        </div>
        <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">Shape the future.</h1>
        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
           Help us build the tools you need. Suggest new features or improvements to help your team work better.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
        {/* Innovation Context */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-[#1a1f2e] rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group border-4 border-white shadow-black/20">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-white group-hover:scale-125 transition-transform duration-1000">
                <Rocket size={120} />
             </div>
             <div className="h-14 w-14 bg-[#fafaf9]/10 rounded-2xl flex items-center justify-center text-[#00bbff] mb-8 border border-white/10 shadow-inner">
                <Sparkles size={24} />
             </div>
             <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.5em] mb-4">The Roadmap</h4>
             <p className="text-slate-400 text-sm leading-relaxed font-medium mb-8">
               Your input directly influences our product development. Every major feature starts with a user suggestion.
             </p>
             <div className="space-y-4">
                {[
                  { icon: MessageSquare, text: "User Driven" },
                  { icon: Lightbulb, text: "Innovation" },
                  { icon: Zap, text: "Rapid Development" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    <item.icon size={14} className="text-[#00bbff]" />
                    {item.label || item.text}
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-[#fafaf9] rounded-[2.5rem] border border-slate-200 p-8 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex items-center gap-4 mb-6">
                <Shield size={18} className="text-emerald-500" />
                <h3 className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-[0.4em]">Review Process</h3>
             </div>
             <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Our product team reviews every submission for feasibility and overall impact on the platform.
             </p>
          </div>
        </div>

        {/* Submission Terminal */}
        <div className="xl:col-span-2 bg-[#fafaf9] rounded-[4rem] border border-slate-200 p-12 xl:p-16 shadow-sm space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.01] text-[#1a1f2e] pointer-events-none font-bold text-9xl uppercase tracking-tighter">IDEAS</div>
          
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-4">Feature Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Mobile app dark mode"
                className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-2xl px-8 py-6 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-4">Category</label>
                <select 
                  className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-2xl px-8 py-6 text-[#1a1f2e] font-bold outline-none appearance-none cursor-pointer transition-all shadow-inner"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>AI & Intelligence</option>
                  <option>Physical Assets</option>
                  <option>Team Coordination</option>
                  <option>Mobile App</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-4">Impact</label>
                <select 
                  className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-2xl px-8 py-6 text-[#1a1f2e] font-bold outline-none appearance-none cursor-pointer transition-all shadow-inner"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-4">Tell us more</label>
              <textarea 
                required
                rows={5}
                placeholder="How would this feature help you or your team?"
                className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-[2.5rem] px-10 py-8 text-[#1a1f2e] font-medium outline-none transition-all shadow-inner resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1a1f2e] text-white h-24 rounded-[2rem] font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#00bbff] transition-all shadow-xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <><Send size={20} strokeWidth={3} /> Submit Request</>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
