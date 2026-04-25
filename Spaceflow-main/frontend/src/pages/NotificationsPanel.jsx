import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Bell, CheckCheck, Mail, ArrowRight, Activity, Shield, Sparkles, ChevronRight, Loader2, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function NotificationsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    try {
      await api.post("/notifications/read-all");
      load();
    } catch (_) {}
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Notifications</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-4xl pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-10 border-b-2 border-slate-100">
        <div>
           <div className="flex items-center gap-4 mb-4">
             <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Updates</span>
           </div>
           <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">Notifications.</h1>
           <p className="text-slate-400 text-xl font-medium mt-6">
             You have {items.length} {items.length === 1 ? "notification" : "notifications"} waiting for you.
           </p>
        </div>
        <button
          onClick={markAll}
          className="bg-[#fafaf9] text-slate-400 px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-slate-200 hover:text-[#1a1f2e] hover:border-slate-400 transition-all flex items-center gap-4 active:scale-95 shadow-sm"
        >
          <CheckCheck size={18} /> Mark all as read
        </button>
      </header>

      <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden group">
        <div className="divide-y divide-slate-50">
          {items.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center">
               <div className="h-24 w-24 bg-[#f5f5f4] rounded-[2.5rem] flex items-center justify-center mb-10 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                  <Inbox size={48} className="text-slate-100" />
               </div>
               <div className="text-4xl font-plus font-bold text-slate-300 tracking-tight">No notifications.</div>
               <p className="text-slate-400 text-sm mt-6 font-medium">You're all caught up! No new notifications at the moment.</p>
            </div>
          )}
          
          {items.map((n, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={n.id} 
              className={cn(
                "p-10 xl:p-12 transition-all group/item hover:bg-[#f5f5f4] relative",
                !n.read ? "bg-blue-50/20" : ""
              )}
            >
              {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00bbff] shadow-[0_0_10px_rgba(0,187,255,0.4)]" />}
              
              <div className="flex items-start justify-between gap-10">
                <div className="flex items-start gap-8">
                   <div className={cn(
                     "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border transition-all group-hover/item:rotate-6",
                     !n.read ? "bg-[#00bbff] text-white border-[#00bbff]" : "bg-[#f5f5f4] text-slate-200 border-slate-100"
                   )}>
                      {n.read ? <Mail size={22} /> : <Sparkles size={22} />}
                   </div>
                   <div className="space-y-3">
                     <div className={cn("text-xl font-bold tracking-tight", !n.read ? "text-[#1a1f2e]" : "text-slate-500")}>{n.title}</div>
                     <p className="text-slate-400 font-medium text-base max-w-2xl leading-relaxed">"{n.message}"</p>
                     <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                        <Activity size={14} className="text-[#00bbff]" />
                        {new Date(n.created_at).toLocaleString()}
                     </div>
                   </div>
                </div>
                
                {n.link && (
                  <Link to={n.link} className="h-12 w-12 bg-[#fafaf9] border border-slate-100 rounded-xl flex items-center justify-center text-[#00bbff] hover:bg-[#00bbff] hover:text-white transition-all shadow-sm active:scale-95 group/btn">
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40">
         <div className="bg-[#f5f5f4] border border-slate-100 rounded-[2.5rem] p-10 flex items-center gap-6 group hover:opacity-100 transition-all cursor-pointer">
            <div className="h-12 w-12 bg-[#fafaf9] rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#00bbff] transition-all shadow-inner">
               <Shield size={22} />
            </div>
            <div>
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#1a1f2e] transition-colors">Security Alerts</div>
               <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1">System and account security updates.</div>
            </div>
         </div>
         <div className="bg-[#f5f5f4] border border-slate-100 rounded-[2.5rem] p-10 flex items-center gap-6 group hover:opacity-100 transition-all cursor-pointer">
            <div className="h-12 w-12 bg-[#fafaf9] rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#00bbff] transition-all shadow-inner">
               <Activity size={22} />
            </div>
            <div>
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#1a1f2e] transition-colors">Booking Status</div>
               <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1">Updates on your active and upcoming bookings.</div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
