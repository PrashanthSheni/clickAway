import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import {
  LayoutDashboard, Boxes, CalendarDays, ListChecks, Map,
  UserCircle, QrCode, Zap, X, Command, Sun, Moon,
  ShieldCheck, Settings, BarChart3, Bell, LogOut
} from "lucide-react";

// ── Nav items ────────────────────────────────────────────────
const NAV_ITEMS = [
  { to:"/dashboard",   icon:LayoutDashboard, label:"Dashboard",   roles:[] },
  { to:"/browse",      icon:Boxes,           label:"Resources",   roles:[] },
  { to:"/bookings",    icon:ListChecks,      label:"My Bookings", roles:[] },
  { to:"/calendar",    icon:CalendarDays,    label:"Calendar",    roles:[] },
  { to:"/floor-map",   icon:Map,             label:"Floor Map",   roles:[] },
  { to:"/checkin",     icon:QrCode,          label:"Check-in",    roles:[] },
  { to:"/manager/approvals",     icon:ShieldCheck, label:"Approvals",     roles:["manager","admin"] },
  { to:"/manager/team-calendar", icon:CalendarDays, label:"Team Calendar", roles:["manager","admin"] },
  { to:"/admin",           icon:LayoutDashboard, label:"Admin Console", roles:["admin"] },
  { to:"/admin/resources", icon:Boxes,           label:"Resources Mgmt",roles:["admin"] },
  { to:"/admin/policies",  icon:Settings,        label:"Policies",      roles:["admin"] },
  { to:"/admin/bookings",  icon:ListChecks,      label:"All Bookings",  roles:["admin"] },
  { to:"/admin/reports",   icon:BarChart3,       label:"Analytics",     roles:["admin"] },
  { to:"/profile",     icon:UserCircle,      label:"Profile",     roles:[] },
];

