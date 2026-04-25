import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api, BACKEND_URL } from "../lib/api";
import { X, ArrowRight, Loader2, Users, MapPin, Clock, ChevronRight, Search, Activity, Box, Sparkles, Building2, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

// ── Config ───────────────────────────────────────────────────
const TYPE_CONFIG = {
  room:      { color: "#00bbff", bg: "bg-blue-50", border: "border-blue-100", label: "Meeting Room", icon: "🏢" },
  desk:      { color: "#10b981", bg: "bg-emerald-50", border: "border-emerald-100", label: "Desk", icon: "🪑" },
  parking:   { color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-100", label: "Parking Space", icon: "🚗" },
  equipment: { color: "#8b5cf6", bg: "bg-purple-50", border: "border-purple-100", label: "Equipment", icon: "⚙️" },
};

// ── Single space card ────────────────────────────────────────
function SpaceCard({ resource, isSelected, onClick }) {
  const [hovering, setHovering] = useState(false);
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.room;
  const active = isSelected || hovering;
  const img = resource.image_url
    ? (resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`)
    : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(resource)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn(
        "relative rounded-2xl p-4 cursor-pointer transition-all border-2 group",
        active 
          ? "bg-[#1a1f2e] border-[#1a1f2e] shadow-2xl shadow-black/20" 
          : "bg-[#fafaf9] border-slate-100 shadow-sm hover:border-[#00bbff]/30"
      )}
      style={{
        width: resource.type === "parking" ? 140 : resource.type === "desk" ? 110 : 160,
      }}
    >
      {/* Status dot */}
      <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />

      {/* Image thumbnail or icon */}
      <div className="h-24 w-full rounded-xl overflow-hidden mb-4 bg-[#f5f5f4] flex items-center justify-center border border-slate-100 group-hover:border-white/20 transition-all shadow-inner">
        {img ? (
          <img src={img} alt={resource.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
        ) : (
          <span className="text-3xl group-hover:scale-110 transition-transform">{cfg.icon}</span>
        )}
      </div>

      {/* Name */}
      <div className={cn(
        "text-[12px] font-bold uppercase tracking-widest truncate mb-2 text-center",
        active ? "text-white" : "text-[#1a1f2e]"
      )}>
        {resource.name}
      </div>

      {/* Stats */}
      <div className={cn(
        "flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest",
        active ? "text-slate-400" : "text-slate-300"
      )}>
        <span className="flex items-center gap-1"><Users size={10} /> {resource.capacity}</span>
        <span className="h-1 w-1 rounded-full bg-slate-200" />
        <span>Floor {resource.floor}</span>
      </div>

      {/* Action Overlay */}
      <AnimatePresence>
        {active && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 -bottom-3 flex justify-center"
          >
             <div className="px-5 py-1.5 bg-[#00bbff] text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-[#00bbff]/40">SELECT</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Zone section ─────────────────────────────────────────────
function Zone({ title, color, children, description }) {
  return (
    <div className="bg-[#fafaf9] border-2 border-slate-50 rounded-[3rem] p-10 relative shadow-sm group">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform" style={{ color }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.4em]">
              {title}
            </div>
            {description && <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1 italic">{description}</div>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-8">
        {children}
      </div>
    </div>
  );
}

// ── Side Panel ──────────────────────────────────────────
function SidePanel({ resource, onClose, onBook }) {
  if (!resource) return null;
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.room;
  const img = resource.image_url
    ? (resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`)
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#fafaf9] rounded-[3.5rem] border-2 border-slate-100 overflow-hidden shadow-2xl relative"
    >
      <div className="h-56 relative group">
        {img ? (
          <img src={img} alt={resource.name} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
        ) : (
          <div className="w-full h-full bg-[#f5f5f4] flex items-center justify-center">
             <Building2 size={64} className="text-slate-100" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button onClick={onClose} className="absolute top-6 right-6 h-10 w-10 bg-[#fafaf9]/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-[#fafaf9] hover:text-[#1a1f2e] transition-all">
           <X size={20} />
        </button>
        <div className="absolute bottom-6 left-8 right-8">
           <div className={cn("px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit mb-3 shadow-lg", cfg.bg, cfg.border)} style={{ color: cfg.color }}>
              {cfg.label}
           </div>
           <h3 className="text-3xl font-plus font-bold text-white leading-tight tracking-tight">{resource.name}</h3>
        </div>
      </div>

      <div className="p-10 space-y-10">
        {resource.description && (
          <p className="text-slate-400 text-sm font-medium leading-relaxed italic border-l-4 border-[#00bbff] pl-6">
            "{resource.description}"
          </p>
        )}

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: <MapPin size={16} />, val: `Level ${resource.floor}`, sub: "LOCATION" },
            { icon: <Users size={16} />,  val: resource.capacity,    sub: "CAPACITY" },
            { icon: <Clock size={16} />,  val: resource.availability_start || "08:00", sub: "AVAILABLE FROM" },
          ].map(({ icon, val, sub }) => (
            <div key={sub} className="bg-[#f5f5f4] border border-slate-100 rounded-2xl p-5 text-center shadow-inner group/stat hover:bg-[#fafaf9] hover:shadow-xl transition-all">
              <div className="text-[#00bbff] flex justify-center mb-3 group-hover/stat:scale-110 transition-transform">{icon}</div>
              <div className="text-lg font-bold text-[#1a1f2e] tracking-tighter">{val}</div>
              <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">{sub}</div>
            </div>
          ))}
        </div>

        {resource.amenities?.length > 0 && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2">Amenities</div>
            <div className="flex flex-wrap gap-2.5">
              {resource.amenities.map(a => (
                <span key={a} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[#fafaf9] border border-slate-100 text-slate-500 shadow-sm">{a}</span>
              ))}
            </div>
          </div>
        )}

        {resource.requires_approval && (
          <div className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-[1.5rem] text-amber-700 font-bold text-xs">
            <Activity size={18} className="animate-pulse" /> Requires Approval
          </div>
        )}

        <button
          onClick={() => onBook(resource.id)}
          className="w-full h-18 bg-[#1a1f2e] text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-[#00bbff] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 py-6"
        >
          Book Now <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function FloorMap() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeFloor, setActiveFloor] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/resources")
      .then(({ data }) => setResources(data.filter(r => r.active)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const floors = useMemo(() => [...new Set(resources.map(r => r.floor))].sort((a, b) => a - b), [resources]);

  const filtered = useMemo(() =>
    resources.filter(r =>
      (activeFloor === "all" || String(r.floor) === activeFloor) &&
      (search === "" || r.name.toLowerCase().includes(search.toLowerCase()))
    ), [resources, activeFloor, search]);

  const byType = useMemo(() => ({
    room:      filtered.filter(r => r.type === "room"),
    desk:      filtered.filter(r => r.type === "desk"),
    equipment: filtered.filter(r => r.type === "equipment"),
    parking:   filtered.filter(r => r.type === "parking"),
  }), [filtered]);

  const handleSelect = (r) => setSelected(prev => prev?.id === r.id ? null : r);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Maps</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      {/* Header & Matrix Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-10 border-b-2 border-slate-100">
        <div>
           <div className="flex items-center gap-4 mb-4">
             <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Live Office Map</span>
           </div>
           <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight">Floor Map.</h1>
           <p className="text-slate-400 text-xl font-medium mt-6">{filtered.length} Active resources available to book now.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-5 bg-[#fafaf9] p-3 rounded-[2rem] border border-slate-200 shadow-sm">
          {/* Search Matrix */}
          <div className="relative group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00bbff] transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for a space..."
              className="bg-[#f5f5f4] border border-slate-100 focus:bg-[#fafaf9] focus:border-[#00bbff]/30 rounded-2xl pl-14 pr-8 py-4 text-[11px] font-bold uppercase tracking-widest outline-none w-64 transition-all shadow-inner"
            />
          </div>
          <div className="h-10 w-px bg-slate-100 hidden sm:block" />
          {/* Floor Matrix */}
          <div className="flex gap-2">
            {["all", ...floors.map(String)].map(f => (
              <button key={f} onClick={() => { setActiveFloor(f); setSelected(null); }}
                className={cn(
                  "px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95",
                  activeFloor === f
                    ? "bg-[#1a1f2e] text-white shadow-xl"
                    : "text-slate-400 hover:text-[#1a1f2e] hover:bg-[#f5f5f4]"
                )}>
                {f === "all" ? "All Floors" : `Level ${f}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Matrix Surface */}
      <div className="flex flex-col xl:flex-row gap-12 items-start">
        {/* Floor Surface */}
        <div className="flex-1 w-full space-y-12">
          {byType.room.length > 0 && (
            <Zone title="Meeting Rooms" color="#00bbff" description="Perfect for team meetings and brainstorming.">
              {byType.room.map(r => (
                <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
              ))}
            </Zone>
          )}

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-10">
            {byType.desk.length > 0 && (
              <Zone title="Desks" color="#10b981" description="Individual workspaces for deep focus.">
                {byType.desk.map(r => (
                  <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                ))}
              </Zone>
            )}
            {byType.equipment.length > 0 && (
              <Zone title="Equipment" color="#8b5cf6" description="Laptops, projectors, and more.">
                {byType.equipment.map(r => (
                  <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                ))}
              </Zone>
            )}
          </div>

          {byType.parking.length > 0 && (
            <Zone title="Parking" color="#f59e0b" description="Secure parking spots for your commute.">
              {byType.parking.map(r => (
                <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
              ))}
            </Zone>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-48 bg-[#fafaf9] rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
               <div className="h-24 w-24 bg-[#f5f5f4] rounded-[2.5rem] flex items-center justify-center mb-10 border border-slate-100">
                  <Box size={48} className="text-slate-100" />
               </div>
               <div className="text-4xl font-plus font-bold text-slate-300 tracking-tight">No results found.</div>
               <p className="text-slate-400 text-sm mt-6 font-medium">Try adjusting your filters or search to find what you're looking for.</p>
            </div>
          )}
        </div>

        {/* Intelligence Side Panel */}
        <AnimatePresence>
          {selected && (
            <div className="w-full xl:w-[400px] h-fit xl:sticky xl:top-12">
              <SidePanel
                resource={selected}
                onClose={() => setSelected(null)}
                onBook={id => navigate(`/book/${id}`)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
