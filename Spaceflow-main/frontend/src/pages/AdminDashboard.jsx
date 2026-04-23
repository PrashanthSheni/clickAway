import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { BarChart3, Settings, Boxes, Users, AlertTriangle, ArrowRight, Wrench, UserPlus, CheckCircle, XCircle } from "lucide-react";
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

  const loadData = async () => {
    try {
      const [overviewData, pendingData] = await Promise.all([
        api.get("/reports/overview"),
        api.get("/users/pending")
      ]);
      setOverview(overviewData.data);
      setPendingUsers(pendingData.data);
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
        <div className="bg-white rounded-lg border border-slate-200 mt-4">
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
    </div>
  );
}
