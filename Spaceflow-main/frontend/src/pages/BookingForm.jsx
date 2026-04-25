import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { api, formatApiErrorDetail, BACKEND_URL } from "../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Clock, MapPin, Users, Send, Target, Box, Zap, ChevronLeft, Shield, Calendar, Boxes, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

function toLocalInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingForm() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resource, setResource] = useState(null);

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 30 * 60000);
  defaultStart.setMinutes(0, 0, 0);
  defaultStart.setHours(defaultStart.getHours() + 1);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60000);

  const [form, setForm] = useState({
    title: searchParams.get("title") || "",
    notes: "",
    start_time: searchParams.get("prefillStart") || toLocalInput(defaultStart),
    end_time: searchParams.get("prefillEnd") || toLocalInput(defaultEnd),
    capacity_requested: 1,
  });
  const [recurring, setRecurring] = useState({ enabled: false, pattern: "daily", occurrences: 5 });
  const [recurringResult, setRecurringResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/resources/${resourceId}`);
        setResource(data);
      } catch (_) {}
    })();
  }, [resourceId]);

  useEffect(() => {
    if (!resource) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setValidating(true);
      try {
        const { data } = await api.post("/bookings/validate", {
          resource_id: resource.id,
          title: form.title,
          notes: form.notes,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
          capacity_requested: parseInt(form.capacity_requested) || 1,
        });
        setValidation(data);
      } catch (e) {
        setValidation(null);
      } finally {
        setValidating(false);
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [resource, form]);

  const applySuggestion = (s) => {
    setForm((f) => ({
      ...f,
      start_time: toLocalInput(new Date(s.start_time)),
      end_time: toLocalInput(new Date(s.end_time)),
    }));
    if (s.resource_id !== resourceId) {
      navigate(`/book/${s.resource_id}`);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRecurringResult(null);
    try {
      if (recurring.enabled && recurring.occurrences > 1) {
        const { data } = await api.post("/bookings/recurring", {
          resource_id: resource.id,
          title: form.title,
          notes: form.notes,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
          capacity_requested: parseInt(form.capacity_requested) || 1,
          pattern: recurring.pattern,
          occurrences: parseInt(recurring.occurrences),
        });
        setRecurringResult(data);
        if (data.created.length > 0) {
          toast.success(`${data.created.length} bookings created successfully`);
        } else {
          toast.error("Failed to create recurring bookings");
        }
        return;
      }
      const { data } = await api.post("/bookings", {
        resource_id: resource.id,
        title: form.title,
        notes: form.notes,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        capacity_requested: parseInt(form.capacity_requested) || 1,
      });
      toast.success(data.state === "approved" ? "Booking confirmed" : "Booking request sent");
      navigate(`/bookings/${data.id}`);
    } catch (e2) {
      toast.error("Booking Error", { description: formatApiErrorDetail(e2.response?.data?.detail) || e2.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Booking Form</p>
      </div>
    );
  }

  const canSubmit = form.title.trim().length >= 3 && validation && validation.ok && !submitting;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-6">
           <Link to="/browse" className="h-14 w-14 bg-[#fafaf9] border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#00bbff] hover:border-[#00bbff]/30 transition-all shadow-sm active:scale-95 group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
           </Link>
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Make a Booking</span>
              </div>
              <h1 className="text-5xl font-plus font-bold text-[#1a1f2e] tracking-tight">Book your space.</h1>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 items-start">
        <form onSubmit={onSubmit} className="xl:col-span-2 bg-[#fafaf9] rounded-[3rem] border border-slate-200 p-12 space-y-12 shadow-xl relative overflow-hidden group">
          {/* Header Info */}
          <div className="flex flex-col lg:flex-row gap-10 pb-12 border-b border-slate-100">
            {resource.image_url && (
              <div className="w-full lg:w-48 h-48 rounded-[2rem] bg-slate-100 overflow-hidden shrink-0 border border-slate-100 relative shadow-inner">
                <img 
                  src={resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`} 
                  alt={resource.name} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-5">
                 <div className="px-4 py-1.5 bg-[#00bbff]/10 border border-[#00bbff]/20 rounded-full text-[#00bbff] text-[10px] font-bold uppercase tracking-widest">Resource Details</div>
                 <div className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">Availability</div>
              </div>
              <h2 className="text-4xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">{resource.name}</h2>
              <div className="flex flex-wrap gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-2.5"><Box size={18} className="text-[#00bbff]" /> {resource.type}</span>
                <span className="flex items-center gap-2.5"><MapPin size={18} className="text-[#00bbff]" /> Floor {resource.floor}</span>
                <span className="flex items-center gap-2.5"><Users size={18} className="text-[#00bbff]" /> Capacity {resource.capacity}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Booking Title <span className="text-[#00bbff]">*</span></label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Team Sync, Focus Time..."
                className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/50 focus:bg-[#fafaf9] rounded-2xl px-8 py-5 text-[#1a1f2e] placeholder:text-slate-300 outline-none transition-all font-bold text-lg shadow-inner"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Start Time</label>
                <div className="relative group/input">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-[#00bbff] transition-colors" size={20} />
                  <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/50 focus:bg-[#fafaf9] rounded-2xl pl-16 pr-8 py-5 text-[#1a1f2e] outline-none transition-all font-bold shadow-inner"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">End Time</label>
                <div className="relative group/input">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-[#00bbff] transition-colors" size={20} />
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/50 focus:bg-[#fafaf9] rounded-2xl pl-16 pr-8 py-5 text-[#1a1f2e] outline-none transition-all font-bold shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            {resource.type === "parking" && (
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Spaces Needed</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity_requested}
                  onChange={(e) => setForm({ ...form, capacity_requested: e.target.value })}
                  className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/50 focus:bg-[#fafaf9] rounded-2xl px-8 py-5 text-[#1a1f2e] outline-none transition-all font-bold shadow-inner"
                />
              </div>
            )}

            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={5}
                className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/50 focus:bg-[#fafaf9] rounded-[2rem] px-8 py-6 text-[#1a1f2e] placeholder:text-slate-300 outline-none transition-all font-bold resize-none shadow-inner"
                placeholder="Any special requests or additional details?"
              />
            </div>

            {/* Recurring */}
            <div className="pt-10 border-t-2 border-slate-50">
              <label className="inline-flex items-center gap-5 cursor-pointer group">
                <div className={cn("h-8 w-14 rounded-full bg-slate-100 relative transition-all border-2 border-slate-200", recurring.enabled && "bg-[#00bbff]/10 border-[#00bbff]/30")}>
                  <motion.div 
                    animate={{ x: recurring.enabled ? 24 : 0 }}
                    className={cn("h-6 w-6 rounded-full bg-slate-300 absolute top-0.5 left-0.5 shadow-sm transition-colors", recurring.enabled && "bg-[#00bbff]")}
                  />
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={recurring.enabled}
                  onChange={(e) => setRecurring((r) => ({ ...r, enabled: e.target.checked }))}
                />
                <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-slate-400 group-hover:text-[#1a1f2e] transition-colors">Repeat this booking</span>
              </label>
              
              <AnimatePresence>
                {recurring.enabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden"
                  >
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Repeat Pattern</label>
                      <select
                        value={recurring.pattern}
                        onChange={(e) => setRecurring((r) => ({ ...r, pattern: e.target.value }))}
                        className="w-full bg-[#f5f5f4] border border-slate-200 rounded-2xl px-8 py-5 text-[#1a1f2e] focus:border-[#00bbff]/40 outline-none font-bold appearance-none shadow-sm"
                      >
                        <option value="daily">Every Day</option>
                        <option value="weekday">Weekdays (Mon-Fri)</option>
                        <option value="weekly">Every Week</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Number of Occurrences (Max 30)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={recurring.occurrences}
                        onChange={(e) => setRecurring((r) => ({ ...r, occurrences: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) }))}
                        className="w-full bg-[#f5f5f4] border border-slate-200 rounded-2xl px-8 py-5 text-[#1a1f2e] outline-none font-bold shadow-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[#1a1f2e] text-white h-24 rounded-[2rem] font-bold text-xs uppercase tracking-[0.5em] hover:bg-[#00bbff] transition-all shadow-2xl hover:shadow-[#00bbff]/40 flex items-center justify-center gap-5 disabled:opacity-20 mt-10 active:scale-[0.98]"
            >
              {submitting ? <Loader2 size={28} className="animate-spin" /> : <><Send size={24} /> {recurring.enabled ? `Confirm Series (${recurring.occurrences}×)` : "Confirm Booking"}</>}
            </button>
          </div>
        </form>

        {/* Validation & Suggestions Sidebar */}
        <div className="space-y-12 h-fit sticky top-12">
          <div className="bg-[#fafaf9] rounded-[3rem] border border-slate-200 p-10 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className={cn("h-2.5 w-2.5 rounded-full", validating ? "bg-[#00bbff] animate-pulse" : "bg-slate-100")} />
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Checking Availability</span>
              </div>
              {validating && <Loader2 size={18} className="animate-spin text-[#00bbff]" />}
            </div>

            <AnimatePresence mode="wait">
              {!validation ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                   <Target size={48} className="mx-auto text-slate-100 mb-6" />
                   <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">Checking details...</p>
                </motion.div>
              ) : validation.ok ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="bg-[#00bbff]/5 border border-[#00bbff]/20 rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-6 shadow-inner">
                    <div className="h-16 w-16 bg-[#00bbff] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#00bbff]/30">
                       <CheckCircle2 size={32} strokeWidth={3} />
                    </div>
                    <div>
                       <div className="text-2xl font-bold text-[#1a1f2e] tracking-tight">Resource Available</div>
                       <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Schedule check complete</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                     {validation.auto_approve && (
                       <div className="flex items-center gap-4 px-6 py-4 bg-[#1a1f2e] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
                          <Zap size={16} className="text-[#00bbff]" /> Auto-Approved
                       </div>
                     )}
                     {validation.requires_approval && !validation.auto_approve && (
                       <div className="flex items-center gap-4 px-6 py-4 bg-[#fafaf9] border border-amber-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-amber-600 shadow-sm">
                          <Shield size={16} className="text-amber-500" /> Manager Approval Required
                       </div>
                     )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {validation.errors.map((e, i) => (
                    <div key={i} className="flex gap-5 p-6 bg-red-50 border border-red-100 rounded-[1.5rem] shadow-sm">
                      <AlertCircle size={24} className="text-red-500 shrink-0" />
                      <span className="text-[13px] text-red-900 font-bold leading-relaxed">{e.message}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {validation?.warnings?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 space-y-4"
                >
                  {validation.warnings.map((w, i) => (
                    <div key={i} className="flex gap-5 p-6 bg-amber-50 border border-amber-100 rounded-[1.5rem] shadow-sm">
                      <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                      <span className="text-[13px] text-amber-900 font-bold leading-relaxed">{w.message}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {validation?.suggestions?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 ml-4">
                   <Sparkles size={20} className="text-[#00bbff]" />
                   <span className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-[0.4em]">Suggested Alternatives</span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {validation.suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, x: 8 }}
                      onClick={() => applySuggestion(s)}
                      className="w-full text-left p-8 bg-[#fafaf9] border border-slate-200 rounded-[2.5rem] hover:border-[#00bbff]/50 transition-all shadow-xl group active:scale-95"
                    >
                      <div className="flex items-center justify-between mb-5">
                         <div className="text-[10px] font-bold text-[#00bbff] uppercase tracking-widest px-4 py-1.5 bg-[#00bbff]/10 rounded-xl border border-[#00bbff]/10">{s.reason}</div>
                         <ArrowRight size={18} className="text-slate-200 group-hover:text-[#00bbff] transition-all" />
                      </div>
                      <div className="text-2xl font-plus font-bold text-[#1a1f2e] mb-3 group-hover:text-[#00bbff] transition-colors">{s.resource_name}</div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-3">
                        <Clock size={16} className="text-[#00bbff]" /> {new Date(s.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {new Date(s.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
