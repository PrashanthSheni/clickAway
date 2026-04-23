import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { api } from "../lib/api";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const STATE_COLOR = {
  approved: "#475569",
  pending_approval: "#94a3b8",
  checked_in: "#334155",
  no_show_warning: "#64748b",
  completed: "#1e293b",
  extension_pending: "#475569",
};

export default function CalendarBase({ endpoint, title, subtitle, eyebrow = "Calendar", testid = "calendar-page" }) {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
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
    })();
  }, [endpoint]);

  const eventPropGetter = useMemo(
    () => (event) => ({
      style: {
        backgroundColor: STATE_COLOR[event.resource.state] || "#475569",
        borderRadius: 2,
      },
    }),
    [],
  );

  return (
    <div data-testid={testid} className="space-y-6">
      <div>
        <div className="sf-section-title">{eyebrow}</div>
        <h1 className="sf-page-title">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      <div className="bg-card rounded-xl border border-border p-4" style={{ height: 680 }}>
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
        />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {Object.entries(STATE_COLOR).map(([k, c]) => (
          <div key={k} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
            <span className="capitalize">{k.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
