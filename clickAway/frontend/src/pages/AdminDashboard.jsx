import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { 
  BarChart3, Settings, Boxes, Users, AlertTriangle, ArrowRight, 
  UserPlus, CheckCircle, XCircle, Edit2, Trash2, X, TrendingUp, 
  Activity, Zap, Loader2, ShieldCheck, Filter, Search, MoreVertical,
  ExternalLink, Download, MessageSquare, AlertCircle, Send, Mail, Shield
} from "lucide-react";
import { toast } from "sonner";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from "recharts";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
      <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{label}</div>
      <div className="text-white font-bold text-lg">{payload[0].value}</div>
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
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", department: "", manager_id: "" });

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
      toast.success("Issue marked as resolved");
      setResolvingFeedback(null);
      setAdminNote("");
      loadData();
    } catch (_) {
      toast.error("Failed to resolve issue");
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      manager_id: user.manager_id || ""
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser.id}`, editForm);
      toast.success("User identity updated");
      setEditingUser(null);
      loadData();
    } catch (_) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteReason) return toast.error("Please provide a reason for deletion");
    try {
      await api.delete(`/users/${deletingUser.id}`, { data: { reason: deleteReason } });
      toast.success("User identity purged");
      setDeletingUser(null);
      setDeleteReason("");
      loadData();
    } catch (_) {
      toast.error("Failed to delete user");
    }
  };

  const openIssues = escalatedFeedback.filter(f => f.status === "escalated");

  if (!overview) return (
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
             <span className="sf-section-label">System Admin</span>
             <span className="text-muted-foreground/40">•</span>
             <span className="text-xs font-medium text-muted-foreground">Node Cluster: Frankfurt-01</span>
           </div>
           <h1 className="text-3xl font-bold text-foreground tracking-tight">System Console</h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="sf-btn-secondary py-2 h-auto text-xs px-4">
              <Download size={14} className="mr-2" /> Export Logs
           </button>
           <button className="sf-btn-primary py-2 h-auto text-xs px-4">
              <Settings size={14} className="mr-2" /> Global Config
           </button>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-1 bg-accent p-1 rounded-xl w-fit overflow-x-auto max-w-full border border-border/50">
         {["overview", "issues", "identities", "hierarchy"].map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
               activeTab === tab ? "bg-background text-primary shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
             }`}
           >
             {tab === "issues" ? `Escalated Issues (${openIssues.length})` : tab}
           </button>
         ))}
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: "Active Nodes", value: overview.total_users, icon: Users, trend: "+12%", color: "text-blue-600", bg: "bg-blue-50" },
               { label: "Real-time Load", value: overview.active_bookings, icon: Activity, trend: "-3%", color: "text-emerald-600", bg: "bg-emerald-50" },
               { label: "Inventory Unit", value: overview.total_resources, icon: Boxes, trend: "Stable", color: "text-indigo-600", bg: "bg-indigo-50" },
               { label: "Latency Index", value: overview.no_show_rate + "%", icon: Zap, trend: "+0.2%", color: "text-amber-600", bg: "bg-amber-50" },
             ].map(kpi => (
               <div key={kpi.label} className="sf-card p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                        <kpi.icon size={20} />
                     </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{kpi.label}</div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {pendingUsers.length > 0 && (
               <div className="bg-indigo-600 rounded-xl p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-200">
                  <div className="flex items-center gap-4">
                     <ShieldCheck size={24} className="text-white/40" />
                     <div>
                        <div className="text-lg font-bold">Identity Verifications</div>
                        <p className="text-white/70 text-sm">{pendingUsers.length} awaiting authorization.</p>
                     </div>
                  </div>
                  <Link to="/admin/approvals" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"><ArrowRight size={20} /></Link>
               </div>
             )}
             {openIssues.length > 0 && (
               <div className="bg-red-600 rounded-xl p-6 text-white flex items-center justify-between shadow-lg shadow-red-200">
                  <div className="flex items-center gap-4">
                     <AlertCircle size={24} className="text-white/40" />
                     <div>
                        <div className="text-lg font-bold">Escalated Issues</div>
                        <p className="text-white/70 text-sm">{openIssues.length} critical resource reports.</p>
                     </div>
                  </div>
                  <button onClick={() => setActiveTab("issues")} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"><ArrowRight size={20} /></button>
               </div>
             )}
          </div>

          <div className="sf-card p-8">
             <h3 className="font-bold text-foreground flex items-center gap-2 uppercase tracking-widest text-xs mb-8">Network Velocity</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={overview.bookings_by_day}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} fill="#4F46E522" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      ) : activeTab === "issues" ? (
        <div className="space-y-6">
           {openIssues.length === 0 ? (
             <div className="sf-card py-24 flex flex-col items-center justify-center text-center">
                <ShieldCheck size={32} className="text-emerald-500 mb-6" />
                <h3 className="text-xl font-bold text-foreground">All Systems Nominal</h3>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {openIssues.map(f => (
                  <div key={f.id} className="sf-card overflow-hidden flex flex-col">
                     <div className="p-6 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20"><AlertTriangle size={16} /></div>
                           <div>
                              <div className="text-sm font-bold text-foreground">{f.resource_name}</div>
                              <div className="text-[10px] text-red-500 font-bold uppercase">Priority Escalation</div>
                           </div>
                        </div>
                     </div>
                     <div className="p-6 flex-1 space-y-4">
                        <p className="text-sm text-muted-foreground bg-accent/40 p-4 rounded-xl border border-border/40 italic">"{f.content}"</p>
                        {f.manager_note && <p className="text-xs text-primary font-bold">Manager Oversight: <span className="text-muted-foreground font-normal">{f.manager_note}</span></p>}
                     </div>
                     <div className="p-6 bg-accent/20 border-t border-border/40">
                        <button onClick={() => setResolvingFeedback(f)} className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl text-xs font-bold uppercase">Initialize Resolution</button>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      ) : activeTab === "identities" ? (
        /* ── All Personnel Tab ── */
        <div className="sf-card overflow-hidden">
           <div className="p-6 border-b border-border/50 bg-accent/30 flex items-center justify-between">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Global Identity Roster</h3>
              <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{allUsers.length} Units Active</div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-border/50 text-[10px] uppercase tracking-tighter text-muted-foreground font-black">
                       <th className="px-6 py-4">Identity</th>
                       <th className="px-6 py-4">Role / Department</th>
                       <th className="px-6 py-4">Network Trust</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/20">
                    {allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-accent/40 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center font-bold text-foreground text-xs border border-border/40">{u.name.charAt(0)}</div>
                               <div>
                                  <div className="text-sm font-bold text-foreground">{u.name}</div>
                                  <div className="text-[10px] text-muted-foreground/60 font-medium flex items-center gap-1"><Mail size={8} /> {u.email}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="text-[10px] font-bold text-primary uppercase mb-0.5">{u.role}</div>
                            <div className="text-xs text-muted-foreground">{u.department}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-16 h-1.5 bg-accent rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${u.reliability_score}%` }} />
                               </div>
                               <span className="text-[10px] font-black text-foreground">{Math.round(u.reliability_score)}%</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${u.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                               {u.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button onClick={() => handleOpenEdit(u)} className="p-2 text-muted-foreground/40 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                               <button onClick={() => setDeletingUser(u)} className="p-2 text-muted-foreground/40 hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        /* ── Hierarchy Tab ── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {hierarchy.map(item => (
             <div key={item.manager.id} className="sf-card p-6">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">{item.manager.name.charAt(0)}</div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">{item.manager.name}</div>
                         <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.manager.department} Executive</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(item.manager)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={14} /></button>
                      <div className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-lg">Hierarchy Root</div>
                   </div>
                </div>
                <div className="space-y-4">
                   {item.employees.map(emp => (
                     <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">{emp.name.charAt(0)}</div>
                           <div>
                              <div className="text-xs font-bold text-slate-900">{emp.name}</div>
                              <div className="text-[10px] text-slate-400">{emp.email}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-[10px] font-black text-slate-900">{Math.round(emp.reliability_score)}% Trust</div>
                           <button onClick={() => handleOpenEdit(emp)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"><Edit2 size={14} /></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* ── Resolution Modal ... ── */}
      {resolvingFeedback && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
           <div className="sf-card w-full max-w-lg p-8 relative shadow-2xl animate-fade-in-up border-border">
              <button onClick={() => setResolvingFeedback(null)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
              <div className="mb-8">
                 <div className="sf-badge mb-3 !bg-emerald-500/20 !text-emerald-500 !border-emerald-500/30">Issue Resolution</div>
                 <h2 className="text-2xl font-bold text-foreground">Resolve System Issue</h2>
              </div>
              <form onSubmit={handleResolve} className="space-y-6">
                 <textarea required rows={4} className="sf-input py-4 resize-none" placeholder="Resolution details..." value={adminNote} onChange={e => setAdminNote(e.target.value)} />
                 <div className="flex gap-4"><button type="submit" className="sf-btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20">Mark Resolved</button></div>
              </form>
           </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editingUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
           <div className="sf-card w-full max-w-lg p-8 relative shadow-2xl animate-fade-in-up border-border">
              <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
              <div className="mb-8">
                 <div className="sf-badge mb-3 !bg-primary/20 !text-primary !border-primary/30">Identity Management</div>
                 <h2 className="text-2xl font-bold text-foreground">Edit {editingUser.name}</h2>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Full Name</label>
                    <input required className="sf-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email Address</label>
                    <input required type="email" className="sf-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Role</label>
                        <select className="sf-input" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Department</label>
                        <input className="sf-input" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Manager ID (Optional)</label>
                    <input className="sf-input" value={editForm.manager_id} onChange={e => setEditForm({...editForm, manager_id: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="submit" className="sf-btn-primary flex-1">Apply Identity Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* ── Delete User Modal ── */}
      {deletingUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110] flex items-center justify-center p-8">
           <div className="sf-card w-full max-w-md p-8 relative shadow-2xl border-red-500/20 animate-fade-in-up">
              <div className="flex flex-col items-center text-center">
                 <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertTriangle size={32} />
                 </div>
                 <h2 className="text-xl font-bold text-foreground mb-2">Purge Identity?</h2>
                 <p className="text-sm text-muted-foreground mb-8">This will permanently remove <span className="font-bold text-foreground">{deletingUser.name}</span> from the network infrastructure. This action cannot be undone.</p>
                 
                 <div className="w-full space-y-4">
                    <div className="text-left space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Reason for Deletion</label>
                        <textarea 
                           className="sf-input py-3 resize-none" 
                           placeholder="Ex: Contract Terminated..." 
                           value={deleteReason} 
                           onChange={e => setDeleteReason(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                       <button onClick={() => setDeletingUser(null)} className="flex-1 sf-btn-secondary">Cancel</button>
                       <button onClick={handleDeleteUser} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase py-3 transition-all shadow-lg shadow-red-500/20">Purge Unit</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
