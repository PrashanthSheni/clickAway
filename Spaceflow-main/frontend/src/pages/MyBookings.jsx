import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import BookingStateBadge from "../components/BookingStateBadge";
import { Plus, RotateCcw, CalendarDays, Clock, ArrowRight, ListFilter, Target, History, Calendar, ZapOff, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16 pb-20"
    >
      {/* ── Welcome Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-10 border-b-2 border-slate-100">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Your Bookings</span>
          </div>
          <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight">My Sessions.</h1>
          <p className="text-lg text-slate-400 font-medium mt-4">
             You have <span className="text-[#1a1f2e] font-bold">{upcoming.length} active bookings</span> scheduled for the future.
          </p>
        </div>
        <Link to="/browse" className="bg-[#00bbff] text-white px-12 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#0099dd] transition-all shadow-xl hover:shadow-[#00bbff]/30 flex items-center gap-3 active:scale-95">
          <Plus size={20} strokeWidth={3} /> Book a Resource
        </Link>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-3 bg-[#fafaf9] p-2.5 rounded-[1.5rem] border border-slate-200 w-fit shadow-sm">
        {[
          { id: "upcoming", label: "Upcoming", count: upcoming.length, icon: Calendar },
          { id: "past", label: "Past Bookings", count: past.length, icon: History }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-4 px-8 py-4 rounded-[1.25rem] text-[11px] font-bold uppercase tracking-widest transition-all relative overflow-hidden",
              tab === t.id
                ? "text-white bg-[#1a1f2e] shadow-xl"
                : "text-slate-400 hover:text-slate-600 hover:bg-[#f5f5f4]"
            )}
          >
            <t.icon size={16} />
            {t.label}
            <span className={cn(
              "ml-3 px-2.5 py-0.5 rounded-lg text-[10px] transition-all",
              tab === t.id ? "bg-[#00bbff] text-white" : "bg-slate-100 text-slate-400"
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-[#fafaf9] py-48 rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-12 shadow-inner group"
        >
          <div className="h-24 w-24 bg-[#f5f5f4] rounded-[2.5rem] flex items-center justify-center mb-10 border border-slate-100 group-hover:scale-110 transition-transform duration-700">
            <ZapOff size={48} className="text-slate-200" />
          </div>
          <div className="text-4xl font-plus font-bold text-slate-300 tracking-tight">No Bookings Found</div>
          <p className="text-slate-400 text-sm mt-6 mb-12 max-w-sm font-medium leading-relaxed">
            {tab === "upcoming" 
              ? "You have no upcoming bookings at the moment. Explore our resources to book your next space." 
              : "Your past bookings will be archived here once you've completed your first session."}
          </p>
          {tab === "upcoming" && (
            <Link to="/browse" className="bg-slate-100 text-slate-600 px-12 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#1a1f2e] hover:text-white transition-all border border-slate-200 shadow-sm active:scale-95">
              Browse Resources
            </Link>
          )}
        </motion.div>
      )}

      {/* Grouped list */}
      <div className="space-y-24">
        {Object.entries(grouped).map(([date, items]) => (
          <motion.div key={date} variants={item} className="space-y-10">
            {/* Date divider */}
            <div className="flex items-center gap-8">
              <div className="h-3 w-3 rounded-full bg-[#00bbff]" />
              <div className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">{date}</div>
              <div className="flex-1 h-[2px] bg-slate-100" />
            </div>

            {/* Booking cards */}
            <div className="grid grid-cols-1 gap-6">
              {items.map(b => {
                const start = new Date(b.start_time);
                const end   = new Date(b.end_time);
                const isToday = start.toDateString() === now.toDateString();
                return (
                  <motion.div
                    key={b.id}
                    whileHover={{ scale: 1.005, x: 12 }}
                    className="bg-[#fafaf9] border border-slate-200 rounded-[3rem] p-10 group hover:border-[#00bbff]/40 transition-all shadow-sm hover:shadow-2xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-12">
                      {/* Status/Time block */}
                      <div className={cn(
                        "w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center flex-shrink-0 border-2 transition-all shadow-lg",
                        isToday 
                          ? "bg-[#00bbff] text-white border-white shadow-[#00bbff]/30" 
                          : "bg-[#f5f5f4] text-slate-300 border-slate-100 group-hover:bg-[#fafaf9] group-hover:text-[#1a1f2e] group-hover:border-slate-200"
                      )}>
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5",
                          isToday ? "text-white/80" : "text-slate-400"
                        )}>
                          {start.toLocaleDateString(undefined,{weekday:"short"})}
                        </div>
                        <div className="text-4xl font-bold leading-none">{start.getDate()}</div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-5 mb-5 flex-wrap">
                           <div className="flex items-center gap-3">
                              <div className={cn("h-2.5 w-2.5 rounded-full", isToday ? "bg-[#00bbff] animate-pulse" : "bg-slate-200")} />
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{b.resource_type}</span>
                           </div>
                           <BookingStateBadge state={b.state} />
                        </div>
                        <h3 className="text-4xl font-plus font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors tracking-tight">
                          {b.resource_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-8 mt-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-3">
                            <Clock size={18} className="text-[#00bbff]" />
                            {start.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} – {end.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                          </span>
                          {b.title && (
                            <span className="flex items-center gap-3 bg-[#f5f5f4] px-4 py-1.5 rounded-xl border border-slate-100 text-slate-500 font-bold italic normal-case tracking-normal">
                              {b.title}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-4 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                        {tab === "past" && (
                          <button
                            onClick={() => bookAgain(b)}
                            className="bg-[#fafaf9] text-slate-400 px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border border-slate-200 hover:text-[#1a1f2e] hover:border-[#1a1f2e] transition-all flex items-center gap-3 active:scale-95 shadow-sm"
                          >
                            <RotateCcw size={16} className="text-[#00bbff]" /> Book Again
                          </button>
                        )}
                        <Link
                          to={`/bookings/${b.id}`}
                          className="bg-[#1a1f2e] text-white px-10 py-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#00bbff] transition-all flex items-center gap-4 shadow-xl active:scale-95 group/btn"
                        >
                          Details <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
