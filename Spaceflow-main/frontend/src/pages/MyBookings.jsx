import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import BookingStateBadge from "../components/BookingStateBadge";
import { Plus, RotateCcw } from "lucide-react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/bookings?scope=mine");
      setBookings(data);
    })();
  }, []);

  const bookAgain = (b) => {
    // Shift the old time into the future (next business morning or next day same time)
    const oldStart = new Date(b.start_time);
    const oldEnd = new Date(b.end_time);
    const duration = oldEnd - oldStart;
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
    const nextEnd = new Date(next.getTime() + duration);
    const pad = (n) => String(n).padStart(2, "0");
    const toLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    navigate(`/book/${b.resource_id}?prefillStart=${toLocal(next)}&prefillEnd=${toLocal(nextEnd)}&title=${encodeURIComponent(b.title || "")}`);
  };

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => new Date(b.end_time) >= now && !["rejected", "cancelled", "no_show", "completed"].includes(b.state),
  );
  const past = bookings.filter(
    (b) => new Date(b.end_time) < now || ["rejected", "cancelled", "no_show", "completed"].includes(b.state),
  );
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div data-testid="my-bookings-page" className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">My bookings</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Bookings</h1>
        </div>
        <Link
          to="/browse"
          data-testid="mybookings-new-btn"
          className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <Plus size={16} /> New
        </Link>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {[
          ["upcoming", `Upcoming (${upcoming.length})`],
          ["past", `Past (${past.length})`],
        ].map(([k, v]) => (
          <button
            key={k}
            data-testid={`mybookings-tab-${k}`}
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
              tab === k ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Resource</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">When</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Title</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">State</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-slate-500">
                  No {tab} bookings.
                </td>
              </tr>
            )}
            {list.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`mybookings-row-${b.id}`}>
                <td className="px-4 py-3 font-semibold text-slate-900">{b.resource_name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(b.start_time).toLocaleString()}
                  <div className="text-xs text-slate-400">
                    → {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{b.title || "—"}</td>
                <td className="px-4 py-3"><BookingStateBadge state={b.state} /></td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link
                    to={`/bookings/${b.id}`}
                    data-testid={`mybookings-view-${b.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View →
                  </Link>
                  {tab === "past" && (
                    <button
                      data-testid={`mybookings-book-again-${b.id}`}
                      onClick={() => bookAgain(b)}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Book again
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
