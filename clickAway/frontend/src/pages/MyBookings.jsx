import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import BookingStateBadge from "../components/BookingStateBadge";
import { Plus, RotateCcw, CalendarDays, Clock, ArrowRight, ListFilter } from "lucide-react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/bookings?scope=mine").then(({ data }) => setBookings(data)).catch(() => {});
  }, []);

  const bookAgain = (b) => {
    const oldStart = new Date(b.start_time);
    const oldEnd   = new Date(b.end_time);
    const duration = oldEnd - oldStart;
    const next     = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
    const nextEnd  = new Date(next.getTime() + duration);
    const pad      = (n) => String(n).padStart(2, "0");
    const fmt      = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    navigate(`/book/${b.resource_id}?prefillStart=${fmt(next)}&prefillEnd=${fmt(nextEnd)}&title=${encodeURIComponent(b.title||"")}`);
  };

  const now      = new Date();
  const upcoming = bookings.filter(b => new Date(b.end_time) >= now && !["rejected","cancelled","no_show","completed"].includes(b.state));
  const past     = bookings.filter(b => new Date(b.end_time) < now  ||  ["rejected","cancelled","no_show","completed"].includes(b.state));
  const list     = tab === "upcoming" ? upcoming : past;

  // Group by date for upcoming
  const grouped = {};
  list.forEach(b => {
    const key = new Date(b.start_time).toLocaleDateString(undefined, { weekday:"long", month:"long", day:"numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(b);
  });

  return (
    <div data-testid="my-bookings-page" className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="sf-section-title">Personal Hub</div>
          <h1 className="sf-page-title">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">{upcoming.length} upcoming sessions · {past.length} completed</p>
        </div>
        <Link to="/browse" data-testid="mybookings-new-btn" className="sf-btn-primary px-6 shadow-indigo-200">
          <Plus size={16} /> New Session
        </Link>
      </div>

      {/* Tab pills */}
      <div className="flex gap-1 bg-card/40 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-sm w-fit">
        {[["upcoming", `Upcoming`, upcoming.length], ["past", `History`, past.length]].map(([k, label, count]) => (
          <button
            key={k}
            data-testid={`mybookings-tab-${k}`}
            onClick={() => setTab(k)}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              tab === k
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-400/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {label}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${tab === k ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-500"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="sf-card p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <CalendarDays size={32} className="text-muted-foreground/30" />
          </div>
          <div className="text-xl font-black text-foreground tracking-tight">No {tab} activities</div>
          <div className="text-sm font-medium text-muted-foreground mt-1 mb-8 max-w-xs mx-auto">
            {tab === "upcoming" ? "Your dashboard is clear. Time to reserve your next high-performance space." : "Your past journey will be visualized here once you complete a session."}
          </div>
          {tab === "upcoming" && (
            <Link to="/browse" className="sf-btn-primary px-8 py-3">
              Browse Spaces
            </Link>
          )}
        </div>
      )}

      {/* Grouped list */}
      {list.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{date}</div>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Booking cards */}
              <div className="grid grid-cols-1 gap-3">
                {items.map(b => {
                  const start = new Date(b.start_time);
                  const end   = new Date(b.end_time);
                  const isToday = start.toDateString() === now.toDateString();
                  return (
                    <div
                      key={b.id}
                      data-testid={`mybookings-row-${b.id}`}
                      className="sf-card group hover:shadow-xl transition-all duration-300 p-1"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                        {/* Status/Time block */}
                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm ${isToday ? "bg-indigo-600 text-white" : "bg-muted text-foreground"}`}>
                          <div className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">
                            {start.toLocaleDateString(undefined,{weekday:"short"})}
                          </div>
                          <div className="text-2xl font-black leading-none">{start.getDate()}</div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <span className="text-lg font-black text-foreground group-hover:text-indigo-600 transition-colors tracking-tight leading-none">
                              {b.resource_name}
                            </span>
                            <div className="h-1.5 w-1.5 rounded-full bg-border" />
                            <BookingStateBadge state={b.state} />
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-indigo-400" />
                              {start.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} – {end.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                            </span>
                            {b.title && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-gray-300" />
                                <span className="truncate max-w-[200px]">{b.title}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {tab === "past" && (
                            <button
                              data-testid={`mybookings-book-again-${b.id}`}
                              onClick={() => bookAgain(b)}
                              className="sf-btn-secondary text-[10px] py-2 px-4 gap-2 font-black uppercase tracking-widest shadow-sm"
                            >
                              <RotateCcw size={12} /> Book Again
                            </button>
                          )}
                          <Link
                            to={`/bookings/${b.id}`}
                            data-testid={`mybookings-view-${b.id}`}
                            className="sf-btn-primary text-[10px] py-2 px-6 gap-2 font-black uppercase tracking-widest shadow-sm shadow-indigo-100"
                          >
                            Details <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
