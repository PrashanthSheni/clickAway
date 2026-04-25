import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { CheckCircle2, XCircle, Loader2, Sparkles, AlertTriangle, Clock, User, Shield, ChevronRight, Activity, Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const PRIORITY_CONFIG = {
  1: { label: "High Priority",   cls: "bg-red-50 text-red-500 border border-red-100",    icon: AlertTriangle, dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" },
  2: { label: "Medium Priority", cls: "bg-amber-50 text-amber-500 border border-amber-100", icon: Clock,         dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" },
  3: { label: "Low Priority",    cls: "bg-[#f5f5f4] text-slate-400 border border-slate-100",   icon: null,          dot: "bg-slate-300" },
};

export default function ApprovalQueue() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/bookings/approvals");
      setItems(data);
    } catch (_) {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => { load(); }, []);

  const doAction = async (id, action) => {
    setBusyId(id);
    try {
      await api.post(`/bookings/${id}/${action}`, { note: notes[id] || "" });
      toast.success(action === "approve" ? "✓ Booking approved" : "Booking rejected");
      setNotes((prev) => ({ ...prev, [id]: "" }));
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handlePrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const { data } = await api.post("/bookings/prioritize");
      setItems(data);
      toast.success("Priority sorted successfully");
    } catch (e) {
      toast.error("Failed to sort requests");
    } finally {
      setIsPrioritizing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20"
    >
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-10 border-b-2 border-slate-100">
        <div>
           <div className="flex items-center gap-4 mb-4">
             <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Approvals</span>
           </div>
           <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">Pending Requests.</h1>
           <p className="text-slate-400 text-xl font-medium mt-6">
             You have {items.length} {items.length === 1 ? "request" : "requests"} waiting for your approval.
           </p>
        </div>
        
        {items.length > 1 && (
          <button
            onClick={handlePrioritize}
            disabled={isPrioritizing}
            className="bg-[#1a1f2e] text-white h-20 px-12 rounded-[2rem] font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#00bbff] transition-all shadow-2xl hover:shadow-[#00bbff]/30 flex items-center gap-4 active:scale-95 disabled:opacity-20"
          >
            {isPrioritizing ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} strokeWidth={3} />}
            Auto-Prioritize
          </button>
        )}
      </header>

      {/* Legend & Stats */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-10 bg-[#fafaf9] p-6 rounded-[2rem] border border-slate-200 shadow-sm w-fit">
           <div className="flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-[#00bbff]" />
              <span className="text-[10px] font-bold text-[#1a1f2e] uppercase tracking-widest">Priority Levels:</span>
           </div>
           <div className="flex items-center gap-8">
              {[1,2,3].map(p => {
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <div key={p} className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cfg.label.split(" ")[0]}</span>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="bg-[#fafaf9] rounded-[4rem] p-32 text-center border-2 border-dashed border-slate-100 flex flex-col items-center shadow-inner">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-10 border border-emerald-100 shadow-sm">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <div className="text-4xl font-plus font-bold text-slate-300 tracking-tight">All Caught Up!</div>
          <p className="text-slate-400 text-sm mt-6 font-medium max-w-sm">There are no pending booking requests to review at this time.</p>
        </div>
      )}

      {/* Queue Matrix */}
      <div className="grid grid-cols-1 gap-8">
        {items.map((b, i) => {
          const priorityCfg = b.ai_priority ? PRIORITY_CONFIG[b.ai_priority] : null;
          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={b.id}
              className={cn(
                "bg-[#fafaf9] border-2 rounded-[3.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500",
                b.ai_priority === 1 ? "border-red-100 hover:border-red-200" : b.ai_priority === 2 ? "border-amber-100 hover:border-amber-200" : "border-slate-50"
              )}
            >
              <div className="p-10 xl:p-12">
                <div className="flex flex-col xl:flex-row items-start justify-between gap-10 mb-12">
                  <div className="flex items-start gap-8 flex-1">
                    <div className="h-20 w-20 rounded-[1.75rem] bg-[#1a1f2e] text-white text-2xl font-bold flex items-center justify-center shrink-0 shadow-2xl shadow-black/20 group-hover:rotate-6 transition-transform">
                      {b.user_name?.charAt(0)}
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <Link to={`/bookings/${b.id}`} className="text-3xl font-plus font-bold text-[#1a1f2e] hover:text-[#00bbff] transition-colors tracking-tight underline decoration-slate-100 underline-offset-8 decoration-2 hover:decoration-[#00bbff]/30">
                           {b.resource_name}
                        </Link>
                        {priorityCfg && (
                          <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm", priorityCfg.cls)}>
                            {priorityCfg.label}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-8">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                           <User size={14} className="text-[#00bbff]" /> {b.user_name}
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-100" />
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                           <Clock size={14} className="text-slate-300" />
                           {new Date(b.start_time).toLocaleDateString()} · {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      
                      {b.notes && (
                        <div className="p-6 bg-[#f5f5f4] border border-slate-100 rounded-[2rem] text-sm text-slate-500 font-medium italic leading-relaxed shadow-inner">
                           "{b.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                     <BookingStateBadge state={b.state} />
                  </div>
                </div>

                {/* Response Interface */}
                <div className="flex flex-col xl:flex-row gap-6 pt-10 border-t-2 border-slate-50">
                  <div className="flex-1 relative group/input">
                    <MessageSquare size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/input:text-[#00bbff] transition-colors" />
                    <input
                      placeholder="Add a note for the user (optional)..."
                      value={notes[b.id] || ""}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                      className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/30 rounded-2xl pl-14 pr-8 py-5 text-sm font-medium outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => doAction(b.id, "approve")}
                      disabled={busyId === b.id}
                      className="bg-[#1a1f2e] text-white h-18 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center gap-4 disabled:opacity-20 whitespace-nowrap"
                    >
                      {busyId === b.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Approve
                    </button>
                    <button
                      onClick={() => doAction(b.id, "reject")}
                      disabled={busyId === b.id}
                      className="bg-[#fafaf9] text-slate-400 border-2 border-slate-100 h-18 px-10 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:text-red-500 hover:border-red-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