// ── Radial item position ─────────────────────────────────────
function getRadialPos(index, total, radius) {
  // Start from top (-90deg) and distribute evenly
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

// ── Radial command menu ───────────────────────────────────────
function RadialMenu({ open, onClose, user, navigate }) {
  const items = NAV_ITEMS.filter(n => n.roles.length === 0 || n.roles.includes(user.role));
  const radius = Math.min(200, Math.max(160, items.length * 14));

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Center hub + radial items */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 101,
        pointerEvents: open ? "all" : "none",
      }}>
        {/* Radial items */}
        {items.map((item, i) => {
          const pos   = getRadialPos(i, items.length, radius);
          const delay = open ? i * 28 : (items.length - i) * 15;
          return (
            <button
              key={item.to}
              onClick={() => { navigate(item.to); onClose(); }}
              style={{
                position: "absolute",
                left: pos.x - 40, top: pos.y - 40,
                width: 80, height: 80,
                background: "var(--sf-card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", color: "var(--foreground)",
                opacity: open ? 1 : 0,
                transform: open ? "scale(1)" : "scale(0.8)",
                transition: "all 0.2s ease-out",
              }}
              className="hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <item.icon size={20} className="text-slate-600 dark:text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-none max-w-[70px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center close button */}
        <div style={{
          width: 60, height: 60,
          marginLeft: -30, marginTop: -30,
          background: "var(--foreground)",
          border: "2px solid var(--border)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--background)",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1)" : "scale(0.5)",
          transition: "all 0.2s ease-out",
        }}
          onClick={onClose}
        >
          <X size={24} />
        </div>
      </div>
    </>
  );
}

// ── Notifications ─────────────────────────────────────────────
function NotifBell() {
  const [items, setItems]   = useState([]);
  const [open, setOpen]     = useState(false);
  const ref                 = useRef(null);

  const fetchNotifs = async () => {
    try { const { data } = await api.get("/notifications/unread"); setItems(data); } catch (_) {}
  };
  useEffect(() => { fetchNotifs(); const t = setInterval(fetchNotifs, 30000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markAll = async () => { await api.post("/notifications/read-all"); fetchNotifs(); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
      >
        <Bell size={17} className="text-muted-foreground" />
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-indigo-500 text-white text-[9px] font-black flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-indigo-500" />
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {items.length > 0 && <span className="px-1.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold rounded-full">{items.length}</span>}
            </div>
            <button onClick={markAll} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600">Clear All</button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-border">
            {items.length === 0
              ? <div className="p-8 text-center text-xs text-muted-foreground">All caught up 🎉</div>
              : items.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="text-sm font-bold text-foreground">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [radial, setRadial]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === "k" || e.key === "K") && !e.ctrlKey && !e.metaKey &&
          !["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) {
        e.preventDefault();
        setRadial(v => !v);
      }
      if (e.key === "Escape") setRadial(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!user) return null;
  const initials = user.name.split(" ").map(p => p[0]).slice(0, 2).join("");

  return (
    <div className="flex min-h-screen transition-colors duration-300">
      {/* Rotating glow background */}
      <div className="bg-rotating-glow opacity-50" />

      {/* ── Command Sidebar ── */}
      <aside 
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col sf-sidebar-transition border-r sf-sidebar-bg backdrop-blur-2xl shadow-[1px_0_24px_rgba(0,0,0,0.05)] ${
          expanded ? "w-64" : "w-20"
        }`}
        style={{
          background: "var(--sf-sidebar-bg)",
          borderColor: "var(--sf-sidebar-border)"
        }}
      >
        {/* Brand & K Trigger Area */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 h-12">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
              <Zap size={22} className="text-white fill-white" />
            </div>
            <div className={`transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 invisible"}`}>
              <div className="text-lg font-black tracking-tight text-foreground leading-none">Spaceflow</div>
              <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Enterprise</div>
            </div>
          </div>

          <button
            onClick={() => setRadial(true)}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl bg-foreground text-background transition-all hover:opacity-90 group shadow-xl ${
              expanded ? "w-full justify-start" : "w-12 justify-center"
            }`}
          >
            <Command size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className={`text-xs font-bold whitespace-nowrap transition-opacity ${expanded ? "opacity-100" : "opacity-0 hidden"}`}>
              Command Center
            </span>
            <kbd className={`ml-auto hidden xl:flex px-1.5 py-0.5 bg-background/20 rounded text-[9px] font-mono font-black text-background/40 ${expanded ? "" : "hidden"}`}>K</kbd>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* 1. General */}
          <div className="space-y-2">
            {expanded && <div className="px-3.5 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">General</div>}
            {NAV_ITEMS.filter(n => (n.roles.length === 0 || n.roles.includes(user.role)) && !n.to.includes("/manager") && !n.to.includes("/admin") && n.to !== "/profile").map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all group ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span className={`text-[13px] font-bold whitespace-nowrap transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 invisible w-0"}`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>

          {/* 2. Management */}
          {(user.role === "manager" || user.role === "admin") && (
            <div className="space-y-2">
              {expanded && <div className="px-3.5 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</div>}
              {NAV_ITEMS.filter(n => n.roles.includes("manager") && (user.role === "manager" || user.role === "admin")).map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all group ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={`text-[13px] font-bold whitespace-nowrap transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 invisible w-0"}`}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          )}

          {/* 3. Administration */}
          {user.role === "admin" && (
            <div className="space-y-2">
              {expanded && <div className="px-3.5 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Admin</div>}
              {NAV_ITEMS.filter(n => n.roles.includes("admin") && !n.roles.includes("manager")).map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all group ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={`text-[13px] font-bold whitespace-nowrap transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 invisible w-0"}`}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Footer Area (User & Activity) */}
        <div className="p-4 space-y-4 border-t border-border">
          <div className={`flex items-center gap-3 bg-muted/50 p-2 rounded-2xl transition-all ${
            expanded ? "px-3" : "justify-center"
          }`}>
            <NotifBell />
            <button 
              onClick={() => setDark(!dark)}
              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className={`flex flex-col ${expanded ? "block" : "hidden"}`}>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Status</div>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${user.reliability_score >= 80 ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-xs font-bold text-foreground">Score: {Math.round(user.reliability_score)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 h-12">
            <Link to="/profile" className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold flex items-center justify-center flex-shrink-0 transition-all hover:bg-slate-300 dark:hover:bg-slate-700">
              {initials}
            </Link>
            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 invisible"}`}>
              <div className="text-sm font-bold text-foreground truncate leading-none">{user.name}</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 truncate">{user.role}</div>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className={`h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors ${
                expanded ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 ml-20 transition-all duration-400 p-8 md:p-12 max-w-[1600px] mx-auto">
        {/* Subtle page context indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Section</div>
          <div className="flex-1 h-px bg-border" />
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {location.pathname.replace("/", "").replace("-", " ") || "DASHBOARD"}
          </div>
        </div>

        <Outlet />
      </main>

      {/* Radial Menu Overlay */}
      <RadialMenu open={radial} onClose={() => setRadial(false)} user={user} navigate={navigate} />
    </div>
  );
}
