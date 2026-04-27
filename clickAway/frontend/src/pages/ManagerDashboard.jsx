import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { 
  Users, Calendar, Clock, ArrowRight, CheckCircle, 
  XCircle, AlertCircle, TrendingUp, Filter, Search, Loader2, UserPlus,
  ShieldAlert, Activity, ClipboardList, MessageSquare, ShieldCheck, X, Send, Zap,
  Mail, Building, Shield, ArrowUpRight, BarChart, Lock
} from "lucide-react";
import { toast } from "sonner";

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
    try { await api.post(`/bookings/${id}/approve`); toast.success("Authorization granted"); loadData(); } catch (_) {}
  };
  const handleRejectBooking = async (id) => {
    try { await api.post(`/bookings/${id}/reject`); toast.success("Request declined"); loadData(); } catch (_) {}
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/feedback/${escalatingFeedback.id}/escalate`, { manager_note: managerNote });
      toast.success("Intelligence report escalated to administration");
      setEscalatingFeedback(null);
      setManagerNote("");
      loadData();
    } catch (_) {
      toast.error("Escalation failed");
    }
  };

  const pending = teamBookings.filter(b => b.state === "pending");
  const active = teamBookings.filter(b => b.state === "checked_in");
  const openFeedback = teamFeedback.filter(f => f.status === "pending");

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin w-12 h-12 text-primary/20" />
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in-up">
      
      {/* ── Governance Control Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
             <div className="sf-badge !bg-primary/10 !text-primary !border-primary/20">Governance Node</div>
             <span className="text-muted-foreground/30 font-black tracking-widest text-[10px]">//</span>
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unit: {user.department || "Operations"}</span>
           </div>
           <h1 className="text-5xl font-black tracking-tight">Management Console</h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setActiveTab("team")} className="sf-btn-secondary px-6 py-3 text-[10px] uppercase tracking-widest">
              <Users size={14} /> Team Roster ({teamMembers.length})
           </button>
           <Link to="/admin/reports" className="sf-btn-primary px-6 py-3 text-[10px] uppercase tracking-widest shadow-xl shadow-primary/10">
              <TrendingUp size={14} /> Performance Intelligence
           </Link>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center gap-1 bg-accent/40 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-border/40">
         {["overview", "team"].map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 ${
               activeTab === tab ? "bg-background text-primary shadow-lg border border-border/50" : "text-muted-foreground hover:text-foreground"
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Intelligence KPI Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Authorizations", value: pending.length, icon: Shield, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Active Sessions", value: active.length, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Conflict Reports", value: openFeedback.length, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
              { label: "Network Volume", value: teamBookings.length, icon: BarChart, color: "text-primary", bg: "bg-primary/10" },
            ].map(kpi => (
              <div key={kpi.label} className="sf-card p-8 border-l-[6px] transition-all hover:border-l-primary" style={{ borderLeftColor: `hsl(var(--primary))` }}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="text-4xl font-serif italic text-foreground leading-none">{kpi.value}</div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pt-1">{kpi.label}</div>
                    </div>
                    <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} border border-white/5 shadow-inner`}>
                        <kpi.icon size={24} />
                    </div>
                  </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4">
            <div className="lg:col-span-2 space-y-12">
              {/* Authorizations Queue */}
              <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" /> Authorization Queue
                    </h3>
                  </div>
                  {pending.length === 0 ? (
                    <div className="sf-card h-[250px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-sf-bg-soft/40">
                      <div className="h-14 w-14 bg-accent/50 rounded-2xl flex items-center justify-center mb-4 text-muted-foreground/30">
                        <ShieldCheck size={28} />
                      </div>
                      <div className="font-bold text-lg">Queue Clear</div>
                      <p className="text-xs text-muted-foreground font-medium">All team requests have been processed.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pending.map(b => (
                        <div key={b.id} className="sf-card p-6 group transition-all hover:border-primary/40 bg-sf-bg-soft/20 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xl">
                                    {b.user_name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <div className="font-bold text-foreground text-lg">{b.user_name}</div>
                                    <div className="text-[10px] font-black text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                                      <Building size={12} className="text-muted-foreground/40" /> {b.resource_name}
                                    </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button onClick={() => handleRejectBooking(b.id)} className="h-12 w-12 rounded-xl border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 transition-all flex items-center justify-center shadow-inner">
                                    <X size={18} />
                                </button>
                                <button onClick={() => handleApproveBooking(b.id)} className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center">
                                    <CheckCircle size={18} />
                                </button>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Conflict Reports */}
              <div className="space-y-8">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <MessageSquare size={14} className="text-red-500" /> Infrastructure Discrepancies
                  </h3>
                  {openFeedback.length === 0 ? (
                    <div className="sf-card h-[250px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-sf-bg-soft/40">
                      <div className="h-14 w-14 bg-accent/50 rounded-2xl flex items-center justify-center mb-4 text-muted-foreground/30">
                        <Lock size={28} />
                      </div>
                      <div className="font-bold text-lg">No Active Discrepancies</div>
                      <p className="text-xs text-muted-foreground font-medium">System reports indicate optimal operation.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {openFeedback.map(f => (
                        <div key={f.id} className="sf-card p-8 flex flex-col justify-between relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                            <ShieldAlert size={100} />
                          </div>
                          <div className="relative z-10 space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="sf-badge !bg-red-500/10 !text-red-500 !border-red-500/20">{f.resource_name}</div>
                                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{new Date(f.created_at).toLocaleDateString()}</div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                                  <Users size={14} className="text-muted-foreground/40" /> {f.user_name}
                                </div>
                                <p className="text-sm text-muted-foreground italic font-medium leading-relaxed">"{f.content}"</p>
                              </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-border/40 relative z-10">
                              <button onClick={() => setEscalatingFeedback(f)} className="w-full flex items-center justify-center gap-3 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-xl">
                                <ShieldCheck size={16} /> Escalate to Governance
                              </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-10">
              {/* Real-time Presence */}
              <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                    <Activity size={14} className="text-emerald-500" /> Team Presence
                  </h3>
                  <div className="sf-card overflow-hidden bg-sf-bg-soft/40 backdrop-blur-xl">
                    <div className="divide-y divide-border/20">
                        {active.length === 0 ? (
                          <div className="p-12 text-center">
                             <div className="text-xs text-muted-foreground font-medium italic">No active sessions detected.</div>
                          </div>
                        ) : (
                          active.map(b => (
                            <div key={b.id} className="p-5 flex items-center gap-4 group hover:bg-accent/40 transition-all">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                              <div className="flex-1 min-w-0 text-sm font-bold text-foreground truncate">{b.user_name}</div>
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{b.resource_name}</div>
                            </div>
                          ))
                        )}
                    </div>
                  </div>
              </div>

              {/* System Intelligence Card */}
              <div className="sf-card p-10 bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
                 <Zap className="w-10 h-10 mb-6 opacity-20" />
                 <h4 className="text-lg font-bold tracking-tight mb-3">Optimization Logic</h4>
                 <p className="text-sm text-primary-foreground/70 font-medium leading-relaxed">
                   "Team-wide resource utilization has increased by 14% this interval. Consider adjusting occupancy thresholds."
                 </p>
                 <div className="mt-8 flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">AI Engine v2.4</span>
                 </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── Team Management Roster ── */
        <div className="space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                 <Users size={14} className="text-primary" /> Personnel Registry
              </h3>
              <div className="text-xs text-muted-foreground font-medium italic">{teamMembers.length} active nodes under your jurisdiction.</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {teamMembers.map(member => (
                <div key={member.id} className="sf-card p-8 group hover:border-primary/30 transition-all bg-sf-bg-soft/20">
                   <div className="flex items-center gap-5 mb-8">
                      <div className="h-16 w-16 rounded-2xl bg-accent border border-border/60 flex items-center justify-center font-bold text-foreground text-2xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
                         {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                         <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors truncate">{member.name}</div>
                         <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{member.department || "Operations"}</div>
                      </div>
                   </div>
                   
                   <div className="space-y-4 pt-6 border-t border-border/40">
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                         <div className="flex items-center gap-2">
                            <Mail size={12} className="opacity-40" />
                            <span className="truncate max-w-[150px]">{member.email}</span>
                         </div>
                         <span className="font-black text-foreground">{Math.round(member.reliability_score)}% INDEX</span>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <span>RELIABILITY COEFFICIENT</span>
                         </div>
                         <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${member.reliability_score}%` }} />
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-accent/40 rounded-2xl border border-border/20">
                         <div className="text-lg font-serif italic text-foreground">{member.completed_count}</div>
                         <div className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">Sessions</div>
                      </div>
                      <div className="text-center p-4 bg-accent/40 rounded-2xl border border-border/20">
                         <div className="text-lg font-serif italic text-foreground">{member.no_show_count}</div>
                         <div className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">Deficit</div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* ── Governance Escalation Modal ── */}
      {escalatingFeedback && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
           <div className="sf-card w-full max-w-lg p-10 relative shadow-2xl animate-fade-in-up">
              <button onClick={() => setEscalatingFeedback(null)} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-xl transition-all">
                 <X size={20} />
              </button>
              
              <div className="mb-10 space-y-4">
                 <div className="sf-badge !bg-foreground !text-background !border-foreground/20">Governance Escalation</div>
                 <h2 className="text-3xl font-bold tracking-tight">Admin Dispatch</h2>
              </div>

              <form onSubmit={handleEscalate} className="space-y-8">
                 <div className="space-y-3">
                    <label className="sf-label text-muted-foreground">Managerial Justification</label>
                    <textarea 
                       required
                       rows={5}
                       className="sf-input py-4 resize-none"
                       placeholder="Provide context for governance administration..."
                       value={managerNote}
                       onChange={e => setManagerNote(e.target.value)}
                    />
                 </div>

                 <div className="pt-8 border-t border-border/40 flex gap-4">
                    <button type="button" onClick={() => setEscalatingFeedback(null)} className="sf-btn-secondary flex-1 py-4">
                       Cancel
                    </button>
                    <button type="submit" className="sf-btn-primary flex-[2] py-4 bg-foreground text-background hover:bg-foreground/80 border-none">
                       <Send size={16} /> Finalize Dispatch
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
