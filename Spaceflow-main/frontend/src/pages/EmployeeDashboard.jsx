import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { Boxes, CalendarDays, TrendingUp, Gauge, ArrowRight, Plus, QrCode } from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, accent }) {
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

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [b, r] = await Promise.all([
          api.get("/bookings?scope=mine"),
          api.get("/resources"),
        ]);
        setBookings(b.data);
        setResources(r.data);
      } catch (_) {}
    })();
  }, []);

  const now = new Date();
  const upcoming = bookings
    .filter((b) => new Date(b.end_time) >= now && !["rejected", "cancelled", "no_show", "completed"].includes(b.state))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5);
  const active = bookings.filter((b) =>
    ["approved", "pending_approval", "checked_in", "no_show_warning", "extension_pending"].includes(b.state),
  ).length;
  const completed = bookings.filter((b) => b.state === "completed").length;
  const noShows = bookings.filter((b) => b.state === "no_show").length;

  const checkins = bookings.filter((b) => {
    if (!["approved", "no_show_warning"].includes(b.state)) return false;
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    // within 2h of start/still running
    return end > now && (start - now) < 2 * 60 * 60 * 1000;
  });

  return (
    <div data-testid="employee-dashboard" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">
            Today · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Your workspace at a glance.
          </h1>
        </div>
        <Link
          to="/browse"
          data-testid="dashboard-new-booking-btn"
          className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <Plus size={16} /> New booking
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Active bookings" value={active} icon={Boxes} />
        <StatCard label="Completed" value={completed} icon={CalendarDays} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="No-shows" value={noShows} icon={TrendingUp} accent="bg-red-50 text-red-600" />
        <StatCard
          label="Reliability"
          value={Math.round(user?.reliability_score || 0)}
          sub="0–100 behavioural score"
          icon={Gauge}
          accent="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Upcoming + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Upcoming</div>
              <div className="text-base font-semibold text-slate-900">Next 5 bookings</div>
            </div>
            <Link to="/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {upcoming.length === 0 && (
              <div className="p-10 text-center">
                <div className="text-sm text-slate-500 mb-3">No upcoming bookings. Let's fix that.</div>
                <Link
                  to="/browse"
                  data-testid="dashboard-empty-browse-btn"
                  className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold rounded-md px-4 py-2 hover:bg-slate-800"
                >
                  <Plus size={14} /> Browse resources
                </Link>
              </div>
            )}
            {upcoming.map((b) => (
              <Link
                to={`/bookings/${b.id}`}
                key={b.id}
                data-testid={`upcoming-booking-${b.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {b.resource_name}
                    {b.title ? <span className="text-slate-500 font-normal"> · {b.title}</span> : null}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <BookingStateBadge state={b.state} />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Check-in</div>
                <div className="text-base font-semibold text-slate-900">QR codes</div>
              </div>
              <QrCode size={18} className="text-blue-600" />
            </div>
            
            {checkins.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-md">
                No active check-ins.
              </div>
            ) : (
              <div className="space-y-2">
                {checkins.map(b => (
                  <Link
                    key={b.id}
                    to="/checkin"
                    className="block p-3 border border-blue-100 bg-blue-50/30 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-sm font-bold text-slate-900">{b.resource_name}</div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      {new Date(b.start_time) > now 
                        ? `Check-in opens ${new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "Ready for check-in"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Quick access</div>
            <div className="text-base font-semibold text-slate-900 mb-4">Most available</div>
            <div className="space-y-2">
              {resources.slice(0, 5).map((r) => (
                <Link
                  to={`/book/${r.id}`}
                  key={r.id}
                  data-testid={`quick-access-${r.id}`}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500">
                      {r.type} · Floor {r.floor} · {r.capacity} cap
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
