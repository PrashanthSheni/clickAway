import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail, BACKEND_URL } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Loader2, QrCode, Ban, Clock4, KeyRound, Calendar, User, Building2, Users, Activity, Shield, Box, ChevronRight, Send, MapPin, ChevronLeft, Smartphone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

function TimelineItem({ ev, isLast }) {
  return (
    <div className="flex gap-8 group" data-testid={`timeline-${ev.id}`}>
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-[#00bbff] mt-2 flex-shrink-0 shadow-[0_0_12px_rgba(0,187,255,0.5)] border-2 border-white" />
        {!isLast && <div className="w-[2px] flex-1 bg-slate-100 mt-2" />}
      </div>
      <div className="flex-1 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
           <div className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-widest group-hover:text-[#00bbff] transition-colors">
             {ev.event_type.replace(/_/g, " ")}
           </div>
           <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(ev.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
        </div>
        <div className="text-[11px] text-slate-400 font-bold mb-4 uppercase tracking-widest">{new Date(ev.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</div>
        {ev.message && (
           <div className="text-sm text-slate-500 bg-[#f5f5f4] rounded-[1.5rem] px-6 py-5 border border-slate-100 font-medium leading-relaxed italic shadow-inner">
             "{ev.message}"
           </div>
        )}
        <div className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 mt-5 group-hover:text-slate-400 transition-colors">
          {ev.from_state.replace(/_/g, " ")} <ChevronRight size={14} className="text-[#00bbff]" /> {ev.to_state.replace(/_/g, " ")}
        </div>
      </div>
    </div>
  );
}

function InfoStat({ label, value, icon: Icon }) {
  return (
    <div className="bg-[#f5f5f4] border border-slate-100 rounded-[2rem] p-8 flex items-start gap-6 hover:border-[#00bbff]/30 transition-all group shadow-sm">
      <div className="h-14 w-14 rounded-2xl bg-[#fafaf9] flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:text-[#00bbff] transition-colors shadow-sm">
        <Icon size={22} className="text-slate-400 group-hover:text-[#00bbff]" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2.5">{label}</div>
        <div className="text-lg font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors tracking-tight">{value}</div>
      </div>
    </div>
  );
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [events, setEvents] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [resource, setResource] = useState(null);
  const [checkinCode, setCheckinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [extOpen, setExtOpen] = useState(false);
  const [extEnd, setExtEnd] = useState("");
  const [extReason, setExtReason] = useState("");

  const load = async () => {
    const [b, ev] = await Promise.all([api.get(`/bookings/${id}`), api.get(`/bookings/${id}/events`)]);
    setBooking(b.data);
    setEvents(ev.data);
    if (b.data.resource_id) {
      try { const { data } = await api.get(`/resources/${b.data.resource_id}`); setResource(data); } catch (_) {}
    }
    if (b.data.qr_token) {
      try { const { data } = await api.get(`/bookings/${id}/qr`); setQrData(data); } catch (_) {}
    }
  };

  useEffect(() => { load(); }, [id]);

  const doCheckin = async () => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/checkin`, { code: checkinCode });
      toast.success("Checked in successfully");
      await load();
    } catch (e) {
      toast.error("Check-in failed", { description: formatApiErrorDetail(e.response?.data?.detail) || e.message });
    } finally { setBusy(false); }
  };

  const cancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      await load();
    } catch (e) {
      toast.error("Failed to cancel", { description: formatApiErrorDetail(e.response?.data?.detail) || e.message });
    } finally { setBusy(false); }
  };

  const extend = async () => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/extend`, { new_end_time: new Date(extEnd).toISOString(), reason: extReason });
      toast.success("Extension request sent");
      setExtOpen(false);
      await load();
    } catch (e) {
      toast.error("Extension request failed", { description: formatApiErrorDetail(e.response?.data?.detail) || e.message });
    } finally { setBusy(false); }
  };

  if (!booking) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Booking Details</p>
    </div>
  );

  const isOwner = booking.user_id === user.id;
  const canCheckin = ["approved", "no_show_warning"].includes(booking.state);
  const canCancel = !["cancelled", "completed", "rejected", "no_show"].includes(booking.state);
  const canExtend = isOwner && ["approved", "checked_in"].includes(booking.state);
  const resourceImage = resource?.image_url;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-6">
           <Link to="/bookings" className="h-14 w-14 bg-[#fafaf9] border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#00bbff] hover:border-[#00bbff]/30 transition-all shadow-sm active:scale-95 group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
           </Link>
           <div>
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Booking Activity</span>
              </div>
              <h1 className="text-5xl font-plus font-bold text-[#1a1f2e] tracking-tight">Booking Details.</h1>
           </div>
        </div>
      </header>

      {/* Resource Banner */}
      <div className="h-80 md:h-[450px] rounded-[4rem] overflow-hidden relative border border-slate-200 shadow-2xl group">
        {resourceImage ? (
          <img
            src={resourceImage.startsWith("http") ? resourceImage : `${BACKEND_URL}${resourceImage}`}
            alt={booking.resource_name}
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#f5f5f4] flex items-center justify-center">
             <Building2 size={120} className="text-slate-100" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <div className="flex items-center gap-4 mb-5">
               <div className="px-5 py-1.5 bg-[#00bbff] text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#00bbff]/40">Confirmed Space</div>
            </div>
            <h2 className="text-5xl md:text-7xl font-plus font-bold text-white tracking-tight leading-none">{booking.resource_name}</h2>
            {booking.title && <p className="text-white/80 text-xl mt-6 font-medium italic">"{booking.title}"</p>}
          </div>
          <div className="scale-125 origin-bottom-left md:origin-bottom-right shadow-2xl">
             <BookingStateBadge state={booking.state} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 items-start">
        {/* Main Details */}
        <div className="xl:col-span-2 space-y-12">
          <div className="bg-[#fafaf9] rounded-[3rem] border border-slate-200 p-12 shadow-xl space-y-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] text-[#1a1f2e] pointer-events-none scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
               <Box size={240} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <InfoStat label="Start Time" value={new Date(booking.start_time).toLocaleString()} icon={Calendar} />
              <InfoStat label="End Time" value={new Date(booking.end_time).toLocaleString()} icon={Calendar} />
              <InfoStat label="Booked By" value={booking.user_name} icon={User} />
              <InfoStat label="Capacity" value={`${booking.capacity_requested} Space${booking.capacity_requested > 1 ? 's' : ''}`} icon={Users} />
            </div>

            {booking.notes && (
              <div className="space-y-6 relative z-10 pt-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.5em] text-slate-300 ml-4">Notes</div>
                <div className="bg-[#f5f5f4] border border-slate-100 rounded-[2rem] px-10 py-8 text-[15px] text-slate-500 italic leading-relaxed font-medium shadow-inner">
                  "{booking.notes}"
                </div>
              </div>
            )}

            {booking.approval_note && (
              <div className="space-y-6 relative z-10 pt-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#00bbff] ml-4">Admin Note</div>
                <div className="bg-[#00bbff]/5 border border-[#00bbff]/10 rounded-[2rem] px-10 py-8 text-[15px] text-[#00bbff] font-bold leading-relaxed shadow-sm italic">
                  {booking.approval_note}
                </div>
              </div>
            )}
          </div>

          {/* Check-in Portal */}
          {canCheckin && isOwner && (
            <div className="bg-[#1a1f2e] rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group border-4 border-white shadow-black/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                 <Smartphone size={100} className="text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="h-3 w-3 rounded-full bg-[#00bbff] animate-pulse" />
                   <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.4em]">Check-in</h3>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed max-w-sm">Please enter your 6-digit check-in code to confirm your arrival and secure this space.</p>
                
                <div className="flex flex-col sm:flex-row gap-8">
                  <input
                    value={checkinCode}
                    onChange={(e) => setCheckinCode(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="flex-1 bg-slate-800 border-2 border-slate-700 focus:border-[#00bbff]/60 rounded-2xl px-10 py-6 text-4xl font-mono font-bold tracking-[0.6em] text-center text-white outline-none transition-all shadow-inner"
                  />
                  <button
                    onClick={doCheckin}
                    disabled={busy || checkinCode.length !== 6}
                    className="bg-[#fafaf9] text-[#1a1f2e] px-12 py-6 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#00bbff] hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-20 shadow-2xl active:scale-95"
                  >
                    {busy ? <Loader2 size={24} className="animate-spin" /> : "Check In Now"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Management Actions */}
          <div className="flex flex-wrap gap-6 pt-6">
            {canCancel && (
              <button onClick={cancel} disabled={busy} className="bg-[#fafaf9] text-red-500 hover:bg-red-500 hover:text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border-2 border-red-50 shadow-sm flex items-center gap-4 active:scale-95">
                <Ban size={18} /> Cancel Booking
              </button>
            )}
            {canExtend && !extOpen && (
              <button
                onClick={() => {
                  setExtOpen(true);
                  const d = new Date(booking.end_time);
                  d.setMinutes(d.getMinutes() + 30);
                  const pad = (n) => String(n).padStart(2, "0");
                  setExtEnd(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                }}
                className="bg-[#1a1f2e] text-white hover:bg-[#00bbff] px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl flex items-center gap-4 active:scale-95"
              >
                <Clock4 size={18} className="text-[#00bbff]" /> Extend Time
              </button>
            )}
          </div>

          <AnimatePresence>
            {extOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#fafaf9] rounded-[3.5rem] border-2 border-slate-100 p-12 shadow-2xl space-y-10 overflow-hidden relative"
              >
                <div className="flex items-center justify-between">
                   <h3 className="text-[11px] font-bold text-[#00bbff] uppercase tracking-[0.5em] ml-2">Extend Booking</h3>
                   <button onClick={() => setExtOpen(false)} className="h-10 w-10 flex items-center justify-center bg-[#f5f5f4] rounded-xl text-slate-300 hover:text-[#1a1f2e] transition-all border border-slate-100 hover:border-slate-200">
                      <X size={18} />
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">New End Time</label>
                     <input type="datetime-local" value={extEnd} onChange={(e) => setExtEnd(e.target.value)} className="w-full bg-[#f5f5f4] border border-slate-100 rounded-2xl px-8 py-5 text-[#1a1f2e] outline-none focus:border-[#00bbff]/40 transition-all font-bold shadow-inner" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Reason</label>
                     <input placeholder="e.g. Meeting running over..." value={extReason} onChange={(e) => setExtReason(e.target.value)} className="w-full bg-[#f5f5f4] border border-slate-100 rounded-2xl px-8 py-5 text-[#1a1f2e] outline-none focus:border-[#00bbff]/40 transition-all font-bold shadow-inner" />
                  </div>
                </div>
                <button onClick={extend} disabled={busy} className="w-full bg-[#00bbff] text-white h-20 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#0099dd] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95">
                   {busy ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> Submit Extension</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-12 h-fit sticky top-12">
          {qrData && (
            <div className="bg-[#fafaf9] rounded-[3rem] border border-slate-200 p-12 shadow-xl text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-[#00bbff] pointer-events-none group-hover:scale-125 transition-transform">
                 <QrCode size={120} />
              </div>
              <div className="flex items-center gap-4 mb-10 justify-center relative z-10">
                 <QrCode size={20} className="text-[#00bbff]" />
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Check-in QR Code</span>
              </div>
              <div className="bg-[#f5f5f4] p-8 rounded-[3rem] mb-12 group-hover:bg-[#fafaf9] group-hover:shadow-2xl transition-all duration-700 relative z-10 shadow-inner border border-slate-100 group-hover:border-slate-200">
                <img src={qrData.qr_image} alt="QR" className="w-full rounded-[2rem] shadow-sm" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300">Check-in Code</div>
                <div className="font-mono font-bold text-6xl tracking-[0.4em] text-[#1a1f2e] group-hover:text-[#00bbff] transition-all duration-500">
                   {qrData.code}
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs */}
          <div className="bg-[#fafaf9] rounded-[3rem] border border-slate-200 p-12 shadow-xl">
            <div className="flex items-center gap-4 mb-12">
               <Activity size={20} className="text-[#00bbff]" />
               <span className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-[0.4em]">Activity History</span>
            </div>
            {events.length === 0 ? (
              <div className="text-center py-16">
                 <Box size={48} className="mx-auto text-slate-50 mb-6" />
                 <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-slate-200">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-0 relative">
                {events.map((ev, i) => <TimelineItem key={ev.id} ev={ev} isLast={i === events.length - 1} />)}
              </div>
            )}
          </div>

          <div className="bg-[#1a1f2e] rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group border-4 border-white shadow-black/20">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-white group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Shield size={80} />
             </div>
             <div className="h-12 w-12 bg-[#fafaf9]/10 rounded-2xl flex items-center justify-center text-[#00bbff] mb-8 border border-white/10 shadow-inner">
                <Shield size={24} />
             </div>
             <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.4em] mb-4">Booking Rules</h4>
             <p className="text-slate-400 text-sm leading-relaxed font-medium">
               Please remember to check in within 10 minutes of your start time, or the space will be automatically released to others.
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
