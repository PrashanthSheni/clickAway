import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { CheckCircle2, XCircle, Loader2, Sparkles, AlertTriangle, Clock, User } from "lucide-react";

const PRIORITY_CONFIG = {
  1: { label: "High Priority",   cls: "bg-red-500/10 text-red-500 border border-red-500/20",    icon: AlertTriangle, dot: "bg-red-500" },
  2: { label: "Medium Priority", cls: "bg-amber-500/10 text-amber-500 border border-amber-500/20", icon: Clock,         dot: "bg-amber-500" },
  3: { label: "Normal",          cls: "bg-muted text-muted-foreground border border-border",   icon: null,          dot: "bg-muted-foreground/30" },
};

export default function ApprovalQueue() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  const load = async () => {
    const [bookingsRes, usersRes] = await Promise.all([
      api.get("/bookings/approvals"),
      api.get("/users/pending")
    ]);
    setItems(bookingsRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => { load(); }, []);

  const doAction = async (id, action) => {
    setBusyId(id);
    try {
      await api.post(`/bookings/${id}/${action}`, { note: notes[id] || "" });
      toast.success(action === "approve" ? "✓ Booking approved" : "Booking rejected");
      setNotes((prev) => ({ ...prev, [id]: "" }));
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusyId(null);
    }
  };

  const doUserAction = async (id, action) => {
    setBusyId(id);
    try {
      await api.post(`/users/${id}/${action}`);
      toast.success(`User account ${action}d`);
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
      setItems(data);
      toast.success("AI prioritization complete");
    } catch (e) {
      toast.error("Prioritization failed");
    } finally {
      setIsPrioritizing(false);
    }
  };

  const totalCount = items.length + users.length;

  return (
    <div data-testid="approvals-page" className="space-y-10 animate-fade-in-up pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="sf-section-title">Operations</div>
          <h1 className="sf-page-title">Authorizations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} pending {totalCount === 1 ? "request" : "requests"} · Unified approval queue
          </p>
        </div>
        <div className="flex gap-2">
          {items.length > 1 && (
            <button
              onClick={handlePrioritize}
              disabled={isPrioritizing}
              className="sf-btn-primary gap-2 shadow-indigo-200"
            >
              {isPrioritizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              AI Prioritize Bookings
            </button>
          )}
        </div>
      </div>

      {/* 1. USER REGISTRATIONS SECTION */}
      {users.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Identity Approvals</h2>
            <div className="h-px flex-1 bg-border/50" />
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase">
              {users.length} New Members
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => (
              <div key={u.id} className="sf-card group hover:shadow-xl transition-all duration-300 p-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-foreground truncate">{u.name}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">{u.email}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => doUserAction(u.id, "approve")}
                      disabled={busyId === u.id}
                      className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors border border-emerald-100"
                    >
                      {busyId === u.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    </button>
                    <button 
                      onClick={() => doUserAction(u.id, "reject")}
                      disabled={busyId === u.id}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-red-100"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. BOOKING REQUESTS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Resource Bookings</h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Priority Legend */}
        {items.length > 0 && (
          <div className="flex items-center gap-4 bg-card/40 backdrop-blur-sm p-3 px-5 rounded-2xl border border-border shadow-sm w-fit">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[9px]">SLA Priority:</span>
            <div className="flex items-center gap-3">
              {[1,2,3].map(p => {
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <span key={p} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`}/>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{cfg.label.split(" ")[0]}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && users.length === 0 && (
          <div className="sf-card p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={32} className="text-muted-foreground/30" />
            </div>
            <div className="text-xl font-black text-foreground tracking-tight">Queue Empty</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">All authorizations have been processed.</div>
          </div>
        )}

        {/* Queue */}
        <div className="space-y-4">
          {items.map((b, i) => {
            const priorityCfg = b.ai_priority ? PRIORITY_CONFIG[b.ai_priority] : null;
            return (
              <div
                key={b.id}
                className={`sf-card group hover:shadow-xl transition-all duration-300 border-l-4 ${
                  b.ai_priority === 1 ? "border-l-red-500" : b.ai_priority === 2 ? "border-l-amber-500" : "border-l-muted"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="flex items-start gap-5 min-w-0">
                      {/* Employee avatar */}
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-base font-black flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
                        {b.user_name?.split(" ").map(p => p[0]).slice(0,2).join("") || "?"}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/bookings/${b.id}`}
                            className="text-lg font-black text-foreground hover:text-indigo-600 transition-colors leading-none tracking-tight block truncate"
                          >
                            {b.resource_name}
                          </Link>
                          {priorityCfg && (
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${priorityCfg.cls} border-none`}>
                              {priorityCfg.label}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <User size={12} className="text-indigo-400" /> {b.user_name}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted" />
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-400" />
                            {new Date(b.start_time).toLocaleDateString()} · {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        
                        {b.notes && (
                          <div className="mt-4 text-xs text-muted-foreground bg-muted/30 rounded-xl px-4 py-3 font-medium border border-border italic relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/30" />
                            "{b.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 pt-1">
                      <BookingStateBadge state={b.state} />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-border">
                    {b.state === "release_pending" ? (
                      <div className="flex-1 flex items-center justify-between bg-blue-500/5 border border-blue-500/20 rounded-2xl px-6 py-4">
                        <div className="text-xs font-bold text-blue-700">
                          Employee has finished early. Free up this resource?
                        </div>
                        <button
                          onClick={() => doAction(b.id, "approve-release")}
                          disabled={busyId === b.id}
                          className="sf-btn-primary !py-2 !px-6 !text-xs bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                          {busyId === b.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Confirm & Release
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 relative">
                          <input
                            placeholder="Include a message for the employee…"
                            value={notes[b.id] || ""}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                            className="sf-input text-xs pl-4 pr-4 py-3 bg-muted/20"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => doAction(b.id, "approve")}
                            disabled={busyId === b.id}
                            className="sf-btn-primary gap-2 text-xs px-6 py-3 shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700"
                          >
                            {busyId === b.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Confirm Access
                          </button>
                          <button
                            onClick={() => doAction(b.id, "reject")}
                            disabled={busyId === b.id}
                            className="sf-btn-danger gap-2 text-xs px-6 py-3 bg-white text-red-600 border-red-100"
                          >
                            <XCircle size={14} /> Deny
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
