import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { Ban, Search, Filter, Calendar, User, Building2, MoreVertical, ExternalLink, Activity, Shield, ChevronRight, Loader2, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function AllBookings() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/bookings?scope=all");
      setItems(data);
    } catch (_) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items.filter((b) =>
    (state === "all" || b.state === state) &&
    (q === "" || (b.resource_name || "").toLowerCase().includes(q.toLowerCase()) || (b.user_name || "").toLowerCase().includes(q.toLowerCase()))
  ), [items, state, q]);

  const forceCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const STATES = [
    "all", "pending_approval", "approved", "checked_in", "no_show_warning",
    "no_show", "rejected", "cancelled", "completed", "extension_pending",
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading All Bookings</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20"
    >
      <header className="pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Admin Overview</span>
        </div>
        <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">All Bookings.</h1>
        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
           A complete history and real-time view of all resource usage and bookings across the organization.
        </p>
      </header>

      {/* Filter Matrix */}
      <div className="bg-[#fafaf9] p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 items-center group">
        <div className="relative flex-1 group/search w-full">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-[#00bbff] transition-colors" />
           <input
             value={q}
             onChange={(e) => setQ(e.target.value)}
             placeholder="Search by user or resource name..."
             className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/30 rounded-2xl pl-14 pr-8 py-4 text-[11px] font-bold uppercase tracking-widest outline-none transition-all shadow-inner"
           />
        </div>
        <div className="h-10 w-px bg-slate-100 hidden md:block" />
        <div className="relative w-full md:w-80 group/filter">
           <Filter size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/filter:text-[#00bbff] transition-colors" />
           <select 
             value={state} 
             onChange={(e) => setState(e.target.value)} 
             className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/30 rounded-2xl pl-14 pr-8 py-4 text-[11px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all shadow-inner"
           >
             {STATES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>)}
           </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden group">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f4]/50 border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="px-10 py-8">User</th>
                <th className="px-10 py-8">Resource</th>
                <th className="px-10 py-8">Time</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((b) => (
                <tr key={b.id} className="group/row hover:bg-[#f5f5f4] transition-colors">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-[#f5f5f4] border border-slate-100 flex items-center justify-center font-bold text-slate-300 text-sm shadow-inner group-hover/row:bg-[#00bbff] group-hover/row:text-white group-hover/row:border-[#00bbff] transition-all">{b.user_name.charAt(0)}</div>
                        <div className="font-bold text-lg text-[#1a1f2e] group-hover/row:text-[#00bbff] transition-colors tracking-tight">{b.user_name}</div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                        <Building2 size={16} className="text-[#00bbff]" />
                        {b.resource_name}
                     </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                       <div className="text-[13px] font-bold text-[#1a1f2e] flex items-center gap-2">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(b.start_time).toLocaleDateString()}
                       </div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-5">
                          {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <BookingStateBadge state={b.state} />
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
                      <Link to={`/bookings/${b.id}`} className="h-10 w-10 bg-[#fafaf9] border border-slate-100 rounded-xl text-slate-300 hover:text-[#00bbff] hover:border-[#00bbff] transition-all shadow-sm active:scale-95 flex items-center justify-center">
                        <ExternalLink size={16} />
                      </Link>
                      {!["cancelled", "completed", "rejected", "no_show"].includes(b.state) && (
                        <button
                          onClick={() => forceCancel(b.id)}
                          className="h-10 w-10 bg-[#fafaf9] border border-slate-100 rounded-xl text-slate-200 hover:text-red-500 hover:border-red-200 transition-all shadow-sm active:scale-95 flex items-center justify-center"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <div className="h-16 w-16 bg-[#f5f5f4] rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                         <Database size={32} className="text-slate-100" />
                      </div>
                      <div className="text-2xl font-plus font-bold text-slate-300 tracking-tight">No Bookings Found</div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4">No bookings match your current search and filter criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
