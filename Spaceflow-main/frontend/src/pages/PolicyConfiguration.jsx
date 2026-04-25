import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { Save, Loader2, Shield, Target, Activity, Settings, ChevronRight, Zap, CheckCircle, AlertTriangle, Send, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export default function PolicyConfiguration() {
  const [resources, setResources] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [policy, setPolicy] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/resources");
      setResources(data);
      if (data[0]) setSelectedId(data[0].id);
    })();
  }, []);

  useEffect(() => {
    const r = resources.find((x) => x.id === selectedId);
    if (!r) return;
    setPolicy(r.policy || {
      max_duration_minutes: 240, min_advance_minutes: 0, max_advance_days: 30,
      allowed_departments: [], allowed_roles: [],
    });
    setSimulation(null);
  }, [selectedId, resources]);

  const upd = (k, v) => setPolicy((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/resources/${selectedId}/policy`, policy);
      toast.success("Policies updated successfully");
      const { data } = await api.get("/resources");
      setResources(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  const simulate = async () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60000);
    const end = new Date(start.getTime() + 60 * 60000);
    try {
      const { data } = await api.post("/bookings/validate", {
        resource_id: selectedId, title: "Policy Check",
        start_time: start.toISOString(), end_time: end.toISOString(),
        capacity_requested: 1,
      });
      setSimulation(data);
      toast.info("Policy check complete");
    } catch (e) {
      toast.error("Failed to check policy");
    }
  };

  if (!policy) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Policies</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20 max-w-6xl"
    >
      <header className="pb-10 border-b-2 border-slate-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Policy Management</span>
        </div>
        <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">Booking Rules.</h1>
        <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
           Manage how resources are booked, including duration limits, notice periods, and department restrictions.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
        {/* Selector Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-[#fafaf9] rounded-[3rem] border border-slate-200 p-10 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[#1a1f2e] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
               <Target size={120} />
            </div>
            <div className="flex items-center gap-4 mb-8">
               <Activity size={18} className="text-[#00bbff]" />
               <h3 className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-[0.4em]">Select Resource</h3>
            </div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-[#f5f5f4] border border-slate-100 rounded-2xl px-6 py-5 text-[#1a1f2e] font-bold outline-none appearance-none cursor-pointer hover:bg-[#fafaf9] hover:border-[#00bbff]/30 transition-all shadow-inner"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.name} (Floor {r.floor})</option>
              ))}
            </select>
            <div className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selecting a resource to update its booking rules...</div>
          </div>

          <div className="bg-[#1a1f2e] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border-4 border-white shadow-black/20">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-white group-hover:scale-125 transition-transform duration-1000">
                <Terminal size={100} />
             </div>
             <div className="h-14 w-14 bg-[#fafaf9]/10 rounded-2xl flex items-center justify-center text-[#00bbff] mb-8 border border-white/10 shadow-inner">
                <Shield size={24} />
             </div>
             <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.5em] mb-4">Notice</h4>
             <p className="text-slate-400 text-sm leading-relaxed font-medium">
               Changes to booking policies take effect immediately across the system for all new bookings.
             </p>
          </div>
        </div>

        {/* Configuration Terminal */}
        <div className="xl:col-span-2 bg-[#fafaf9] rounded-[4rem] border border-slate-200 p-12 xl:p-16 shadow-sm space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.01] text-[#1a1f2e] pointer-events-none font-bold text-9xl uppercase">RULES</div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Max Duration (min)</label>
              <input type="number" value={policy.max_duration_minutes} onChange={(e) => upd("max_duration_minutes", parseInt(e.target.value))} className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner" />
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Min Advance (min)</label>
              <input type="number" value={policy.min_advance_minutes} onChange={(e) => upd("min_advance_minutes", parseInt(e.target.value))} className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner" />
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Max Future Booking (days)</label>
              <input type="number" value={policy.max_advance_days} onChange={(e) => upd("max_advance_days", parseInt(e.target.value))} className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner" />
            </div>
          </div>

          <div className="space-y-8 pt-8 border-t border-slate-50">
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Allowed Departments</label>
              <input
                placeholder="e.g. Sales, Marketing, Engineering..."
                value={(policy.allowed_departments || []).join(", ")}
                onChange={(e) => upd("allowed_departments", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Allowed Roles</label>
              <input
                placeholder="e.g. employee, manager, admin..."
                value={(policy.allowed_roles || []).join(", ")}
                onChange={(e) => upd("allowed_roles", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/40 rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-10">
            <button onClick={save} disabled={busy} className="bg-[#1a1f2e] text-white h-20 px-12 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#00bbff] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 flex-1 disabled:opacity-20">
              {busy ? <Loader2 size={24} className="animate-spin" /> : <><Send size={22} /> Save Changes</>}
            </button>
            <button onClick={simulate} className="bg-[#fafaf9] text-slate-400 border-2 border-slate-100 h-20 px-12 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] hover:text-[#00bbff] hover:border-[#00bbff] transition-all flex items-center justify-center gap-4 active:scale-95">
              <Activity size={22} /> Check Policy
            </button>
          </div>

          <AnimatePresence>
            {simulation && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 bg-[#f5f5f4] border border-slate-100 rounded-[3rem] shadow-inner"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300 mb-6 ml-4">Check Result</div>
                {simulation.ok ? (
                  <div className="flex items-center gap-6 p-6 bg-[#fafaf9] rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-inner">
                       <CheckCircle size={28} />
                    </div>
                    <div>
                       <div className="text-xl font-bold text-emerald-700 tracking-tight">Policy Check Passed</div>
                       <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                          {simulation.auto_approve ? "Will be automatically approved" : simulation.requires_approval ? "Will require approval" : "Booking allowed"}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-[#fafaf9] rounded-2xl border border-red-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-4 text-red-500 font-bold text-sm uppercase tracking-widest mb-2">
                       <AlertTriangle size={20} /> Policy Conflict
                    </div>
                    <ul className="space-y-3">
                      {simulation.errors.map((e, i) => (
                        <li key={i} className="text-slate-500 text-sm font-medium italic border-l-4 border-red-100 pl-6 py-1">{e.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
