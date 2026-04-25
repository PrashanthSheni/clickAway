import React from "react";
import { useAuth } from "../context/AuthContext";
import { Gauge, CheckCircle2, XCircle, Ban, User, Mail, Building2, ShieldCheck, Activity, Target, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export default function EmployeeProfile() {
  const { user } = useAuth();
  if (!user) return null;
  const score = user.reliability_score;
  const scoreColor = score >= 85 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-red-500";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 max-w-5xl pb-20"
    >
      <header className="pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Profile</span>
        </div>
        <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">{user.name}.</h1>
        <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
           <span className="flex items-center gap-3"><Mail size={16} className="text-[#00bbff]" /> {user.email}</span>
           <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
           <span className="flex items-center gap-3"><Building2 size={16} className="text-slate-300" /> {user.department}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
        {/* Reliability Gauge */}
        <div className="xl:col-span-1 bg-[#1a1f2e] rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group border-4 border-white shadow-black/20">
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] text-white group-hover:scale-110 transition-transform duration-1000">
             <ShieldCheck size={120} />
          </div>
          <div className="flex items-center gap-4 mb-12 relative z-10">
             <Gauge size={20} className="text-[#00bbff]" />
             <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.4em]">Reliability Score</h3>
          </div>
          <div className="relative z-10 mb-10">
             <div className={cn("text-8xl font-bold tracking-tighter mb-4 font-plus", scoreColor)}>{Math.round(score)}</div>
             <div className="w-full h-2.5 bg-[#fafaf9]/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${score}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className={cn("h-full shadow-lg", score >= 85 ? "bg-emerald-500 shadow-emerald-500/40" : score >= 70 ? "bg-amber-500 shadow-amber-500/40" : "bg-red-500 shadow-red-500/40")}
                />
             </div>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed relative z-10">
            High reliability scores grant you instant access to executive meeting rooms and creative studios.
          </p>
        </div>

        {/* Stats Matrix */}
        <div className="xl:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Completed Bookings", value: user.completed_count, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "No-Shows", value: user.no_show_count, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
              { label: "Cancelled Bookings", value: user.cancelled_count, icon: Ban, color: "text-amber-500", bg: "bg-amber-50" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#fafaf9] rounded-[2.5rem] p-8 border border-slate-200 group hover:border-[#00bbff]/30 transition-all shadow-sm hover:shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border transition-all group-hover:rotate-12", stat.bg, stat.color === "text-emerald-500" ? "border-emerald-100" : stat.color === "text-red-500" ? "border-red-100" : "border-amber-100")}>
                    <stat.icon size={22} />
                  </div>
                  <ChevronRight size={18} className="text-slate-100 group-hover:text-slate-300 transition-colors" />
                </div>
                <div className="text-5xl font-bold text-[#1a1f2e] tracking-tighter mb-2">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#fafaf9] rounded-[3.5rem] border border-slate-200 p-12 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-[#1a1f2e] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <Sparkles size={160} />
             </div>
             <div className="flex items-center gap-4 mb-10">
                <Target size={20} className="text-[#00bbff]" />
                <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">How your score works</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   {[
                     "Your score starts at 100 points.",
                     "Maintain your score by checking in to your bookings on time.",
                     "No-shows will significantly lower your reliability score."
                   ].map((t, i) => (
                     <div key={i} className="flex gap-5 text-sm font-medium text-slate-500 leading-relaxed">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00bbff] mt-2 shrink-0" />
                        {t}
                     </div>
                   ))}
                </div>
                <div className="space-y-6">
                   {[
                     "Score 85+: You get instant access to premium resources.",
                     "Score < 70: Your bookings may require manual manager approval.",
                     "Complete future bookings on time to improve your score."
                   ].map((t, i) => (
                     <div key={i} className="flex gap-5 text-sm font-bold text-[#1a1f2e] leading-relaxed">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00bbff] mt-2 shrink-0" />
                        {t}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
