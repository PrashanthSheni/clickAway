import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#2563EB", "#0F172A", "#16A34A", "#D97706", "#7C3AED", "#DC2626"];

export default function ReportsAnalytics() {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/reports/overview");
      setData(data);
    })();
  }, []);

  if (!data) return <div className="text-slate-500">Loading…</div>;

  return (
    <div data-testid="reports-page" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Reports</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total bookings", data.total_bookings],
          ["Avg utilisation", `${data.avg_utilization}%`],
          ["No-show rate", `${data.no_show_rate}%`],
          ["Resources", data.total_resources],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">{k}</div>
            <div className="text-4xl font-black tracking-tighter text-slate-900">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Utilisation by resource</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.utilization_by_resource} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="utilization" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Bookings per day</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.bookings_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ fill: "#0F172A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Peak hours</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.peak_hours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F172A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Bookings by department</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.bookings_by_department} dataKey="count" nameKey="department" innerRadius={50} outerRadius={100} label>
                {data.bookings_by_department.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Underutilised (below 15%)</div>
        {data.underutilized_resources.length === 0 ? (
          <div className="text-sm text-slate-500">Nothing underutilised — portfolio is healthy.</div>
        ) : (
          <ul className="space-y-1">
            {data.underutilized_resources.map((u) => (
              <li key={u.resource_id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{u.name}</span>
                <span className="text-red-600 font-black tracking-tighter">{u.utilization}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
