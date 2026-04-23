import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { BarChart3, Settings, Boxes, Users, AlertTriangle, ArrowRight, UserPlus, CheckCircle, XCircle, Edit2, Trash2, X, TrendingUp, Activity, Zap, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area } from "recharts";

// ── Custom tooltip for charts ──────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border-none rounded-xl p-3 shadow-2xl">
      <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</div>
      <div className="text-white font-black text-lg">{payload[0].value}</div>
    </div>
  );
};

// ── Stat card ──────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = "#6366F1", trend }) {
  return (
    <div className="sf-card p-5 glass-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: color + "15" }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-4xl font-black tracking-tighter text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">{sub}</div>}
      {trend !== undefined && (
        <div className={`text-[10px] font-black mt-2 flex items-center gap-1 uppercase tracking-widest ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
          <TrendingUp size={11} /> {trend >= 0 ? "+" : ""}{trend}% <span className="opacity-50">vs last week</span>
        </div>
      )}
    </div>
  );
}

// ── Mini progress bar ──────────────────────────────────────
function UtilBar({ name, value, type }) {
  const color = value < 20 ? "#EF4444" : value < 50 ? "#F59E0B" : "#10B981";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-sm font-bold text-foreground truncate group-hover:text-indigo-500 transition-colors">{name}</div>
          <div className="text-sm font-black ml-2 flex-shrink-0" style={{ color }}>{value}%</div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
        </div>
        <div className="text-[9px] text-muted-foreground mt-1.5 font-bold uppercase tracking-widest">{type}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [editFormData, setEditFormData] = useState({ name:"", email:"", role:"", department:"", manager_id:"" });

  const loadData = async () => {
    try {
      const [o, p, h] = await Promise.all([api.get("/reports/overview"), api.get("/users/pending"), api.get("/users/hierarchy")]);
      setOverview(o.data); setPendingUsers(p.data); setHierarchy(h.data);
    } catch (_) {}
  };
  useEffect(() => { loadData(); }, []);

  const handleApproveUser = async (id) => { try { await api.post(`/users/${id}/approve`); toast.success("Manager approved"); loadData(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const handleRejectUser  = async (id) => { try { await api.post(`/users/${id}/reject`);  toast.success("Manager rejected"); loadData(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const handleUpdateUser  = async (e) => {
    e.preventDefault();
    try { await api.put(`/users/${editingUser.id}`, editFormData); toast.success("User updated"); setEditingUser(null); loadData(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const handleDeleteUser = async () => {
    if (!deleteReason.trim()) { toast.error("Please provide a reason"); return; }
    try { await api.delete(`/users/${deletingUser.id}`, { data: { reason: deleteReason } }); toast.success("User deleted"); setDeletingUser(null); setDeleteReason(""); loadData(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const openEditModal = (user) => { setEditingUser(user); setEditFormData({ name:user.name, email:user.email, role:user.role, department:user.department, manager_id:user.manager_id||"" }); };

  if (!overview) return (
    <div className="flex items-center justify-center h-80">
      <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
      <span className="ml-3 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Console…</span>
    </div>
  );

  const TABS = ["overview", "hierarchy"];

  return (
    <div data-testid="admin-dashboard" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="sf-section-title">Administrator</div>
          <h1 className="sf-page-title">Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time system intelligence and user control</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/resources" className="sf-btn-secondary gap-2 px-4 shadow-sm"><Boxes size={14}/> Resources</Link>
          <Link to="/admin/reports"   className="sf-btn-primary  gap-2 px-6 shadow-indigo-200"><BarChart3 size={14}/> Full Analytics</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card/40 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-sm w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${
              activeTab === t 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-400/30" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}>
            {t === "overview" ? "Overview" : "Hierarchy"}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Pending users alert */}
          {pendingUsers.length > 0 && (
            <div className="bg-amber-600 text-white rounded-3xl p-5 flex items-center gap-5 shadow-xl shadow-amber-200 animate-pulse-ring">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserPlus size={22} />
              </div>
              <div className="flex-1">
                <div className="font-black text-lg tracking-tight leading-none">{pendingUsers.length} Manager Registration{pendingUsers.length > 1 ? "s" : ""}</div>
                <div className="text-amber-100 text-[10px] font-bold uppercase tracking-widest mt-1">Awaiting administrative validation</div>
              </div>
              <button onClick={() => {}} className="px-5 py-2.5 bg-white text-amber-700 font-black text-xs rounded-xl shadow-sm hover:bg-amber-50 transition-all">
                Review Now
              </button>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard label="Total Users"   value={overview.total_users}     icon={Users}      color="#334155" />
            <StatCard label="Live Sessions"  value={overview.active_bookings} icon={Zap}        color="#475569" />
            <StatCard label="Assets"         value={overview.total_resources}  icon={Boxes}      color="#64748b" />
            <StatCard label="Friction Rate"  value={`${overview.no_show_rate}%`} icon={AlertTriangle} color="#94a3b8" sub="No-shows" trend={-4} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookings trend */}
            <div className="sf-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Velocity</div>
                  <div className="text-lg font-bold text-foreground tracking-tight mt-0.5">Booking Trend</div>
                </div>
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                  <BarChart3 size={14} className="text-slate-600" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={overview.bookings_by_day} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#334155" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#334155" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "currentColor", fontWeight: 400, opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor", fontWeight: 400, opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#334155" strokeWidth={2} fill="url(#grad1)" dot={false} activeDot={{ r: 4, fill: "#334155" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Peak hours */}
            <div className="sf-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Heatmap</div>
                  <div className="text-lg font-bold text-foreground tracking-tight mt-0.5">Peak Activity</div>
                </div>
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                  <Activity size={14} className="text-slate-600" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={overview.peak_hours} margin={{ top: 10, right: 10, bottom: 0, left: -20 }} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "currentColor", fontWeight: 400, opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor", fontWeight: 400, opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {overview.peak_hours.map((d, i) => (
                      <Cell key={i} fill={d.count > 0 ? "#334155" : "rgba(148, 163, 184, 0.1)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Underutilized */}
            <div className="lg:col-span-2 sf-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">Health Check</div>
                  <div className="text-lg font-black text-gray-900 tracking-tight mt-0.5">Utilization Index</div>
                </div>
                <Link to="/admin/reports" className="sf-btn-secondary text-[10px] px-3 py-1.5">
                  Full Audit <ArrowRight size={10} />
                </Link>
              </div>
              {overview.underutilized_resources.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-3xl mb-2">💎</div>
                  <div className="text-sm font-bold text-foreground">Optimal Performance</div>
                  <div className="text-xs text-muted-foreground mt-1">All resources are being used effectively.</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {overview.underutilized_resources.map(u => (
                    <UtilBar key={u.resource_id} name={u.name} value={u.utilization} type={u.type || "resource"} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="sf-card p-6">
              <div className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-5">System Hub</div>
              <div className="space-y-2">
                {[
                  { to:"/admin/bookings",  label:"Booking Audit",         icon:Activity, color:"#6366F1" },
                  { to:"/admin/resources", label:"Resource Logic",        icon:Boxes,    color:"#10B981" },
                  { to:"/admin/policies",  label:"Governance",            icon:ShieldCheck, color:"#F59E0B" },
                  { to:"/admin/reports",   label:"Growth Intelligence",   icon:BarChart3,color:"#8B5CF6" },
                ].map(({ to, label, icon: Icon, color }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-indigo-500/20 hover:bg-muted transition-all group">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: color + "15" }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-sm font-bold text-foreground group-hover:text-indigo-500 transition-colors flex-1">{label}</span>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-indigo-500 transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Pending user approvals */}
          {pendingUsers.length > 0 && (
            <div className="sf-card overflow-hidden">
              <div className="px-6 py-5 border-b border-white/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus size={18} className="text-indigo-600" />
                  <span className="font-black text-gray-900 tracking-tight">Manager Verification</span>
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-md shadow-indigo-200">{pendingUsers.length}</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {pendingUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-5 px-6 py-5 hover:bg-muted/50 transition-all">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-base font-black flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground text-sm">{u.name}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{u.email} · {u.department}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveUser(u.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95">
                        Verify
                      </button>
                      <button onClick={() => handleRejectUser(u.id)} className="px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95">
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Hierarchy tab */
        <div className="sf-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-card/60">
            <h2 className="font-black text-foreground flex items-center gap-3 tracking-tight">
              <Users size={18} className="text-indigo-500" /> Organizational Graph
            </h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Direct reports and accountability structures</p>
          </div>
          <div className="p-6">
            {hierarchy.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                <div className="text-base font-black text-foreground tracking-tight">System Empty</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">No management structures have been defined yet.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hierarchy.map(item => (
                  <div key={item.manager.id} className="sf-card bg-card/50 overflow-hidden group border-border hover:border-indigo-500/50 transition-all hover:shadow-xl">
                    <div className="bg-slate-900 dark:bg-slate-950 p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-900/40">
                          {item.manager.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-white tracking-tight">{item.manager.name}</div>
                          <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-0.5">{item.manager.department} · Executive</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(item.manager)} className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all flex items-center justify-center"><Edit2 size={13}/></button>
                        <button onClick={() => setDeletingUser(item.manager)} className="h-8 w-8 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-red-300 transition-all flex items-center justify-center"><Trash2 size={13}/></button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground">Direct Reports</div>
                        <span className="px-2 py-0.5 bg-muted text-foreground text-[10px] font-black rounded-lg">{item.employees.length}</span>
                      </div>
                      {item.employees.length === 0 ? (
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic py-2 text-center border-2 border-dashed border-border rounded-2xl">No assigned team</div>
                      ) : (
                        <div className="space-y-2">
                          {item.employees.map(emp => (
                            <div key={emp.id} className="flex items-center gap-3 p-2.5 rounded-2xl border border-transparent hover:border-indigo-500/20 hover:bg-muted group/row transition-all">
                              <div className="h-8 w-8 rounded-xl bg-muted text-foreground text-[11px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">
                                {emp.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-black text-foreground truncate leading-none">{emp.name}</div>
                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-1">{emp.email}</div>
                              </div>
                              <div className="px-2 py-1 bg-background text-indigo-500 text-[9px] font-black rounded-lg shadow-sm border border-border">
                                {emp.reliability_score}%
                              </div>
                              <div className="flex gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(emp)} className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all flex items-center justify-center"><Edit2 size={11}/></button>
                                <button onClick={() => setDeletingUser(emp)} className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all flex items-center justify-center"><Trash2 size={11}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black tracking-tight">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              {[
                { label:"Full Name",   key:"name",       type:"text"  },
                { label:"Email",       key:"email",      type:"email" },
                { label:"Department",  key:"department", type:"text"  },
              ].map(f => (
                <div key={f.key}>
                  <label className="sf-label">{f.label}</label>
                  <input type={f.type} required className="sf-input" value={editFormData[f.key]} onChange={e => setEditFormData({...editFormData, [f.key]: e.target.value})} />
                </div>
              ))}
              <div>
                <label className="sf-label">Role</label>
                <select className="sf-input" value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="sf-btn-secondary flex-1">Cancel</button>
                <button type="submit" className="sf-btn-primary flex-1 justify-center">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-white/10">
            <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-1 tracking-tight">Delete account?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently delete <strong>{deletingUser.name}</strong>.</p>
            <div className="text-left mb-4">
              <label className="sf-label">Reason</label>
              <textarea placeholder="e.g. Leaving the company…" className="sf-input min-h-[70px] resize-none" value={deleteReason} onChange={e => setDeleteReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeletingUser(null)} className="sf-btn-secondary flex-1 justify-center">Keep user</button>
              <button onClick={handleDeleteUser} className="flex-1 sf-btn-danger justify-center bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
