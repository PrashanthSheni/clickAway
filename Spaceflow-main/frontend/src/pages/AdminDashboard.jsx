import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { 
  BarChart3, Settings, Boxes, Users, AlertTriangle, ArrowRight, 
  UserPlus, CheckCircle, XCircle, Edit2, Trash2, X, TrendingUp, 
  Activity, Zap, Loader2, ShieldCheck, Filter, Search, MoreVertical,
  ExternalLink, Download, MessageSquare, AlertCircle, Send, Mail, Shield, ChevronRight, Globe, Database, Terminal
} from "lucide-react";
import { toast } from "sonner";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg">
      <div className="text-slate-500 text-xs font-semibold mb-1">{label}</div>
      <div className="text-slate-900 font-bold text-xl">{payload[0].value} <span className="text-slate-400 text-sm font-medium">Bookings</span></div>
    </div>
  );
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [escalatedFeedback, setEscalatedFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [resolvingFeedback, setResolvingFeedback] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const loadData = async () => {
    try {
      const [o, p, h, ef, au] = await Promise.all([
        api.get("/reports/overview"),
        api.get("/users/pending"),
        api.get("/users/hierarchy"),
        api.get("/feedback/?scope=all"),
        api.get("/users")
      ]);
      setOverview(o.data);
      setPendingUsers(p.data);
      setHierarchy(h.data);
      setEscalatedFeedback(ef.data);
      setAllUsers(au.data);
    } catch (_) {}
  };

  useEffect(() => { loadData(); }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/feedback/${resolvingFeedback.id}/resolve`, { admin_note: adminNote });
      toast.success("Issue resolved successfully");
      setResolvingFeedback(null);
      setAdminNote("");
      loadData();
    } catch (_) {
      toast.error("Failed to resolve issue");
    }
  };

  const openIssues = escalatedFeedback.filter(f => f.status === "escalated");

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (!overview) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-8 h-8 text-[#0ea5e9]" />
      <p className="text-sm font-semibold text-slate-500">Loading Admin Hub...</p>
    </div>
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8 pb-20"
    >
      
      {/* ── System Header ── */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="h-2 w-2 rounded-full bg-[#0ea5e9]" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Control</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Enterprise Hub</h1>
        </div>
        <div className="flex items-center gap-4">
           <button className="bg-white text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
              <Download size={16} /> Download Reports
           </button>
           <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
              <Settings size={16} /> Settings
           </button>
        </div>
      </motion.div>

      {/* ── Tabs Navigation ── */}
      <motion.div variants={item} className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit overflow-x-auto max-w-full no-scrollbar">
         {[
           { id: "overview", label: "Overview" },
           { id: "issues", label: `Issues (${openIssues.length})` },
           { id: "users", label: "Users" },
           { id: "hierarchy", label: "Organization" }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "px-6 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2",
               activeTab === tab.id 
                 ? "bg-white text-slate-900 shadow-sm" 
                 : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
             )}
           >
             {tab.id === "issues" && openIssues.length > 0 && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
             {tab.label}
           </button>
         ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
          >
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: "Total Users", value: overview.total_users, icon: Users, color: "text-[#0ea5e9]", bg: "bg-[#f0f9ff]", border: "border-[#e0f2fe]" },
                 { label: "Active Bookings", value: overview.active_bookings, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                 { label: "Total Resources", value: overview.total_resources, icon: Boxes, color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200" },
                 { label: "Team Reliability", value: (100 - overview.no_show_rate).toFixed(1) + "%", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
               ].map(kpi => (
                 <div key={kpi.label} className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                       <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", kpi.bg, kpi.border)}>
                          <kpi.icon size={24} className={kpi.color} strokeWidth={2} />
                       </div>
                       <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
                    </div>
                    <div>
                       <div className="text-4xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {pendingUsers.length > 0 && (
                 <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg relative overflow-hidden group gap-6">
                    <div className="absolute -right-4 -bottom-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                       <ShieldCheck size={120} />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                       <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                          <UserPlus size={24} className="text-[#0ea5e9]" />
                       </div>
                       <div>
                          <div className="text-xl font-bold tracking-tight">New User Approvals</div>
                          <p className="text-slate-400 text-sm font-medium mt-1">{pendingUsers.length} Users waiting for access</p>
                       </div>
                    </div>
                    <Link to="/admin/approvals" className="h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-xl flex items-center justify-center transition-colors shadow-sm relative z-10"><ArrowRight size={20} /></Link>
                 </div>
               )}
               {openIssues.length > 0 && (
                 <div className="bg-red-500 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg relative overflow-hidden group gap-6">
                    <div className="absolute -right-4 -bottom-4 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                       <AlertCircle size={120} />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                       <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20">
                          <Terminal size={24} className="text-white" />
                       </div>
                       <div>
                          <div className="text-xl font-bold tracking-tight">Resource Issues</div>
                          <p className="text-red-100 text-sm font-medium mt-1">{openIssues.length} Issues require attention</p>
                       </div>
                    </div>
                    <button onClick={() => setActiveTab("issues")} className="h-12 w-12 bg-white/20 hover:bg-white text-white hover:text-red-600 rounded-xl flex items-center justify-center transition-colors shadow-sm relative z-10"><ArrowRight size={20} /></button>
                 </div>
               )}
            </div>

            {/* Booking Trends Chart */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-[#0ea5e9]" />
                     <h3 className="text-lg font-bold text-slate-900">Booking Trends</h3>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                     <Activity size={14} className="text-[#0ea5e9]" /> Real-time sync
                  </div>
               </div>
               <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={overview.bookings_by_day} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </motion.div>
        ) : activeTab === "issues" ? (
          <motion.div 
            key="issues"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
             {openIssues.length === 0 ? (
               <div className="lg:col-span-2 bg-slate-50 py-24 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                     <ShieldCheck size={40} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">System Healthy</div>
                  <p className="text-slate-500 text-sm mt-2 font-medium">No active issues detected within the system.</p>
               </div>
             ) : (
               openIssues.map(f => (
                 <div key={f.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 bg-red-50 border-b border-red-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-red-500 text-white rounded-xl flex items-center justify-center"><AlertTriangle size={20} /></div>
                          <div>
                             <div className="text-lg font-bold text-slate-900">{f.resource_name}</div>
                             <div className="text-xs text-red-600 font-semibold mt-0.5">High Priority</div>
                          </div>
                       </div>
                       <div className="text-xs font-semibold text-slate-500">{new Date(f.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                       <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Details</div>
                       <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">"{f.content}"</p>
                       {f.manager_note && (
                         <div className="flex items-start gap-3 p-4 bg-[#f0f9ff] border border-[#e0f2fe] rounded-xl">
                            <Shield size={16} className="text-[#0ea5e9] shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700">Manager Note: <span className="font-semibold">{f.manager_note}</span></p>
                         </div>
                       )}
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200 mt-auto">
                       <button onClick={() => setResolvingFeedback(f)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">Resolve Issue</button>
                    </div>
                 </div>
               ))
             )}
          </motion.div>
        ) : activeTab === "users" ? (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
             <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-[#0ea5e9]" />
                   <h3 className="text-lg font-bold text-slate-900">All Users</h3>
                </div>
                <div className="text-xs font-semibold text-[#0ea5e9] bg-[#f0f9ff] px-3 py-1.5 rounded-lg border border-[#e0f2fe]">{allUsers.length} Active users</div>
             </div>
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500 font-semibold bg-slate-50">
                         <th className="px-6 py-4 font-semibold uppercase tracking-wider">Name / Email</th>
                         <th className="px-6 py-4 font-semibold uppercase tracking-wider">Position</th>
                         <th className="px-6 py-4 font-semibold uppercase tracking-wider">Score</th>
                         <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                         <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                      {allUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm">{u.name.charAt(0)}</div>
                                 <div>
                                    <div className="text-sm font-bold text-slate-900">{u.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-slate-900 capitalize">{u.role}</div>
                              <div className="text-xs text-slate-500 mt-0.5 capitalize">{u.department}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0ea5e9]" style={{ width: `${u.reliability_score}%` }} />
                                 </div>
                                 <span className="text-xs font-semibold text-slate-700">{Math.round(u.reliability_score)}%</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={cn(
                                "text-xs font-semibold px-2.5 py-1 rounded-md border",
                                u.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              )}>
                                 {u.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center justify-center ml-auto"><MoreVertical size={16} /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="hierarchy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
             {hierarchy.map(item => (
               <div key={item.manager.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-sm">{item.manager.name.charAt(0)}</div>
                        <div>
                           <div className="text-lg font-bold text-slate-900">{item.manager.name}</div>
                           <div className="text-xs text-slate-500 font-medium mt-0.5 capitalize">{item.manager.department} Lead</div>
                        </div>
                     </div>
                     <div className="text-xs font-semibold text-[#0ea5e9] bg-[#f0f9ff] px-3 py-1 rounded-md border border-[#e0f2fe]">Manager</div>
                  </div>
                  <div className="space-y-3">
                     {item.employees.map(emp => (
                       <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shadow-sm">{emp.name.charAt(0)}</div>
                             <div>
                                <div className="text-sm font-bold text-slate-900">{emp.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{emp.email}</div>
                             </div>
                          </div>
                          <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9]" />
                             {Math.round(emp.reliability_score)}%
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolution Modal */}
      <AnimatePresence>
        {resolvingFeedback && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white border border-slate-200 w-full max-w-xl p-8 relative rounded-3xl shadow-xl"
             >
                <button onClick={() => setResolvingFeedback(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                   <X size={20} />
                </button>
                
                <div className="mb-8">
                   <h2 className="text-2xl font-bold text-slate-900 mb-2">Resolve Issue</h2>
                   <p className="text-slate-500 text-sm font-medium">Enter resolution details for <span className="text-slate-900 font-bold">{resolvingFeedback.resource_name}</span>.</p>
                </div>

                <form onSubmit={handleResolve} className="space-y-6">
                   <div>
                      <textarea 
                         required
                         rows={4}
                         className="w-full bg-slate-50 border border-slate-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium resize-none"
                         placeholder="Enter the final resolution details..."
                         value={adminNote}
                         onChange={e => setAdminNote(e.target.value)}
                      />
                   </div>

                   <div className="flex gap-4">
                      <button type="button" onClick={() => setResolvingFeedback(null)} className="px-6 py-3 bg-white text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors border border-slate-200">
                         Cancel
                      </button>
                      <button type="submit" className="flex-1 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
                         <CheckCircle size={18} /> Resolve Now
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
