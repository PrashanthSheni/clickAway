import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { KeyRound, Loader2, QrCode, Smartphone, Zap, Clock, Shield, Box, ArrowRight, Target, Activity, ChevronRight, X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function CheckIn() {
  const [bookings, setBookings] = useState([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeQr, setActiveQr] = useState(null); // { id, qr_image }
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const load = async () => {
    try {
      const { data } = await api.get("/bookings?scope=mine");
      const localNow = new Date();
      const soon = data.filter((b) => {
        if (!["approved", "no_show_warning"].includes(b.state)) return false;
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        // within 2h of start/still running
        return end > localNow && (start - localNow) < 2 * 60 * 60 * 1000;
      });
      setBookings(soon);
    } catch (_) {}
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (id) => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/checkin`, { code: code.trim() });
      toast.success("Checked in successfully");
      setCode("");
      setActiveQr(null);
      load();
    } catch (e) {
      toast.error("Check-in failed", { description: formatApiErrorDetail(e.response?.data?.detail) || e.message });
    } finally {
      setBusy(false);
    }
  };

  const getQr = async (id) => {
    try {
      const { data } = await api.get(`/bookings/${id}/qr`);
      setActiveQr({ id, qr_image: data.qr_image, code: data.code });
    } catch (e) {
      toast.error("Failed to generate check-in code");
    }
  };

  const simulateScan = async (id) => {
    setBusy(true);
    try {
      const { data } = await api.post(`/bookings/${id}/trigger-code`);
      toast.success("Override successful", { description: "Check-in code sent to your email." });
      setActiveQr({ ...activeQr, code: data.check_in_code });
      load();
    } catch (e) {
      toast.error("Override failed");
    } finally {
      setBusy(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16 max-w-5xl pb-20"
    >
      <header className="pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Booking Check-in</span>
        </div>
        <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">Check In.</h1>
        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
           Confirm your arrival to secure your space and prevent your booking from being automatically released.
        </p>
      </header>

      {bookings.length === 0 && (
        <motion.div 
          variants={item}
          className="bg-[#fafaf9] py-40 rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-12 shadow-inner group"
        >
          <div className="h-24 w-24 bg-[#f5f5f4] rounded-[2.5rem] flex items-center justify-center mb-10 border border-slate-100 group-hover:scale-110 transition-transform duration-700">
            <Smartphone size={48} className="text-slate-200" />
          </div>
          <div className="text-4xl font-plus font-bold text-slate-300 tracking-tight">No Check-ins Needed</div>
          <p className="text-slate-400 text-sm mt-6 max-w-sm font-medium leading-relaxed">You have no bookings starting soon that require check-in at this moment.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {bookings.map((b) => (
          <motion.div 
            key={b.id} 
            variants={item}
            className="bg-[#fafaf9] rounded-[3.5rem] border border-slate-200 p-10 xl:p-14 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-16 opacity-[0.02] text-[#1a1f2e] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
               <Activity size={180} />
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 pb-10 border-b border-slate-100 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-5">
                   <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff] animate-pulse" />
                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{b.resource_type}</span>
                </div>
                <Link to={`/bookings/${b.id}`} className="text-4xl font-plus font-bold text-[#1a1f2e] hover:text-[#00bbff] transition-colors tracking-tight">
                  {b.resource_name}
                </Link>
                <div className="flex flex-wrap items-center gap-8 mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-3"><Clock size={18} className="text-[#00bbff]" /> {new Date(b.start_time).toLocaleString()}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                  <span className="flex items-center gap-3"><Target size={18} className="text-slate-300" /> On-site Booking</span>
                </div>
              </div>
              <div className="scale-125 origin-top-right shadow-2xl">
                 <BookingStateBadge state={b.state} />
              </div>
            </div>

            <div className="mt-12 relative z-10">
              {(() => {
                const start = new Date(b.start_time);
                const isTenMinsBefore = now >= new Date(start.getTime() - 10 * 60 * 1000);

                if (!isTenMinsBefore) {
                  return (
                    <div className="bg-[#f5f5f4] border border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center text-center gap-8 shadow-inner">
                      <div className="h-20 w-20 bg-[#fafaf9] rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                         <Lock size={32} className="text-slate-200" />
                      </div>
                      <div>
                        <div className="text-[#1a1f2e] font-bold text-2xl tracking-tight mb-2">Check-in Not Available Yet</div>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.3em]">You can check in starting 10 minutes before your booking begins.</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-10">
                    <AnimatePresence mode="wait">
                      {activeQr?.id !== b.id ? (
                        <motion.button
                          key="reveal-btn"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => getQr(b.id)}
                          className="w-full bg-[#1a1f2e] text-white h-24 rounded-[2rem] font-bold text-xs uppercase tracking-[0.5em] hover:bg-[#00bbff] transition-all shadow-2xl hover:shadow-[#00bbff]/30 flex items-center justify-center gap-4 active:scale-[0.98]"
                        >
                          <QrCode size={24} /> View Check-in Code
                        </motion.button>
                      ) : (
                        <motion.div 
                          key="token-panel"
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="bg-[#f5f5f4] border border-slate-100 rounded-[3rem] p-12 xl:p-16 shadow-inner"
                        >
                          <div className="flex flex-col xl:flex-row items-center gap-16">
                            <div className="flex flex-col items-center gap-6 bg-[#fafaf9] p-10 rounded-[3.5rem] shadow-2xl shrink-0 group border-4 border-white">
                              <img src={activeQr.qr_image} alt="Token" className="w-48 h-48 group-hover:scale-105 transition-transform duration-700" />
                              <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300">QR Code</div>
                            </div>
                            
                            <div className="flex-1 w-full space-y-10">
                              <div>
                                 <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em]">Check-in Code</h4>
                                    <button onClick={() => setActiveQr(null)} className="h-10 w-10 flex items-center justify-center bg-[#fafaf9] border border-slate-200 rounded-xl text-slate-300 hover:text-red-500 transition-all shadow-sm"><X size={18} /></button>
                                 </div>
                                 {activeQr.code && (
                                   <div className="text-7xl font-bold tracking-[0.5em] text-[#1a1f2e] font-mono mb-6">
                                     {activeQr.code}
                                   </div>
                                 )}
                                 <p className="text-sm text-slate-400 font-medium leading-relaxed border-l-4 border-[#00bbff] pl-6 py-2">Scan the QR code at the resource terminal or enter the code manually below to confirm your arrival.</p>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t-2 border-white">
                                <input
                                  placeholder="••••••"
                                  value={code}
                                  onChange={(e) => setCode(e.target.value)}
                                  maxLength={6}
                                  className="flex-1 w-full bg-[#fafaf9] border-2 border-slate-200 focus:border-[#00bbff]/60 rounded-2xl px-8 py-6 text-center font-mono text-4xl font-bold tracking-[0.6em] text-[#1a1f2e] outline-none transition-all shadow-inner"
                                />
                                <button
                                  onClick={() => submit(b.id)}
                                  disabled={busy || code.length !== 6}
                                  className="w-full sm:w-auto bg-[#1a1f2e] text-white h-20 px-12 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#00bbff] transition-all flex items-center justify-center gap-4 disabled:opacity-20 shadow-xl active:scale-95"
                                >
                                  {busy ? <Loader2 size={24} className="animate-spin" /> : "Check In Now"}
                                </button>
                              </div>

                              {!b.check_in_code && !activeQr.code && (
                                <button
                                  onClick={() => simulateScan(b.id)}
                                  disabled={busy}
                                  className="flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] hover:text-red-500 transition-colors mt-4"
                                >
                                  <Zap size={14} className="text-amber-500" /> Admin Override [Developer Mode]
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
