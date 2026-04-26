import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, Boxes, CalendarDays, ListChecks, Map,
  UserCircle, QrCode, Zap, X, Command, Sun, Moon,
  ShieldCheck, Settings, BarChart3, Bell, LogOut,
  Search, Menu, ChevronRight, HelpCircle
} from "lucide-react";
import RadialMenu from "./RadialMenu";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: [] },
  { to: "/browse", icon: Boxes, label: "Resources", roles: [] },
  { to: "/bookings", icon: ListChecks, label: "Audit Log", roles: [] },
  { to: "/calendar", icon: CalendarDays, label: "Network Schedule", roles: [] },
  { to: "/floor-map", icon: Map, label: "Workplace Map", roles: [] },
  { to: "/checkin", icon: QrCode, label: "Session Identity", roles: [] },
  { to: "/notifications", icon: Bell, label: "Notifications", roles: [] },
  { to: "/manager/approvals", icon: ShieldCheck, label: "Authorizations", roles: ["manager", "admin"] },
  { to: "/admin", icon: LayoutDashboard, label: "Console", roles: ["admin"] },
  { to: "/admin/resources", icon: Boxes, label: "Asset Registry", roles: ["admin"] },
  { to: "/admin/reports", icon: BarChart3, label: "Intelligence", roles: ["admin"] },
  { to: "/profile", icon: UserCircle, label: "My Profile", roles: [] },
  { to: "/settings", icon: Settings, label: "Settings", roles: [] },
  { to: "/support", icon: HelpCircle, label: "Support", roles: [] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [radialOpen, setRadialOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "k" && (e.metaKey || e.ctrlKey || !e.metaKey)) {
        e.preventDefault();
        setRadialOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setRadialOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return null;

  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.length === 0 || item.roles.includes(user.role));
  const activeLabel = NAV_ITEMS.find(n => n.to === location.pathname)?.label || "Platform";

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">

      {/* ── Sidebar ── */}
      <aside
        className={`
          relative flex flex-col border-r border-border/40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50
          ${sidebarOpen ? "w-72" : "w-20"}
          bg-sf-bg-soft/80 backdrop-blur-xl
        `}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-4 mb-10 group cursor-pointer h-20 px-6"
          onClick={() => {
            if (!sidebarOpen) {
              setSidebarOpen(true);
            } else {
              navigate("/");
            }
          }}
        >
          <img src="/videos/logofinall.png" alt="clickAway" className="h-12 w-12 object-contain shadow-lg" />
          <div className={`flex flex-col transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
            <span className="font-bold text-lg tracking-tight text-foreground">click<span className="text-primary">A</span>way</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Intelligence</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"}
              `}
            >
              <item.icon size={20} className={sidebarOpen ? "shrink-0" : "mx-auto"} />
              <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/40 space-y-4">
          <div className={`flex items-center gap-3 p-2 rounded-2xl bg-accent/30 ${sidebarOpen ? "" : "justify-center"}`}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className={`flex-1 min-w-0 ${sidebarOpen ? "block" : "hidden"}`}>
              <div className="text-xs font-bold text-foreground truncate">{user.name}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-black leading-none mt-1">{user.role}</div>
            </div>
            <button
              onClick={() => { logout(); navigate("/auth"); }}
              className={`p-2 text-muted-foreground hover:text-destructive transition-colors ${sidebarOpen ? "block" : "hidden"}`}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">

        {/* Top bar */}
        <header
          className={`
            h-20 flex items-center justify-between px-8 z-40 transition-all duration-300 shrink-0
            ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm" : "bg-transparent"}
          `}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 bg-accent/50 hover:bg-accent rounded-xl text-foreground/70 transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
              <span className="text-muted-foreground">Ecosystem</span>
              <ChevronRight size={14} className="text-muted-foreground/30" />
              <span className="text-foreground font-bold tracking-tight uppercase tracking-widest text-[10px]">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex items-center gap-3 bg-accent/30 border border-border/40 rounded-xl px-4 py-2 w-72 group focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/40 transition-all">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources, users..."
                className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground/50"
              />
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all active:scale-90"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <button className="p-2.5 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground relative group transition-all">
                <Bell size={20} />
                <div className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full border-2 border-background group-hover:scale-125 transition-transform" />
              </button>

              <div className="h-8 w-[1px] bg-border/40 mx-2" />

              <Link to="/profile" className="flex items-center gap-3 pl-2 group">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center font-bold text-sm border border-border/50 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5 transition-all">
                  {user.name.charAt(0)}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative p-8">
          {/* Ambient visual layer */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
        </main>
        
        <RadialMenu isOpen={radialOpen} onClose={() => setRadialOpen(false)} items={filteredNavItems} />
      </div>
    </div>
  );
}
