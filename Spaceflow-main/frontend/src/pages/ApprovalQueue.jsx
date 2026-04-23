import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { CheckCircle2, XCircle, Loader2, Sparkles, AlertTriangle, Clock } from "lucide-react";

export default function ApprovalQueue() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});
  const [isPrioritizing, setIsPrioritizing] = useState(false);

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

  const handlePrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const { data } = await api.post("/bookings/prioritize");
      // The prioritized data has ai_priority field
      setItems(data);
      toast.success("AI prioritization complete");
    } catch (e) {
      toast.error("AI prioritization failed. Please ensure Groq API key is set.");
    } finally {
      setIsPrioritizing(false);
    }
  };

  return (
    <div data-testid="approvals-page" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Manager</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Approval queue</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <p className="text-sm text-slate-600">{items.length} pending {items.length === 1 ? "item" : "items"}.</p>
          {items.length > 1 && (
            <button 
              onClick={handlePrioritize}
              disabled={isPrioritizing}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors text-xs font-bold disabled:opacity-50"
            >
              {isPrioritizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              AI Prioritize (Groq)
            </button>
          )}
        </div>
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
              <div className="flex flex-col items-end gap-2">
                <BookingStateBadge state={b.state} />
                {b.ai_priority && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    b.ai_priority === 1 ? "bg-red-100 text-red-700 border border-red-200" :
                    b.ai_priority === 2 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                    "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {b.ai_priority === 1 && <AlertTriangle size={10} />}
                    {b.ai_priority === 2 && <Clock size={10} />}
                    Priority {b.ai_priority}
                  </div>
                )}
              </div>
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
