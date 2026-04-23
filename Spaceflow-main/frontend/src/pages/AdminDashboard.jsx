import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { BarChart3, Settings, Boxes, Users, AlertTriangle, ArrowRight, Wrench, UserPlus, CheckCircle, XCircle, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

function Stat({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{label}</div>
        {Icon && (
          <div className={`h-8 w-8 rounded-md flex items-center justify-center ${accent || "bg-blue-50 text-blue-600"}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview | hierarchy
  
  // Modals
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    manager_id: ""
  });

  const loadData = async () => {
    try {
      const [overviewData, pendingData, hierarchyData] = await Promise.all([
        api.get("/reports/overview"),
        api.get("/users/pending"),
        api.get("/users/hierarchy")
      ]);
      setOverview(overviewData.data);
      setPendingUsers(pendingData.data);
      setHierarchy(hierarchyData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveUser = async (id) => {
    try {
      await api.post(`/users/${id}/approve`);
      toast.success("Manager approved successfully");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to approve manager");
    }
  };

  const handleRejectUser = async (id) => {
    try {
      await api.post(`/users/${id}/reject`);
      toast.success("Manager rejected successfully");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reject manager");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser.id}`, editFormData);
      toast.success("User updated successfully");
      setEditingUser(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update user");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteReason.trim()) {
      toast.error("Please provide a reason for deletion");
      return;
    }
    try {
      await api.delete(`/users/${deletingUser.id}`, { data: { reason: deleteReason } });
      toast.success("User deleted successfully");
      setDeletingUser(null);
      setDeleteReason("");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      manager_id: user.manager_id || ""
    });
  };

  if (!overview) return <div className="text-slate-500">Loading…</div>;

  return (
    <div data-testid="admin-dashboard" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Administrator</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Operations dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/resources" className="bg-white border border-slate-300 text-slate-900 font-semibold rounded-md px-4 py-2 hover:bg-slate-50 inline-flex items-center gap-2">
            <Boxes size={14} /> Resources
          </Link>
          <Link to="/admin/reports" className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2">
            <BarChart3 size={14} /> Full analytics
          </Link>
        </div>
      </div>
      
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          System Overview
        </button>
        <button 
          onClick={() => setActiveTab("hierarchy")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "hierarchy" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Team Hierarchy
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Stat label="Total bookings" value={overview.total_bookings} icon={Boxes} />
            <Stat label="Active" value={overview.active_bookings} icon={BarChart3} accent="bg-emerald-50 text-emerald-600" />
            <Stat label="Resources" value={overview.total_resources} icon={Settings} />
            <Stat label="No-show rate" value={`${overview.no_show_rate}%`} icon={AlertTriangle} accent="bg-red-50 text-red-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Bookings · last 14 days</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={overview.bookings_by_day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Peak booking hours</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={overview.peak_hours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]}>
                    {overview.peak_hours.map((_, i) => (
                      <Cell key={i} fill={overview.peak_hours[i].count > 0 ? "#2563EB" : "#CBD5E1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="font-semibold text-slate-900">Underutilised resources</div>
                <Link to="/admin/reports" className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1">
                  Analytics <ArrowRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {overview.underutilized_resources.length === 0 && (
                  <div className="p-6 text-center text-sm text-slate-500">Everything is being used healthily.</div>
                )}
                {overview.underutilized_resources.map((u) => (
                  <div key={u.resource_id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">Utilisation last 30d</div>
                    </div>
                    <div className="text-red-600 font-black tracking-tighter text-xl">{u.utilization}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-5 py-3 border-b border-slate-200 font-semibold text-slate-900">Operational shortcuts</div>
              <div className="divide-y divide-slate-100">
                <Link to="/admin/bookings" className="block px-5 py-3 hover:bg-slate-50 text-sm font-semibold text-slate-900">
                  All bookings <span className="float-right text-slate-400">→</span>
                </Link>
                <Link to="/admin/resources" className="block px-5 py-3 hover:bg-slate-50 text-sm font-semibold text-slate-900">
                  Manage resources & maintenance <span className="float-right text-slate-400">→</span>
                </Link>
                <Link to="/admin/policies" className="block px-5 py-3 hover:bg-slate-50 text-sm font-semibold text-slate-900">
                  Configure policies <span className="float-right text-slate-400">→</span>
                </Link>
              </div>
            </div>
          </div>

          {pendingUsers.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-5 py-3 border-b border-slate-200 font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus size={16} className="text-blue-600" /> Pending Manager Registrations
              </div>
              <div className="divide-y divide-slate-100">
                {pendingUsers.map(user => (
                  <div key={user.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveUser(user.id)} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 text-sm font-medium">
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => handleRejectUser(user.id)} className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm font-medium">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" /> Team Hierarchy
            </h2>
            <p className="text-xs text-slate-500 mt-1">Manage and view reporting structures across the organization.</p>
          </div>
          <div className="p-5">
            {hierarchy.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic text-sm">
                No managers found in the system.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hierarchy.map((item) => (
                  <div key={item.manager.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-900 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">
                          {item.manager.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold leading-tight">{item.manager.name}</div>
                          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{item.manager.department} · Manager</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(item.manager)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white" title="Edit Manager">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeletingUser(item.manager)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-md transition-colors text-red-200" title="Delete Manager">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100 pb-2">Team Members ({item.employees.length})</div>
                      {item.employees.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2">No direct reports.</div>
                      ) : (
                        <div className="space-y-2">
                          {item.employees.map((emp) => (
                            <div key={emp.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                              <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                {emp.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-bold text-slate-800">{emp.name}</div>
                                <div className="text-[10px] text-slate-500">{emp.email}</div>
                              </div>
                              <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600">
                                {emp.reliability_score}%
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(emp)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                                  <Edit2 size={12} />
                                </button>
                                <button onClick={() => setDeletingUser(emp)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all">
                                  <Trash2 size={12} />
                                </button>
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold">Edit User Details</h3>
              <button onClick={() => setEditingUser(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-center">
            <div className="p-8">
              <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Account?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action cannot be undone.
              </p>
              
              <div className="text-left mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Deletion</label>
                <textarea 
                  required
                  placeholder="e.g., Leaving the company, role change..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[80px]"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setDeletingUser(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">No, Keep User</button>
                <button onClick={handleDeleteUser} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Yes, Delete User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
