import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { 
  Users, Calendar, Clock, ArrowRight, CheckCircle, 
  XCircle, AlertCircle, TrendingUp, Filter, Search, Loader2, UserPlus,
  ShieldAlert, Activity, ClipboardList, MessageSquare, ShieldCheck, X, Send, Zap,
  Mail, Building
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
      setTeamMembers(tm.data.filter(m => m.id !== user.id)); // Exclude self from team list
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
      toast.success("Issue escalated to system administrator");
      setEscalatingFeedback(null);
      setManagerNote("");
      loadData();
    } catch (_) {
      toast.error("Failed to escalate issue");
    }
  };

  const pending = teamBookings.filter(b => b.state === "pending");
  const active = teamBookings.filter(b => b.state === "checked_in");
  const exceptions = teamBookings.filter(b => ["no_show", "no_show_warning"].includes(b.state));
  const openFeedback = teamFeedback.filter(f => f.status === "pending");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="sf-section-label">Management Console</span>
             <span className="text-slate-300">•</span>
             <span className="text-xs font-medium text-slate-500">Unit: {user.department || "Operations"}</span>
           </div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Overview</h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setActiveTab("team")} className="sf-btn-secondary py-2 h-auto text-xs px-4">
              <Users size={14} className="mr-2" /> Team Roster ({teamMembers.length})
           </button>
           <Link to="/admin/reports" className="sf-btn-primary py-2 h-auto text-xs px-4">
              <TrendingUp size={14} className="mr-2" /> Performance Data
           </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
         {["overview", "team"].map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
               activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeTab === "overview" ? (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Action Required", value: pending.length, icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "On-Site Now", value: active.length, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "System Alerts", value: openFeedback.length, icon: MessageSquare, color: "text-red-600", bg: "bg-red-50" },
              { label: "Total Volume", value: teamBookings.length, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
            ].map(kpi => (
              <div key={kpi.label} className="sf-card p-6 border-l-4 border-l-indigo-600 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                        <kpi.icon size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
                    </div>
                  </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* Authorizations */}
              <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={14} /> Authorizations Queue
                    </h3>
                  </div>
                  {pending.length === 0 ? (
                    <div className="sf-card py-16 flex flex-col items-center justify-center text-center px-8 border-dashed border-2">
                      <div className="font-bold text-slate-900 text-sm">Queue is Clear</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pending.map(b => (
                        <div key={b.id} className="sf-card p-5 group transition-all hover:border-indigo-200">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                    {b.user_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">{b.user_name}</div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                      <Calendar size={10} /> {b.resource_name}
                                    </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleRejectBooking(b.id)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all">
                                    <X size={16} />
                                </button>
                                <button onClick={() => handleApproveBooking(b.id)} className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all">
                                    <CheckCircle size={16} />
                                </button>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Resource Issues */}
              <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare size={14} className="text-red-500" /> Reported Resource Issues
                  </h3>
                  {openFeedback.length === 0 ? (
                    <div className="sf-card py-16 flex flex-col items-center justify-center text-center px-8 border-dashed border-2">
                      <div className="font-bold text-slate-900 text-sm">No Active Reports</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {openFeedback.map(f => (
                        <div key={f.id} className="sf-card p-6 flex flex-col justify-between">
                          <div>
                              <div className="flex items-center justify-between mb-4">
                                <div className="sf-section-label !bg-red-50 !text-red-600">{f.resource_name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(f.created_at).toLocaleDateString()}</div>
                              </div>
                              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <Users size={12} className="text-slate-400" /> {f.user_name}
                              </div>
                              <p className="text-xs text-slate-600 italic leading-relaxed">"{f.content}"</p>
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                              <button onClick={() => setEscalatingFeedback(f)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
                                <ShieldCheck size={14} /> Escalate to Admin
                              </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-8">
              {/* Active Personnel */}
              <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" /> Active Personnel
                  </h3>
                  <div className="sf-card overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {active.length === 0 ? (
                          <div className="p-10 text-center text-xs text-slate-400 italic">No active sessions.</div>
                        ) : (
                          active.map(b => (
                            <div key={b.id} className="p-4 flex items-center gap-3 group hover:bg-slate-50">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              <div className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{b.user_name}</div>
                              <ArrowRight size={14} className="text-slate-300" />
                            </div>
                          ))
                        )}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── Team Tab ── */
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Users size={14} className="text-indigo-600" /> Organizational Roster
              </h3>
              <div className="text-xs text-slate-500">{teamMembers.length} active identities under your supervision.</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <div key={member.id} className="sf-card p-6 group hover:border-indigo-200 transition-all">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                         {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="font-bold text-slate-900 truncate">{member.name}</div>
                         <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{member.department}</div>
                      </div>
                   </div>
                   
                   <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                         <div className="flex items-center gap-2 text-slate-400">
                            <Mail size={12} />
                            <span className="truncate max-w-[140px]">{member.email}</span>
                         </div>
                         <span className="font-bold text-slate-900">{Math.round(member.reliability_score)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-slate-400">
                         <span>Network Trust Index</span>
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${member.reliability_score}%` }} />
                         </div>
                      </div>
                   </div>

                   <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-slate-50 rounded-xl">
                         <div className="text-sm font-bold text-slate-900">{member.completed_count}</div>
                         <div className="text-[9px] text-slate-400 uppercase font-black">Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-xl">
                         <div className="text-sm font-bold text-slate-900">{member.no_show_count}</div>
                         <div className="text-[9px] text-slate-400 uppercase font-black">Missed</div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* ── Escalation Modal ── */}
      {escalatingFeedback && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
           <div className="sf-card w-full max-w-lg p-8 relative shadow-2xl animate-fade-in-up">
              <button onClick={() => setEscalatingFeedback(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
                 <X size={20} />
              </button>
              
              <div className="mb-8">
                 <div className="sf-section-label mb-3 !bg-slate-900 !text-white">Admin Escalation</div>
                 <h2 className="text-2xl font-bold text-slate-900">Forward to Administrator</h2>
              </div>

              <form onSubmit={handleEscalate} className="space-y-6">
                 <div className="space-y-2">
                    <label className="sf-label">Managerial Oversight Note</label>
                    <textarea 
                       required
                       rows={4}
                       className="sf-input py-4 resize-none"
                       placeholder="Add context for the administrator..."
                       value={managerNote}
                       onChange={e => setManagerNote(e.target.value)}
                    />
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => setEscalatingFeedback(null)} className="sf-btn-secondary flex-1">
                       Cancel
                    </button>
                    <button type="submit" className="sf-btn-primary flex-[2] bg-slate-900 hover:bg-slate-800">
                       <Send size={16} className="mr-2" /> Dispatch to Admin
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
