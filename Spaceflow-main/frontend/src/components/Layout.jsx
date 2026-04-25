import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import {
  LayoutDashboard, Boxes, CalendarDays, ListChecks, Map,
  UserCircle, QrCode, Zap, X, Command, Sun, Moon,
  ShieldCheck, Settings, BarChart3, Bell, LogOut,
  Search, Menu, ChevronRight, User, Shield, Sparkles, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: [] },
  { to: "/browse", icon: Boxes, label: "Browse Resources", roles: [] },
  { to: "/bookings", icon: ListChecks, label: "My Bookings", roles: [] },
  { to: "/calendar", icon: CalendarDays, label: "Unified Calendar", roles: [] },
  { to: "/floor-map", icon: Map, label: "Floor Map", roles: [] },
  { to: "/checkin", icon: QrCode, label: "Check-In Portal", roles: [] },
  { to: "/feature-request", icon: Sparkles, label: "Feedback", roles: [] },
  { to: "/manager/approvals", icon: ShieldCheck, label: "Approvals", roles: ["manager", "admin"] },
  { to: "/admin", icon: LayoutDashboard, label: "Admin Hub", roles: ["admin"] },
  { to: "/admin/resources", icon: Boxes, label: "Manage Resources", roles: ["admin"] },
  { to: "/admin/reports", icon: BarChart3, label: "Analytics", roles: ["admin"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const currentSection = NAV_ITEMS.find(n => n.to === location.pathname)?.label || "Console";

  return (
    <div className="flex h-screen bg-[#fefaf0] text-[#1a1f2e] font-sans selection:bg-[#00bbff]/20 selection:text-[#00bbff]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap');
        .font-plus { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .premium-shadow {
          box-shadow: 0 20px 50px -12px rgba(0, 187, 255, 0.12), 0 8px 30px -10px rgba(0, 0, 0, 0.04);
        }
        .blue-glow {
          filter: drop-shadow(0 0 12px rgba(0, 187, 255, 0.5));
        }
      `}</style>

      {/* ── Sidebar (Premium Navy) ── */}
      <motion.aside 
        animate={{ width: sidebarOpen ? 300 : 96 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#1a1f2e] flex flex-col z-50 relative shadow-[25px_0_70px_-15px_rgba(26,31,46,0.15)] border-r border-white/5"
      >
        {/* Brand */}
        <div className="h-28 flex items-center px-10 border-b border-white/5">
          <Link to="/" className="flex items-center gap-5 group">
             <div className="h-12 w-12 bg-white/5 rounded-[1.25rem] flex items-center justify-center border border-white/10 group-hover:border-[#00bbff]/50 transition-all shadow-2xl backdrop-blur-md">
                <Command size={24} className="text-[#00bbff] blue-glow" />
             </div>
             <AnimatePresence>
               {sidebarOpen && (
                 <motion.span 
                   initial={{ opacity: 0, x: -15 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -15 }}
                   className="font-black tracking-[0.3em] text-white uppercase text-[12px]"
                 >
                   click<span className="text-[#00bbff]">Away</span>
                 </motion.span>
               )}
             </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-12 px-5 space-y-3 overflow-y-auto overflow-x-hidden no-scrollbar">
           {NAV_ITEMS.filter(n => n.roles.length === 0 || n.roles.includes(user.role)).map(item => (
             <NavLink
               key={item.to}
               to={item.to}
               className={({ isActive }) => cn(
                 "flex items-center gap-5 px-6 py-4.5 rounded-[1.5rem] transition-all group relative",
                 isActive 
                   ? "bg-[#00bbff] text-white shadow-[0_15px_35px_-8px_rgba(0,187,255,0.5)]" 
                   : "text-slate-500 hover:text-white hover:bg-white/5"
               )}
             >
               <item.icon size={22} className={cn("shrink-0 transition-transform group-hover:scale-110", !sidebarOpen && "mx-auto")} />
               {sidebarOpen && (
                 <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                   {item.label}
                 </span>
               )}
               {!sidebarOpen && (
                 <div className="absolute left-full ml-8 px-5 py-3 bg-[#1a1f2e] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all border border-white/10 z-[100] whitespace-nowrap shadow-3xl translate-x-4 group-hover:translate-x-0">
                   {item.label}
                 </div>
               )}
             </NavLink>
           ))}
        </nav>

        {/* User Identity Section */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02]">
           <div className={cn("flex items-center gap-5 p-4 rounded-[1.75rem] bg-white/5 border border-white/10", !sidebarOpen && "justify-center")}>
              <div className="h-12 w-12 rounded-[1rem] bg-[#1a1f2e] flex items-center justify-center text-sm font-black text-[#00bbff] border border-white/10 shrink-0 shadow-inner">
                {user.name.charAt(0)}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                   <div className="text-[13px] font-bold text-white truncate">{user.name}</div>
                   <div className="text-[9px] text-[#00bbff]/80 uppercase tracking-widest font-black flex items-center gap-2 mt-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#00bbff] animate-pulse" />
                      {user.role}
                   </div>
                </div>
              )}
           </div>
           {sidebarOpen && (
             <button 
                onClick={() => { logout(); navigate("/login"); }} 
                className="w-full mt-8 flex items-center justify-center gap-4 py-4 text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-red-400/5 rounded-[1.25rem] border border-transparent hover:border-red-400/10"
             >
                <LogOut size={16} /> Sign Out
             </button>
           )}
        </div>
      </motion.aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#00bbff]/5 blur-[180px] rounded-full pointer-events-none translate-x-[25%] translate-y-[-25%]" />
        
        {/* Top Header */}
        <header className="h-28 bg-[#fefaf0]/80 backdrop-blur-3xl border-b border-[#1a1f2e]/5 flex items-center justify-between px-16 z-40 shrink-0 sticky top-0">
          <div className="flex items-center gap-12">
             <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="h-14 w-14 flex items-center justify-center bg-white hover:bg-[#00bbff]/10 rounded-[1.5rem] text-slate-400 hover:text-[#00bbff] transition-all border border-slate-200/60 shadow-sm active:scale-95"
             >
                <Menu size={24} />
             </button>
             <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em]">
                <span className="text-slate-400">Platform</span>
                <ChevronRight size={16} className="text-slate-300" />
                <span className="text-[#00bbff]">{currentSection}</span>
             </div>
          </div>

          <div className="flex items-center gap-12">
             {/* Search Portal */}
             <div className="hidden xl:flex items-center gap-5 bg-white border border-slate-200 rounded-[1.5rem] px-8 py-4 w-[450px] focus-within:border-[#00bbff]/40 focus-within:shadow-[0_20px_40px_-15px_rgba(0,187,255,0.15)] transition-all group shadow-sm">
                <Search size={20} className="text-slate-300 group-focus-within:text-[#00bbff] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search platform..." 
                  className="bg-transparent border-none text-[12px] font-bold uppercase tracking-widest focus:outline-none w-full text-slate-800 placeholder:text-slate-300" 
                />
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                   <Command size={11} className="text-slate-400" />
                   <span className="text-[10px] font-black text-slate-400">K</span>
                </div>
             </div>

             {/* Actions */}
             <div className="flex items-center gap-10">
                <button className="h-14 w-14 flex items-center justify-center bg-white hover:bg-[#00bbff]/10 rounded-[1.5rem] text-slate-400 hover:text-[#00bbff] relative transition-all border border-slate-200/60 group shadow-sm active:scale-95">
                   <Bell size={24} className="group-hover:rotate-12 transition-transform" />
                   <div className="absolute top-4 right-4 h-3 w-3 bg-[#00bbff] rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,187,255,0.6)]" />
                </button>
                <div className="h-12 w-px bg-slate-200/60" />
                <Link to="/profile" className="flex items-center gap-6 group">
                   <div className="text-right hidden sm:block">
                      <div className="text-[11px] font-black text-[#1a1f2e] uppercase tracking-[0.2em] mb-1.5 group-hover:text-[#00bbff] transition-colors">User Profile</div>
                      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                         Account Settings <ArrowRight size={11} />
                      </div>
                   </div>
                   <div className="h-14 w-14 rounded-[1.5rem] bg-[#1a1f2e] text-white flex items-center justify-center font-black text-lg border-4 border-white shadow-2xl group-hover:scale-110 transition-all">
                      {user.name.charAt(0)}
                   </div>
                </Link>
             </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-16 no-scrollbar relative z-10">
           <div className="max-w-[1800px] mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
