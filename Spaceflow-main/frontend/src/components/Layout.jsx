import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import {
  LayoutDashboard, Boxes, CalendarDays, ListChecks, Map, Bell,
  ShieldCheck, Users, Settings, Building2, LogOut, BarChart3, Sparkles,
  UserCircle, QrCode,
} from "lucide-react";

function NavItem({ to, icon: Icon, label, testid, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      data-testid={testid}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600 pl-[10px]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      <Icon size={18} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NotificationsBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetch = async () => {
    try {
      const { data } = await api.get("/notifications/unread");
      setItems(data);
    } catch (_) {}
  };

  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read`);
    fetch();
  };
  const markAll = async () => {
    await api.post("/notifications/read-all");
    fetch();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid="notifications-bell-btn"
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
      >
        <Bell size={18} className="text-slate-700" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div
          data-testid="notifications-panel"
          className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden z-50"
        >
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Notifications</div>
            <button
              data-testid="notifications-mark-all-btn"
              onClick={markAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                <Sparkles className="mx-auto mb-2" size={20} />
                You're all caught up.
              </div>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => markRead(n.id)}
                data-testid={`notification-item-${n.id}`}
              >
                <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                <div className="text-xs text-slate-600 mt-1">{n.message}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-slate-200 z-30 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-200">
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900">BookSmart</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Resource Suite
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <Section title="Workspace">
            <NavItem to="/dashboard" end icon={LayoutDashboard} label="Dashboard" testid="nav-dashboard" />
            <NavItem to="/browse" icon={Boxes} label="Browse Resources" testid="nav-browse" />
            <NavItem to="/bookings" icon={ListChecks} label="My Bookings" testid="nav-my-bookings" />
            <NavItem to="/calendar" icon={CalendarDays} label="Calendar" testid="nav-calendar" />
            <NavItem to="/floor-map" icon={Map} label="Floor Map" testid="nav-floor-map" />
            <NavItem to="/checkin" icon={QrCode} label="QR Check-in" testid="nav-checkin" />
          </Section>

          {(user.role === "manager" || user.role === "admin") && (
            <Section title="Manager">
              <NavItem to="/manager/approvals" icon={ShieldCheck} label="Approval Queue" testid="nav-approvals" />
              <NavItem to="/manager/team-calendar" icon={CalendarDays} label="Team Calendar" testid="nav-team-calendar" />
            </Section>
          )}

          {user.role === "admin" && (
            <Section title="Admin">
              <NavItem to="/admin" icon={LayoutDashboard} label="Admin Console" testid="nav-admin" />
              <NavItem to="/admin/resources" icon={Boxes} label="Resources" testid="nav-admin-resources" />
              <NavItem to="/admin/policies" icon={Settings} label="Policies" testid="nav-admin-policies" />
              <NavItem to="/admin/bookings" icon={ListChecks} label="All Bookings" testid="nav-admin-bookings" />
              <NavItem to="/admin/reports" icon={BarChart3} label="Analytics" testid="nav-admin-reports" />
            </Section>
          )}

          <Section title="Account">
            <NavItem to="/profile" icon={UserCircle} label="Profile" testid="nav-profile" />
            <NavItem to="/notifications" icon={Bell} label="Notifications" testid="nav-notifications" />
          </Section>
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Top navbar */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-20 flex items-center justify-between px-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {user.role === "admin" ? "Administrator" : user.role === "manager" ? "Manager" : "Employee"} · {user.department}
          </div>
          <div className="text-sm font-semibold text-slate-900">Welcome back, {user.name.split(" ")[0]}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">
              Reliability <span className="text-slate-900 font-bold">{Math.round(user.reliability_score)}</span>
            </span>
          </div>
          <NotificationsBell />
          <Link
            to="/profile"
            data-testid="top-avatar-link"
            className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 text-white text-xs font-bold flex items-center justify-center"
          >
            {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </Link>
        </div>
      </header>

      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
