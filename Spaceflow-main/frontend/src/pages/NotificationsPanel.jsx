import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationsPanel() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/notifications");
    setItems(data);
  };
  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await api.post("/notifications/read-all");
    load();
  };

  return (
    <div data-testid="notifications-page" className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Inbox</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Notifications</h1>
        </div>
        <button
          data-testid="notifications-page-mark-all"
          onClick={markAll}
          className="bg-white border border-slate-300 text-slate-900 font-semibold rounded-md px-4 py-2 hover:bg-slate-50 inline-flex items-center gap-2"
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {items.length === 0 && (
          <div className="p-10 text-center">
            <Bell className="mx-auto text-slate-400 mb-2" size={22} />
            <div className="text-sm text-slate-500">No notifications yet.</div>
          </div>
        )}
        {items.map((n) => (
          <div key={n.id} className={`p-4 ${!n.read ? "bg-blue-50/40" : ""}`} data-testid={`notif-page-item-${n.id}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                <div className="text-xs text-slate-600 mt-1">{n.message}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-2 font-bold">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              {n.link && (
                <Link to={n.link} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Open →</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
