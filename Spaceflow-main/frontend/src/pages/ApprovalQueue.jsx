import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ApprovalQueue() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});

  const load = async () => {
    const { data } = await api.get("/bookings/approvals");
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (id, action) => {
    setBusyId(id);
    try {
      await api.post(`/bookings/${id}/${action}`, { note: notes[id] || "" });
      toast.success(action === "approve" ? "Approved" : "Rejected");
      setNotes((prev) => ({ ...prev, [id]: "" }));
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div data-testid="approvals-page" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Manager</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Approval queue</h1>
        <p className="text-sm text-slate-600 mt-1">{items.length} pending {items.length === 1 ? "item" : "items"}.</p>
      </div>

      {items.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <div className="text-sm text-slate-500">You're clear. No approvals waiting.</div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="bg-white rounded-lg border border-slate-200 p-5" data-testid={`approval-row-${b.id}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <Link to={`/bookings/${b.id}`} className="text-base font-semibold text-slate-900 hover:text-blue-700">
                  {b.resource_name} — {b.title || "(no title)"}
                </Link>
                <div className="text-xs text-slate-500 mt-1">
                  Requested by <span className="font-semibold text-slate-700">{b.user_name}</span> ·{" "}
                  {new Date(b.start_time).toLocaleString()} →{" "}
                  {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                {b.notes && <div className="text-xs text-slate-600 mt-2 italic">"{b.notes}"</div>}
              </div>
              <BookingStateBadge state={b.state} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                data-testid={`approval-note-${b.id}`}
                placeholder="Optional note"
                value={notes[b.id] || ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                data-testid={`approve-btn-${b.id}`}
                onClick={() => doAction(b.id, "approve")}
                disabled={busyId === b.id}
                className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-60"
              >
                {busyId === b.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Approve
              </button>
              <button
                data-testid={`reject-btn-${b.id}`}
                onClick={() => doAction(b.id, "reject")}
                disabled={busyId === b.id}
                className="bg-white text-red-700 border border-red-200 font-semibold rounded-md px-4 py-2 hover:bg-red-50 inline-flex items-center gap-2 disabled:opacity-60"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
