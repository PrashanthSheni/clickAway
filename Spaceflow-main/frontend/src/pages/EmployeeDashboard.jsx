import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, BACKEND_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { 
  Plus, ArrowRight, QrCode, Gauge, Sparkles,
  CalendarDays, Clock, MapPin, Users, Zap, TrendingUp, Activity, CheckCircle
} from "lucide-react";

function ReliabilityRing({ score }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-2xl font-bold text-foreground">{score}%</div>
      <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Reliability</div>
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
        const [b, r] = await Promise.all([api.get("/bookings?scope=mine"), api.get("/resources")]);
        setBookings(b.data);
        setResources(r.data);
      } catch (_) {}
    })();
  }, []);

  const now = new Date();
  const upcoming = bookings
    .filter(b => new Date(b.end_time) >= now && !["rejected","cancelled","no_show","completed"].includes(b.state))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  const activeNow = bookings.find(b =>
    b.state === "checked_in" && new Date(b.start_time) <= now && new Date(b.end_time) >= now
  );
  const nextUp = upcoming[0];
  const checkins = bookings.filter(b => {
    if (!["approved","no_show_warning"].includes(b.state)) return false;
    return new Date(b.end_time) > now && (new Date(b.start_time) - now) < 2 * 60 * 60 * 1000;
  });
  const completed = bookings.filter(b => b.state === "completed").length;
  const noShows = bookings.filter(b => b.state === "no_show").length;
  const reliabilityScore = Math.round(user?.reliability_score || 0);

  const featuredResources = resources.filter(r => r.active && r.image_url).slice(0, 3);
  const getResourceImg = (r) => r.image_url?.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`;

  return (
    <div data-testid="employee-dashboard" className="space-y-6">
      
      {/* ── Hero welcome banner ── */}
      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between border border-border">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-3">
            Welcome back, {user?.name?.split(" ")[0]}.
          </h1>
          <p className="text-slate-500 text-sm">
            {activeNow 
              ? `Currently checked in at ${activeNow.resource_name}.` 
              : nextUp 
                ? `Next session: ${nextUp.resource_name} at ${new Date(nextUp.start_time).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}`
                : "No sessions scheduled for today."
            }
          </p>
        </div>

        <div className="flex items-center gap-8">
          <ReliabilityRing score={reliabilityScore} />
        </div>
      </div>

      {/* ── Check-in alert ── */}
      {checkins.length > 0 && (
        <div className="flex items-center gap-4 bg-slate-800 text-white rounded-xl p-6 border border-slate-700">
          <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
            <QrCode size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base tracking-tight">Active session pending</div>
            <div className="text-slate-400 text-xs mt-0.5 font-medium truncate">{checkins[0].resource_name} check-in required</div>
          </div>
          <Link to="/checkin" className="sf-btn-primary bg-white text-slate-900 hover:bg-slate-100">
            Check In
          </Link>
        </div>
      )}

      {/* ── Main 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming bookings - 2 cols */}
        <div className="lg:col-span-2 sf-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <CalendarDays size={16} className="text-indigo-600" />
              </div>
              <div>
                <span className="font-black text-foreground tracking-tight">Your Schedule</span>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{upcoming.length} active bookings</div>
              </div>
            </div>
            <Link to="/bookings" className="sf-btn-secondary text-xs px-3 py-1.5 h-auto">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                <CalendarDays size={24} className="text-gray-300" />
              </div>
              <div className="text-base font-bold text-foreground">No bookings found</div>
              <div className="text-xs text-muted-foreground mt-1 mb-6">Start by exploring our available spaces</div>
              <Link to="/browse" className="sf-btn-primary">
                <Plus size={14} /> Browse resources
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcoming.slice(0, 5).map(b => {
                const start = new Date(b.start_time);
                const isToday = start.toDateString() === now.toDateString();
                return (
                  <Link
                    to={`/bookings/${b.id}`}
                    key={b.id}
                    data-testid={`upcoming-booking-${b.id}`}
                    className="group flex items-center gap-5 px-6 py-4 hover:bg-muted/50 transition-all"
                  >
                    {/* Date block */}
                    <div className={`w-14 text-center flex-shrink-0 rounded-2xl py-2 shadow-sm ${isToday ? "bg-indigo-600 text-white" : "bg-muted text-foreground"}`}>
                      <div className="text-[9px] font-black uppercase tracking-tighter opacity-80">{start.toLocaleDateString(undefined, {month:"short"})}</div>
                      <div className="text-xl font-black leading-none my-0.5">{start.getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground group-hover:text-indigo-600 transition-colors truncate">
                        {b.resource_name}
                        {b.title && <span className="text-muted-foreground font-normal"> · {b.title}</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold mt-1 flex items-center gap-1.5">
                        <Clock size={11} className="text-indigo-400" />
                        {start.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})} – {new Date(b.end_time).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                      </div>
                    </div>
                    <BookingStateBadge state={b.state} />
                    <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats + Quick access - 1 col */}
        <div className="space-y-6">
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Completed", value: completed, color: "text-emerald-600", icon: <CheckCircle className="text-emerald-500" size={14} /> },
              { label: "No-shows", value: noShows, color: "text-red-500", icon: <Activity className="text-red-400" size={14} /> },
            ].map(s => (
              <div key={s.label} className="sf-card p-5 text-center flex flex-col items-center">
                <div className="mb-2">{s.icon}</div>
                <div className={`text-3xl font-black tracking-tighter ${s.color}`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick access cards */}
          <div className="sf-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-6 w-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Zap size={12} className="text-amber-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quick Book</span>
            </div>
            <div className="space-y-3">
              {(featuredResources.length > 0 ? featuredResources : resources.filter(r=>r.active).slice(0,3)).map(r => (
                <Link
                  to={`/book/${r.id}`}
                  key={r.id}
                  data-testid={`quick-access-${r.id}`}
                  className="group flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-indigo-500/20 hover:bg-muted/50 transition-all"
                >
                  <div className="h-11 w-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                    {r.image_url
                      ? <img src={getResourceImg(r)} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🏢</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate group-hover:text-indigo-600 transition-colors">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">{r.type} · {r.capacity} cap</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Plus size={14} />
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/browse" className="mt-5 block text-center text-xs text-indigo-500 font-bold hover:text-indigo-600 transition-colors border-t border-border pt-4">
              Explore All Spaces →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
