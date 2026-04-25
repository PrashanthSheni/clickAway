import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { ChevronRight, Calendar as CalendarIcon, Loader2, Sparkles, Activity } from "lucide-react";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const STATE_COLOR = {
  approved: "#00bbff",
  pending_approval: "#94a3b8",
  checked_in: "#0f172a",
  no_show_warning: "#f59e0b",
  completed: "#10b981",
  extension_pending: "#8b5cf6",
};

export default function CalendarBase({ endpoint, title, subtitle, eyebrow = "Calendar", testid = "calendar-page" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(endpoint);
        setEvents(
          data.map((b) => ({
            id: b.id,
            title: `${b.resource_name || ""} — ${b.title || b.user_name || ""}`,
            start: new Date(b.start_time),
            end: new Date(b.end_time),
            resource: b,
          })),
        );
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [endpoint]);

  const eventPropGetter = useMemo(
    () => (event) => ({
      className: "premium-calendar-event",
      style: {
        backgroundColor: STATE_COLOR[event.resource.state] || "#475569",
        borderRadius: 8,
        border: 'none',
        fontSize: '10px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '4px 8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      },
    }),
    [],
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Schedule</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
      data-testid={testid}
    >
      <header className="pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">{eyebrow}</span>
        </div>
        <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">{title}.</h1>
        {subtitle && <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed italic">{subtitle}</p>}
      </header>

      <div className="bg-[#fafaf9] rounded-[4rem] border-2 border-slate-50 p-10 shadow-sm relative overflow-hidden group">
        <style>{`
          .rbc-calendar { font-family: 'Plus Jakarta Sans', sans-serif; }
          .rbc-header { padding: 20px !important; font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.2em !important; color: #94a3b8 !important; border-bottom: 2px solid #f8fafc !important; }
          .rbc-toolbar { margin-bottom: 30px !important; }
          .rbc-toolbar button { font-size: 10px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.15em !important; border-radius: 12px !important; padding: 10px 20px !important; border: 1px solid #f1f5f9 !important; color: #64748b !important; }
          .rbc-toolbar button:hover { background: #f8fafc !important; color: #0f172a !important; }
          .rbc-toolbar button.rbc-active { background: #0f172a !important; color: white !important; border-color: #0f172a !important; box-shadow: 0 10px 20px -5px rgba(15,23,42,0.3) !important; }
          .rbc-month-view, .rbc-time-view { border: none !important; }
          .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f8fafc !important; }
          .rbc-month-row { border-top: 1px solid #f8fafc !important; }
          .rbc-off-range-bg { background: #fafbfc !important; }
          .rbc-today { background: #00bbff05 !important; }
          .rbc-event { transition: all 0.2s ease !important; }
          .rbc-event:hover { transform: scale(1.02) !important; filter: brightness(1.1) !important; z-index: 50 !important; }
          .rbc-show-more { font-size: 10px !important; font-weight: 800 !important; color: #00bbff !important; text-transform: uppercase !important; }
        `}</style>
        
        <div style={{ height: 750 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventPropGetter}
            onSelectEvent={(e) => navigate(`/bookings/${e.id}`)}
            views={["month", "week", "day", "agenda"]}
            defaultView="week"
            popup
            selectable
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-10 bg-[#fafaf9] p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-fit">
        <div className="flex items-center gap-4">
           <Activity size={18} className="text-[#00bbff]" />
           <span className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-widest italic">Status Legend:</span>
        </div>
        <div className="flex flex-wrap gap-8">
          {Object.entries(STATE_COLOR).map(([k, c]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: c }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{k.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
