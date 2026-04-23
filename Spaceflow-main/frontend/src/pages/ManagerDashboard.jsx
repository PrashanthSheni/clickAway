import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import BookingStateBadge from "../components/BookingStateBadge";
import { Users, Clock, CheckSquare, ShieldCheck, ArrowRight, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{label}</div>
        {Icon && (
          <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function ManagerDashboard() {
  const [approvals, setApprovals] = useState([]);
  const [team, setTeam] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  
  const loadData = async () => {
    const [a, t, pu] = await Promise.all([
      api.get("/bookings/approvals"), 
      api.get("/users"),
      api.get("/users/pending")
    ]);
    setApprovals(a.data);
    setTeam(t.data);
    setPendingUsers(pu.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveUser = async (id) => {
    try {
      await api.post(`/users/${id}/approve`);
      toast.success("User approved successfully");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to approve user");
    }
  };

  const handleRejectUser = async (id) => {
    try {
      await api.post(`/users/${id}/reject`);
      toast.success("User rejected successfully");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reject user");
    }
  };

  return (
    <div data-testid="manager-dashboard" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Manager</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Team command centre</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Pending approvals" value={approvals.length} icon={ShieldCheck} />
        <Stat label="Team size" value={team.length - 1} icon={Users} />
        <Stat label="Avg reliability" value={Math.round(team.reduce((a, u) => a + u.reliability_score, 0) / Math.max(1, team.length)) || 0} icon={CheckSquare} />
        <Stat label="Pending Onboarding" value={pendingUsers.length} icon={UserPlus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
            <div className="font-semibold text-slate-900">Top pending</div>
            <Link to="/manager/approvals" className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1">
              Open queue <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {approvals.slice(0, 5).map((b) => (
              <Link key={b.id} to={`/bookings/${b.id}`} className="block px-5 py-3 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{b.resource_name}</div>
                    <div className="text-xs text-slate-500">
                      {b.user_name} · {new Date(b.start_time).toLocaleString()}
                    </div>
                  </div>
                  <BookingStateBadge state={b.state} />
                </div>
              </Link>
            ))}
            {approvals.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">Nothing pending. Clear skies.</div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-200 font-semibold text-slate-900">Team reliability</div>
          <div className="divide-y divide-slate-100">
            {team.filter((u) => u.role === "employee").map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.department} · {u.completed_count} completed · {u.no_show_count} no-shows</div>
                </div>
                <div className={`text-lg font-black tracking-tighter ${u.reliability_score >= 85 ? "text-emerald-600" : u.reliability_score >= 70 ? "text-amber-600" : "text-red-600"}`}>
                  {Math.round(u.reliability_score)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 mt-4">
          <div className="px-5 py-3 border-b border-slate-200 font-semibold text-slate-900 flex items-center gap-2">
            <UserPlus size={16} className="text-blue-600" /> Pending Employee Registrations
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
    </div>
  );
}
