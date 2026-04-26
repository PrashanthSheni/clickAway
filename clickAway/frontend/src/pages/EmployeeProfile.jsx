import React from "react";
import { useAuth } from "../context/AuthContext";
import { Gauge, CheckCircle2, XCircle, Ban } from "lucide-react";

export default function EmployeeProfile() {
  const { user } = useAuth();
  if (!user) return null;
  const score = user.reliability_score;
  const scoreColor = score >= 85 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-red-600";

  return (
    <div data-testid="profile-page" className="space-y-6 max-w-3xl">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Profile</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{user.name}</h1>
        <p className="text-sm text-slate-600 mt-1">{user.email} · {user.department}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">
            <Gauge size={12} /> Reliability
          </div>
          <div className={`text-6xl font-black tracking-tighter ${scoreColor}`}>{Math.round(score)}</div>
          <div className="text-xs text-slate-500 mt-2">
            Higher scores unlock auto-approval for restricted resources.
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Completed</div>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
            <div className="text-3xl font-black tracking-tighter text-slate-900">{user.completed_count}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">No-shows</div>
              <XCircle size={14} className="text-red-600" />
            </div>
            <div className="text-3xl font-black tracking-tighter text-slate-900">{user.no_show_count}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Cancelled</div>
              <Ban size={14} className="text-amber-600" />
            </div>
            <div className="text-3xl font-black tracking-tighter text-slate-900">{user.cancelled_count}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">How reliability works</div>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Starts at 100. Drops for no-shows and heavy cancellations.</li>
          <li>Score &ge; 85 → eligible for auto-approval on open resources.</li>
          <li>Score &lt; 70 → every booking goes through approval.</li>
          <li>Complete more bookings to rebuild trust faster.</li>
        </ul>
      </div>
    </div>
  );
}
