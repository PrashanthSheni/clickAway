import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Wrench, Trash2, X, Loader2, Upload, Image as ImageIcon, Box, Building2, Users, MapPin, Clock, Shield, Activity, ChevronRight, Ban, Send, Smartphone, AlertTriangle, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const EMPTY_RES = {
  name: "", type: "room", description: "", floor: 1, building: "HQ",
  capacity: 1, amenities: [], image_url: "",
  availability_start: "08:00", availability_end: "20:00",
  x: 40, y: 40, requires_approval: false, active: true,
  policy: { max_duration_minutes: 240, min_advance_minutes: 0, max_advance_days: 30,
           allowed_departments: [], allowed_roles: [] },
};

function ResourceDialog({ open, initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_RES);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setForm(initial || EMPTY_RES), [initial, open]);
  if (!open) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      upd("image_url", data.url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, amenities: Array.isArray(form.amenities) ? form.amenities : String(form.amenities).split(",").map((s) => s.trim()).filter(Boolean) };
      if (form.id) {
        await api.put(`/resources/${form.id}`, payload);
      } else {
        await api.post(`/resources`, payload);
      }
      toast.success("Resource saved successfully");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updPolicy = (k, v) => setForm((f) => ({ ...f, policy: { ...(f.policy || EMPTY_RES.policy), [k]: v } }));

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1f2e]/60 backdrop-blur-xl flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#fafaf9] rounded-[4rem] border-4 border-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-12 py-10 border-b border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-[#1a1f2e] pointer-events-none font-bold text-6xl">
             {form.id ? "EDIT" : "NEW"}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Resource Details</span>
            </div>
            <h2 className="text-4xl font-plus font-bold text-[#1a1f2e] tracking-tight">{form.id ? "Edit Resource" : "Add New Resource"}</h2>
          </div>
          <button onClick={onClose} className="h-12 w-12 bg-[#f5f5f4] rounded-2xl flex items-center justify-center text-slate-300 hover:text-[#1a1f2e] transition-all border border-slate-100 hover:border-slate-200"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-2 space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Resource Name</label>
              <input value={form.name} onChange={(e) => upd("name", e.target.value)} className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/40 focus:bg-[#fafaf9] rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner" placeholder="E.g. Executive Boardroom" />
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Type</label>
              <select value={form.type} onChange={(e) => upd("type", e.target.value)} className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/40 focus:bg-[#fafaf9] rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner appearance-none cursor-pointer">
                <option value="room">Meeting Room</option>
                <option value="desk">Workstation (Desk)</option>
                <option value="parking">Parking Space</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => upd("capacity", parseInt(e.target.value))} className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/40 focus:bg-[#fafaf9] rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none transition-all shadow-inner" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10">
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Floor</label>
              <input type="number" value={form.floor} onChange={(e) => upd("floor", parseInt(e.target.value))} className="w-full bg-[#f5f5f4] border border-slate-100 rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
            </div>
            <div className="space-y-4">
               <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Available From</label>
               <input type="time" value={form.availability_start} onChange={(e) => upd("availability_start", e.target.value)} className="w-full bg-[#f5f5f4] border border-slate-100 rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
            </div>
            <div className="space-y-4">
               <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Available Until</label>
               <input type="time" value={form.availability_end} onChange={(e) => upd("availability_end", e.target.value)} className="w-full bg-[#f5f5f4] border border-slate-100 rounded-[1.5rem] px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Description</label>
            <textarea value={form.description} onChange={(e) => upd("description", e.target.value)} rows={3} className="w-full bg-[#f5f5f4] border border-slate-100 focus:border-[#00bbff]/40 focus:bg-[#fafaf9] rounded-[2rem] px-10 py-8 text-[#1a1f2e] font-medium outline-none transition-all shadow-inner resize-none" placeholder="Add details about the space..." />
          </div>

          {/* Image */}
          <div className="bg-[#f5f5f4] border border-slate-100 rounded-[3.5rem] p-10 space-y-8">
            <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Resource Image</label>
            <div className="flex items-center gap-10">
              <div className="w-40 h-40 rounded-[2.5rem] bg-[#fafaf9] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-sm relative group/img">
                {form.image_url ? (
                  <img 
                    src={form.image_url.startsWith("http") ? form.image_url : `${BACKEND_URL}${form.image_url}`} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                  />
                ) : (
                  <ImageIcon size={40} className="text-slate-100" />
                )}
                {uploading && <div className="absolute inset-0 bg-[#fafaf9]/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-[#00bbff]" /></div>}
              </div>
              <div className="flex-1 space-y-4">
                <input type="file" id="resource-image-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                <label htmlFor="resource-image-upload" className="inline-flex items-center gap-4 px-10 py-5 bg-[#1a1f2e] text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#00bbff] cursor-pointer transition-all shadow-xl active:scale-95">
                  <Upload size={18} /> {form.image_url ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold ml-2">PNG, JPG or WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Policy */}
          <div className="pt-8 border-t-2 border-slate-50 space-y-10">
            <div className="flex items-center gap-4">
               <Shield size={18} className="text-[#00bbff]" />
               <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">Booking Rules</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Max Duration (min)</label>
                <input type="number" value={form.policy?.max_duration_minutes} onChange={(e) => updPolicy("max_duration_minutes", parseInt(e.target.value))} className="w-full bg-[#fafaf9] border border-slate-200 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Min Notice (min)</label>
                <input type="number" value={form.policy?.min_advance_minutes} onChange={(e) => updPolicy("min_advance_minutes", parseInt(e.target.value))} className="w-full bg-[#fafaf9] border border-slate-200 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Future Booking Limit (days)</label>
                <input type="number" value={form.policy?.max_advance_days} onChange={(e) => updPolicy("max_advance_days", parseInt(e.target.value))} className="w-full bg-[#fafaf9] border border-slate-200 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-10 pt-4">
               <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={cn("h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all", form.requires_approval ? "bg-[#00bbff] border-[#00bbff] text-white" : "border-slate-200 text-transparent")}>
                     <X size={16} strokeWidth={4} />
                  </div>
                  <input type="checkbox" className="hidden" checked={form.requires_approval} onChange={(e) => upd("requires_approval", e.target.checked)} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#1a1f2e] transition-colors">Requires Approval</span>
               </label>
               <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={cn("h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all", form.active ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent")}>
                     <X size={16} strokeWidth={4} />
                  </div>
                  <input type="checkbox" className="hidden" checked={form.active} onChange={(e) => upd("active", e.target.checked)} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#1a1f2e] transition-colors">Is Active</span>
               </label>
            </div>
          </div>
        </div>

        <div className="px-12 py-10 border-t border-slate-50 flex items-center justify-end gap-6 bg-[#f5f5f4]/30">
          <button onClick={onClose} className="px-8 text-[11px] font-bold text-slate-400 hover:text-[#1a1f2e] uppercase tracking-widest transition-all">Cancel</button>
          <button onClick={save} disabled={busy} className="bg-[#1a1f2e] text-white h-20 px-12 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#00bbff] transition-all shadow-xl active:scale-95 flex items-center gap-4 disabled:opacity-20">
            {busy ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> Save Resource</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MaintenanceDialog({ open, resource, onClose, onSaved }) {
  const [form, setForm] = useState({ start_time: "", end_time: "", reason: "" });
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!open || !resource) return null;

  const doPreview = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/maintenance/preview", {
        resource_id: resource.id,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        reason: form.reason,
      });
      setPreview(data);
    } catch (e) {
      toast.error("Failed to check for conflicts");
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    setBusy(true);
    try {
      await api.post("/maintenance", {
        resource_id: resource.id,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        reason: form.reason,
      });
      toast.success("Maintenance schedule saved");
      onSaved();
      onClose();
    } catch (e) {
      toast.error("Failed to set offline");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1f2e]/60 backdrop-blur-xl flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#fafaf9] rounded-[4rem] border-4 border-white w-full max-w-2xl p-12 xl:p-16 relative shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-red-500 pointer-events-none rotate-12">
           <Wrench size={200} />
        </div>
        
        <button onClick={onClose} className="absolute top-12 right-12 h-12 w-12 bg-[#f5f5f4] rounded-2xl flex items-center justify-center text-slate-300 hover:text-[#1a1f2e] transition-all border border-slate-100 hover:border-slate-200">
           <X size={24} />
        </button>

        <div className="mb-12 text-center relative z-10">
           <div className="inline-flex items-center gap-4 px-6 py-2 bg-red-50 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-500 mb-8 shadow-sm">Maintenance Schedule</div>
           <h2 className="text-4xl font-plus font-bold text-[#1a1f2e] tracking-tight">Set Offline: {resource.name}</h2>
        </div>

        <div className="space-y-10 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Start Date/Time</label>
                 <input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full bg-[#f5f5f4] border border-slate-100 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
              </div>
              <div className="space-y-4">
                 <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">End Date/Time</label>
                 <input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full bg-[#f5f5f4] border border-slate-100 rounded-2xl px-8 py-5 text-[#1a1f2e] font-bold outline-none" />
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300 ml-4">Reason for Maintenance</label>
              <textarea rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] rounded-[1.5rem] px-8 py-6 text-[#1a1f2e] font-medium outline-none transition-all resize-none shadow-inner" placeholder="e.g. Regular maintenance, repairs..." />
           </div>

           <button onClick={doPreview} disabled={busy || !form.start_time || !form.end_time} className="w-full h-16 bg-[#fafaf9] border-2 border-slate-100 text-slate-400 hover:text-[#1a1f2e] hover:border-slate-400 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3">
              <Activity size={18} /> Check for Conflicts
           </button>

           <AnimatePresence>
             {preview && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] space-y-6"
               >
                  <div className="flex items-center gap-4">
                     <AlertTriangle size={20} className="text-amber-500" />
                     <div className="text-amber-900 font-bold text-sm uppercase tracking-widest">{preview.affected_bookings.length} Booking Conflicts Found</div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-4">
                    {preview.affected_bookings.slice(0, 10).map((b) => (
                      <div key={b.id} className="text-[11px] text-amber-700 font-bold py-2 border-b border-amber-200/50 flex items-center justify-between">
                        <span>{b.user_name}</span>
                        <span className="italic">{new Date(b.start_time).toLocaleString()}</span>
                      </div>
                    ))}
                    {preview.affected_bookings.length > 10 && <div className="text-[9px] text-amber-400 uppercase font-bold text-center pt-2">+ {preview.affected_bookings.length - 10} additional bookings</div>}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex gap-6 pt-6">
              <button onClick={onClose} className="px-10 text-[11px] font-bold text-slate-400 hover:text-[#1a1f2e] uppercase tracking-widest transition-all">Cancel</button>
              <button onClick={apply} disabled={busy || !preview} className="flex-1 bg-red-500 text-white h-20 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] hover:bg-red-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 disabled:opacity-20">
                 {busy ? <Loader2 size={24} className="animate-spin" /> : <><Ban size={22} /> Confirm Maintenance</>}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResourceManagement() {
  const [resources, setResources] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [maintenanceFor, setMaintenanceFor] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/resources");
      setResources(data);
    } catch (_) {}
  };
  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource permanently?")) return;
    try {
       await api.delete(`/resources/${id}`);
       toast.success("Resource deleted");
       load();
    } catch (_) { toast.error("Failed to delete resource"); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-10 border-b-2 border-slate-100">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Resource Management</span>
          </div>
          <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight">All Resources.</h1>
          <p className="text-slate-400 text-xl font-medium mt-6 leading-relaxed">Manage meeting rooms, desks, and equipment across your enterprise.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="bg-[#1a1f2e] text-white h-20 px-12 rounded-[2rem] font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#00bbff] transition-all shadow-2xl hover:shadow-[#00bbff]/30 flex items-center gap-4 active:scale-95"
        >
          <Plus size={24} strokeWidth={3} /> Add New Resource
        </button>
      </header>

      <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden group">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f4]/50 border-b border-slate-100 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="px-10 py-8">Resource Name</th>
                <th className="px-10 py-8">Type</th>
                <th className="px-10 py-8">Location</th>
                <th className="px-10 py-8">Capacity</th>
                <th className="px-10 py-8">Booking Policy</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {resources.map((r) => (
                <tr key={r.id} className="group/row hover:bg-[#f5f5f4] transition-colors">
                  <td className="px-10 py-8">
                    <Link to={`/resource/${r.id}/calendar`} className="flex items-center gap-6 group/link">
                       <div className="h-16 w-16 rounded-[1.5rem] bg-[#f5f5f4] border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover/link:border-[#00bbff] transition-all">
                          {r.image_url ? (
                             <img src={r.image_url.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`} alt="Icon" className="w-full h-full object-cover group-hover/link:scale-110 transition-transform" />
                          ) : (
                             <Building2 size={24} className="text-slate-100" />
                          )}
                       </div>
                       <div className="font-bold text-xl text-[#1a1f2e] group-hover/link:text-[#00bbff] transition-colors tracking-tight">{r.name}</div>
                    </Link>
                  </td>
                  <td className="px-10 py-8 uppercase text-[11px] font-bold tracking-[0.2em] text-slate-400">{r.type}</td>
                  <td className="px-10 py-8 text-[13px] font-bold text-slate-600">Floor {r.floor} · {r.building}</td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-3 text-[#1a1f2e]">
                        <Users size={16} className="text-[#00bbff]" />
                        <span className="font-bold text-lg">{r.capacity}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                    {r.policy ? (
                       <div className="space-y-1">
                          <div className="text-[11px] font-bold text-[#1a1f2e] uppercase tracking-widest">{r.policy.max_duration_minutes}m Limit</div>
                          <div className="text-[10px] font-medium text-slate-400 italic">Horizon: {r.policy.max_advance_days}d</div>
                       </div>
                    ) : (
                       <span className="text-slate-100">—</span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-3">
                      {r.active ? (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">Active</span>
                      ) : (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200 shadow-sm">Offline</span>
                      )}
                      {r.requires_approval && (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00bbff]/10 text-[#00bbff] border border-[#00bbff]/20 shadow-sm">Needs Approval</span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
                      <button onClick={() => { setEditing(r); setDialogOpen(true); }} className="h-12 w-12 bg-[#fafaf9] border border-slate-100 rounded-xl text-slate-300 hover:text-[#00bbff] hover:border-[#00bbff] transition-all shadow-sm active:scale-95 flex items-center justify-center">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => setMaintenanceFor(r)} className="h-12 w-12 bg-[#fafaf9] border border-slate-100 rounded-xl text-slate-300 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm active:scale-95 flex items-center justify-center">
                        <Wrench size={18} />
                      </button>
                      <button onClick={() => del(r.id)} className="h-12 w-12 bg-[#fafaf9] border border-slate-100 rounded-xl text-slate-200 hover:text-red-500 hover:border-red-200 transition-all shadow-sm active:scale-95 flex items-center justify-center">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {dialogOpen && (
          <ResourceDialog
            open={dialogOpen}
            initial={editing}
            onClose={() => setDialogOpen(false)}
            onSaved={load}
          />
        )}
        {maintenanceFor && (
          <MaintenanceDialog
            open={!!maintenanceFor}
            resource={maintenanceFor}
            onClose={() => setMaintenanceFor(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
