import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { Ban } from "lucide-react";

export default function AllBookings() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("all");
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await api.get("/bookings?scope=all");
    setItems(data);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items.filter((b) =>
    (state === "all" || b.state === state) &&
    (q === "" || (b.resource_name || "").toLowerCase().includes(q.toLowerCase()) || (b.user_name || "").toLowerCase().includes(q.toLowerCase()))
  ), [items, state, q]);

  const forceCancel = async (id) => {
    if (!window.confirm("Force-cancel this booking?")) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success("Cancelled");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const STATES = [
    "all", "pending_approval", "approved", "checked_in", "no_show_warning",
    "no_show", "rejected", "cancelled", "completed", "extension_pending",
  ];

  return (
    <div data-testid="all-bookings-page" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Admin</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">All bookings</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row gap-3">
        <input
          data-testid="all-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search resource or user"
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
        <select data-testid="all-state-filter" value={state} onChange={(e) => setState(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white">
          {STATES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">User</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Resource</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">When</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">State</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`all-row-${b.id}`}>
                <td className="px-4 py-3 font-semibold text-slate-900">{b.user_name}</td>
                <td className="px-4 py-3 text-slate-700">{b.resource_name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(b.start_time).toLocaleString()}
                  <div className="text-xs text-slate-400">→ {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </td>
                <td className="px-4 py-3"><BookingStateBadge state={b.state} /></td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link to={`/bookings/${b.id}`} className="text-xs font-semibold text-blue-600">View</Link>
                  {!["cancelled", "completed", "rejected", "no_show"].includes(b.state) && (
                    <button
                      data-testid={`force-cancel-${b.id}`}
                      onClick={() => forceCancel(b.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                    >
                      <Ban size={12} /> Force cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-sm text-slate-500">No bookings match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
