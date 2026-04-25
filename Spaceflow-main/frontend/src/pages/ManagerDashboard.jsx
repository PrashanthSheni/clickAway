import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { 
  Users, Calendar, Clock, ArrowRight, CheckCircle, 
  XCircle, AlertCircle, TrendingUp, Filter, Search, Loader2, UserPlus,
  ShieldAlert, Activity, ClipboardList, MessageSquare, ShieldCheck, X, Send, Zap,
  Mail, Building, Target, Shield, ChevronRight, BarChart3, Fingerprint, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [teamBookings, setTeamBookings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [teamFeedback, setTeamFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escalatingFeedback, setEscalatingFeedback] = useState(null);
  const [managerNote, setManagerNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const loadData = async () => {
    try {
      const [b, pr, tf, tm] = await Promise.all([
        api.get("/bookings?scope=team"),
        api.get("/users/pending"),
        api.get("/feedback/?scope=team"),
        api.get("/users")
      ]);
      setTeamBookings(b.data);
      setPendingRegistrations(pr.data);
      setTeamFeedback(tf.data);
      setTeamMembers(tm.data.filter(m => m.id !== user.id));
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleApproveBooking = async (id) => {
    try { await api.post(`/bookings/${id}/approve`); toast.success("Booking approved"); loadData(); } catch (_) {}
  };
  const handleRejectBooking = async (id) => {
    try { await api.post(`/bookings/${id}/reject`); toast.success("Booking rejected"); loadData(); } catch (_) {}
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/feedback/${escalatingFeedback.id}/escalate`, { manager_note: managerNote });
      toast.success("Issue forwarded to Admin");
      setEscalatingFeedback(null);
      setManagerNote("");
      loadData();
    } catch (_) {
      toast.error("Failed to forward issue");
    }
  };

  const pending = teamBookings.filter(b => b.state === "pending");
  const active = teamBookings.filter(b => b.state === "checked_in");
  const openFeedback = teamFeedback.filter(f => f.status === "pending");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Manager Dashboard</p>
    </div>
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16 pb-20"
    >
      
      {/* ── Dashboard Header ── */}
      <motion.div variants={item} className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 pb-10 border-b-2 border-slate-100">
        <div>
           <div className="flex items-center gap-4 mb-4">
             <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Manager Overview</span>
             <div className="h-4 w-px bg-slate-200" />
             <span className="text-[11px] font-bold text-[#00bbff] uppercase tracking-[0.4em]">{user.department || "General"} Team</span>
           </div>
           <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight">Team Overview.</h1>
        </div>
        <div className="flex items-center gap-5">
           <button onClick={() => setActiveTab(activeTab === "team" ? "overview" : "team")} className={cn(
             "px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest border transition-all flex items-center gap-4 active:scale-95 shadow-sm",
             activeTab === "team" ? "bg-[#1a1f2e] text-white border-[#1a1f2e]" : "bg-[#fafaf9] text-slate-400 border-slate-200 hover:text-[#1a1f2e] hover:border-slate-400"
           )}>
              <Users size={18} /> {activeTab === "team" ? "Back to Dashboard" : `Team Directory (${teamMembers.length})`}
           </button>
           <Link to="/reports" className="bg-[#00bbff] text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#0099dd] transition-all shadow-xl flex items-center gap-4 active:scale-95">
              <TrendingUp size={18} strokeWidth={3} /> View Reports
           </Link>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {[
          { label: "Pending Approvals", value: pending.length, icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Currently Active", value: active.length, icon: Activity, color: "text-[#00bbff]", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Team Feedback", value: openFeedback.length, icon: MessageSquare, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
          { label: "Total Bookings", value: teamBookings.length, icon: BarChart3, color: "text-slate-400", bg: "bg-[#f5f5f4]", border: "border-slate-100" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#fafaf9] rounded-[3rem] p-10 border border-slate-200 hover:border-[#00bbff]/30 transition-all group shadow-sm hover:shadow-2xl">
              <div className="flex flex-col gap-8">
                <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center border transition-all group-hover:scale-110", kpi.bg, kpi.border)}>
                    <kpi.icon size={28} className={kpi.color} strokeWidth={2.5} />
                </div>
                <div>
                    <div className="text-6xl font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors tracking-tighter">{kpi.value}</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-3">{kpi.label}</div>
                </div>
              </div>
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start"
          >
            <div className="lg:col-span-2 space-y-20">
              {/* Approval Queue */}
              <div className="space-y-10">
                  <div className="flex items-center justify-between border-b-2 border-slate-50 pb-8">
                    <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em] flex items-center gap-4">
                        <ClipboardList size={20} className="text-[#00bbff]" /> Approval Queue
                    </h3>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{pending.length} Requests waiting for approval</div>
                  </div>
                  {pending.length === 0 ? (
                    <div className="bg-[#fafaf9] py-32 rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-12 shadow-inner">
                      <div className="h-20 w-20 bg-[#f5f5f4] rounded-[2rem] flex items-center justify-center mb-8">
                         <CheckCircle size={40} className="text-slate-100" />
                      </div>
                      <div className="text-3xl font-plus font-bold text-slate-300 tracking-tight">All caught up!</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {pending.map(b => (
                        <div key={b.id} className="bg-[#fafaf9] border border-slate-200 rounded-[3rem] p-8 group hover:border-[#00bbff]/40 transition-all flex flex-col sm:flex-row items-center justify-between shadow-sm hover:shadow-xl gap-8">
                            <div className="flex items-center gap-8">
                              <div className="h-20 w-20 rounded-[2rem] bg-[#f5f5f4] border border-slate-100 flex items-center justify-center font-bold text-slate-300 text-3xl group-hover:bg-[#00bbff] group-hover:text-white group-hover:border-[#00bbff] transition-all shadow-inner">
                                  {b.user_name.charAt(0)}
                              </div>
                              <div>
                                  <div className="font-bold text-[#1a1f2e] text-2xl group-hover:text-[#00bbff] transition-colors">{b.user_name}</div>
                                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3 mt-2">
                                    <Box size={16} className="text-[#00bbff]" /> {b.resource_name}
                                  </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                               <button onClick={() => handleRejectBooking(b.id)} className="h-16 w-16 rounded-2xl border border-slate-100 text-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center active:scale-95">
                                  <X size={28} />
                               </button>
                               <button onClick={() => handleApproveBooking(b.id)} className="h-16 w-16 rounded-2xl bg-[#1a1f2e] text-white hover:bg-[#00bbff] transition-all flex items-center justify-center shadow-xl active:scale-95">
                                  <CheckCircle size={28} />
                               </button>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Team Feedback */}
              <div className="space-y-10">
                  <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em] flex items-center gap-4">
                    <MessageSquare size={20} className="text-red-500" /> Team Issues & Feedback
                  </h3>
                  {openFeedback.length === 0 ? (
                    <div className="bg-[#fafaf9] py-32 rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-12 shadow-inner">
                      <div className="text-3xl font-plus font-bold text-slate-300 tracking-tight">No issues reported.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {openFeedback.map(f => (
                        <div key={f.id} className="bg-[#fafaf9] border border-slate-200 rounded-[3.5rem] p-10 flex flex-col justify-between shadow-sm hover:shadow-2xl group hover:border-red-200 transition-all relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-red-500 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                             <AlertCircle size={100} />
                          </div>
                          <div className="relative z-10">
                              <div className="flex items-center justify-between mb-8">
                                <div className="px-5 py-2 bg-red-50 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-500">{f.resource_name}</div>
                                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(f.created_at).toLocaleDateString()}</div>
                              </div>
                              <div className="text-[11px] font-bold text-[#1a1f2e] mb-4 flex items-center gap-3 uppercase tracking-widest">
                                <Users size={18} className="text-[#00bbff]" /> {f.user_name}
                              </div>
                              <p className="text-[15px] text-slate-500 italic leading-relaxed font-medium">"{f.content}"</p>
                          </div>
                          <div className="mt-10 pt-10 border-t border-slate-50 flex gap-4 relative z-10">
                              <button onClick={() => setEscalatingFeedback(f)} className="w-full flex items-center justify-center gap-4 py-5 bg-[#1a1f2e] text-white rounded-[1.5rem] text-[11px] font-bold uppercase tracking-widest hover:bg-[#00bbff] transition-all shadow-xl active:scale-95">
                                <ShieldCheck size={18} className="text-[#00bbff]" strokeWidth={3} /> Escalate to Admin
                              </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Sidebar Intel */}
            <div className="space-y-16">
              {/* Currently Active */}
              <div className="space-y-8">
                  <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em] flex items-center gap-4">
                    <Activity size={20} className="text-[#00bbff]" /> Currently Active
                  </h3>
                  <div className="bg-[#fafaf9] border border-slate-200 rounded-[3rem] p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[#1a1f2e] pointer-events-none">
                       <Target size={120} />
                    </div>
                    <div className="divide-y-2 divide-slate-50 relative z-10">
                        {active.length === 0 ? (
                          <div className="py-20 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">No active bookings</div>
                        ) : (
                          active.map(b => (
                            <div key={b.id} className="py-6 flex items-center gap-5 group hover:bg-[#f5f5f4] rounded-[1.5rem] px-5 transition-all cursor-pointer">
                              <div className="h-3 w-3 rounded-full bg-[#00bbff] animate-pulse" />
                              <div className="flex-1 min-w-0 text-[13px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-[#1a1f2e] transition-colors truncate">{b.user_name}</div>
                              <div className="text-[10px] font-bold text-slate-200 uppercase group-hover:text-[#00bbff] transition-colors">{b.resource_type}</div>
                              <ChevronRight size={18} className="text-slate-100 group-hover:text-[#00bbff] transition-all" />
                            </div>
                          ))
                        )}
                    </div>
                  </div>
              </div>

              <div className="bg-[#1a1f2e] rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group border-4 border-white shadow-black/20">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.05] text-white group-hover:scale-125 transition-transform duration-1000">
                    <Lock size={100} />
                 </div>
                 <div className="h-14 w-14 bg-[#fafaf9]/10 rounded-2xl flex items-center justify-center text-[#00bbff] mb-8 border border-white/10 shadow-inner">
                    <Shield size={24} />
                 </div>
                 <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.5em] mb-4">Manager Guidelines</h4>
                 <p className="text-slate-400 text-sm leading-relaxed font-medium">
                   All approvals and rejections are logged for audit purposes. Please ensure timely responses to keep the team moving and maintain high resource utilization.
                 </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Team Directory ── */
          <motion.div 
            key="team"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
             <div className="flex items-center justify-between border-b-2 border-slate-50 pb-10">
                <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em] flex items-center gap-4">
                   <Users size={22} className="text-[#00bbff]" /> Team Members
                </h3>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{teamMembers.length} Team members</div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                {teamMembers.map(member => (
                   <div key={member.id} className="bg-[#fafaf9] border border-slate-200 rounded-[3.5rem] p-12 group hover:border-[#00bbff]/30 transition-all shadow-sm hover:shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none text-9xl font-bold text-[#1a1f2e] group-hover:scale-110 transition-transform duration-1000">{member.name.charAt(0)}</div>
                      
                      <div className="flex items-center gap-8 mb-12 relative z-10">
                         <div className="h-20 w-20 rounded-[2rem] bg-[#f5f5f4] border border-slate-100 flex items-center justify-center font-bold text-[#00bbff] text-3xl group-hover:bg-[#00bbff] group-hover:text-white transition-all shadow-inner">
                            {member.name.charAt(0)}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-3xl font-plus font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors">{member.name}</div>
                            <div className="text-[11px] text-slate-400 uppercase tracking-[0.3em] font-bold mt-2">{member.department || "Team Member"}</div>
                         </div>
                      </div>
                      
                      <div className="space-y-8 pt-10 border-t-2 border-slate-50 relative z-10">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                               <Mail size={18} className="text-[#00bbff]" />
                               <span className="text-[13px] font-bold truncate max-w-[180px]">{member.email}</span>
                            </div>
                            <div className="text-right">
                               <span className="text-3xl font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors">{Math.round(member.reliability_score)}%</span>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.5em] font-bold text-slate-300">
                               <span>Reliability Score</span>
                            </div>
                            <div className="w-full h-3 bg-[#f5f5f4] rounded-full overflow-hidden border border-slate-100 shadow-inner">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${member.reliability_score}%` }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className="h-full bg-[#00bbff] rounded-full shadow-lg shadow-[#00bbff]/20" 
                               />
                            </div>
                         </div>
                      </div>

                      <div className="mt-12 grid grid-cols-2 gap-6 relative z-10">
                         <div className="text-center p-6 bg-[#f5f5f4] border border-slate-100 rounded-[2rem] group-hover:bg-[#fafaf9] group-hover:shadow-lg transition-all">
                            <div className="text-3xl font-bold text-[#1a1f2e]">{member.completed_count}</div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-2">Bookings</div>
                         </div>
                         <div className="text-center p-6 bg-[#f5f5f4] border border-slate-100 rounded-[2rem] group-hover:bg-[#fafaf9] group-hover:shadow-lg transition-all">
                            <div className="text-3xl font-bold text-[#1a1f2e]">{member.no_show_count}</div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-2">No-Shows</div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escalation Modal */}
      <AnimatePresence>
        {escalatingFeedback && (
          <div className="fixed inset-0 bg-[#1a1f2e]/60 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-[#fafaf9] border-4 border-white w-full max-w-2xl p-16 relative rounded-[4rem] shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-[#1a1f2e] pointer-events-none rotate-12">
                   <ShieldCheck size={200} />
                </div>
                
                <button onClick={() => setEscalatingFeedback(null)} className="absolute top-12 right-12 h-12 w-12 bg-[#f5f5f4] rounded-2xl flex items-center justify-center text-slate-300 hover:text-[#1a1f2e] transition-all border border-slate-100 hover:border-slate-200">
                   <X size={24} />
                </button>
                
                <div className="mb-12 text-center relative z-10">
                   <div className="inline-flex items-center gap-4 px-6 py-2 bg-[#00bbff]/10 border border-[#00bbff]/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#00bbff] mb-8">Escalate Issue</div>
                   <h2 className="text-5xl font-plus font-bold text-[#1a1f2e] leading-tight">Escalate to Administrator.</h2>
                   <p className="text-slate-400 text-lg mt-6 font-medium">Forward this issue to the system administrator for final resolution.</p>
                </div>

                <form onSubmit={handleEscalate} className="space-y-10 relative z-10">
                   <div className="space-y-4">
                      <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Note for Administrator</label>
                      <textarea 
                         required
                         rows={5}
                         className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/40 focus:bg-[#fafaf9] rounded-[2.5rem] px-10 py-8 text-[#1a1f2e] placeholder:text-slate-300 outline-none transition-all font-bold text-lg resize-none shadow-inner"
                         placeholder="Add details about this issue for the admin..."
                         value={managerNote}
                         onChange={e => setManagerNote(e.target.value)}
                      />
                   </div>

                   <div className="flex gap-6">
                      <button type="button" onClick={() => setEscalatingFeedback(null)} className="px-10 bg-slate-100 text-slate-400 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-200 hover:text-[#1a1f2e] transition-all active:scale-95">
                         Cancel
                      </button>
                      <button type="submit" className="flex-1 bg-[#1a1f2e] text-white h-20 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#00bbff] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4">
                         <Send size={22} strokeWidth={3} /> Forward Now
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
