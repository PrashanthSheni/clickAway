import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import {
  LayoutDashboard, Boxes, CalendarDays, ListChecks, Map,
  UserCircle, QrCode, Zap, X, Command, Sun, Moon,
  ShieldCheck, Settings, BarChart3, Bell, LogOut,
  Search, Menu, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: [] },
  { to: "/browse", icon: Boxes, label: "Browse Resources", roles: [] },
  { to: "/bookings", icon: ListChecks, label: "My Bookings", roles: [] },
  { to: "/calendar", icon: CalendarDays, label: "Schedule", roles: [] },
  { to: "/floor-map", icon: Map, label: "Floor Plans", roles: [] },
  { to: "/checkin", icon: QrCode, label: "Session Check-in", roles: [] },
  { to: "/manager/approvals", icon: ShieldCheck, label: "Team Approvals", roles: ["manager", "admin"] },
  { to: "/admin", icon: LayoutDashboard, label: "Admin Overview", roles: ["admin"] },
  { to: "/admin/resources", icon: Boxes, label: "Global Inventory", roles: ["admin"] },
  { to: "/admin/reports", icon: BarChart3, label: "Network Insights", roles: ["admin"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  if (!user) return null;

  const currentSection = NAV_ITEMS.find(n => n.to === location.pathname)?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      
      {/* ── Sidebar ── */}
      <aside className={`bg-[#0F172A] text-white flex flex-col transition-all duration-300 z-50 ${sidebarOpen ? "w-64" : "w-20"}`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <Link to="/" className="flex items-center gap-3">
             <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">S</div>
             <span className={`font-bold tracking-tight text-lg transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"}`}>Spaceflow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
           {NAV_ITEMS.filter(n => n.roles.length === 0 || n.roles.includes(user.role)).map(item => (
             <NavLink
               key={item.to}
               to={item.to}
               className={({ isActive }) => `
                 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                 ${isActive 
                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                   : "text-slate-400 hover:text-white hover:bg-slate-800/50"}
               `}
             >
               <item.icon size={20} className={sidebarOpen ? "" : "mx-auto"} />
               <span className={`text-sm font-medium transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"}`}>
                 {item.label}
               </span>
             </NavLink>
           ))}
        </nav>

        {/* User Quick Profile */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
           <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "justify-center"}`}>
              <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-600">
                {user.name.charAt(0)}
              </div>
              <div className={`flex-1 min-w-0 ${sidebarOpen ? "block" : "hidden"}`}>
                 <div className="text-xs font-semibold truncate">{user.name}</div>
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user.role}</div>
              </div>
              <button onClick={() => { logout(); navigate("/login"); }} className={`text-slate-500 hover:text-red-400 transition-colors ${sidebarOpen ? "block" : "hidden"}`}>
                <LogOut size={16} />
              </button>
           </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                <Menu size={20} />
             </button>
             <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-medium">Enterprise</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-900 font-semibold">{currentSection}</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
             {/* Search Bar */}
             <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-64 group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Quick search..." className="bg-transparent border-none text-sm focus:outline-none w-full text-slate-600" />
                <span className="text-[10px] font-bold text-slate-300 border border-slate-200 px-1.5 rounded-md">/</span>
             </div>

             {/* Actions */}
             <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 relative">
                   <Bell size={20} />
                   <div className="absolute top-2 right-2 h-2 w-2 bg-indigo-600 rounded-full border-2 border-white" />
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1" />
                <Link to="/profile" className="flex items-center gap-3 pl-2 group">
                   <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Personal Identity</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">View Profile</div>
                   </div>
                   <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {user.name.charAt(0)}
                   </div>
                </Link>
             </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           <div className="max-w-7xl mx-auto">
              <Outlet />
           </div>
        </main>

      </div>

    </div>
  );
}
