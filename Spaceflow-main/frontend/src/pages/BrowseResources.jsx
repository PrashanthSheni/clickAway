import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatTime12hr, BACKEND_URL } from "../lib/api";
import { Search, Users, MapPin, Clock, Layers, SlidersHorizontal, Grid3X3, List, X, ChevronDown, Sparkles, Shield, Box, Globe, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const TYPE_ICONS = { room: "🏢", desk: "🪑", parking: "🚗", equipment: "⚙️" };

function ResourceCardGrid({ r }) {
  const imgSrc = r.image_url
    ? (r.image_url.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link
        to={`/book/${r.id}`}
        className="group block bg-[#fafaf9] rounded-[2.5rem] overflow-hidden border border-slate-200 hover:border-[#00bbff]/40 transition-all duration-500 shadow-sm hover:shadow-2xl relative"
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-slate-100">
          {imgSrc ? (
            <img 
              src={imgSrc} 
              alt={r.name} 
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-5xl opacity-10">{TYPE_ICONS[r.type] || "📦"}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
          
          <div className="absolute top-6 left-6 flex flex-wrap gap-2">
            <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#fafaf9]/90 backdrop-blur-md border border-slate-200 text-[#1a1f2e] shadow-sm">
              {r.type}
            </span>
            {r.requires_approval && (
              <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#00bbff] text-white shadow-lg shadow-[#00bbff]/30">
                Needs Approval
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-10">
          <div className="flex items-center gap-3 mb-5">
             <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Available Now</span>
          </div>
          <h3 className="font-plus text-3xl font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors mb-4 tracking-tight">{r.name}</h3>
          <p className="text-[15px] text-slate-500 font-medium line-clamp-2 min-h-[44px] leading-relaxed mb-8">{r.description || "No description provided for this resource."}</p>
          
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-2 group-hover:text-[#1a1f2e] transition-colors"><MapPin size={16} className="text-[#00bbff]" /> Floor {r.floor}</span>
            <span className="flex items-center gap-2 group-hover:text-[#1a1f2e] transition-colors"><Users size={16} className="text-[#00bbff]" /> {r.capacity} People</span>
            <span className="flex items-center gap-2 group-hover:text-[#1a1f2e] transition-colors"><Clock size={16} className="text-[#00bbff]" /> {formatTime12hr(r.availability_start)}</span>
          </div>

          {r.amenities?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {r.amenities.slice(0, 2).map(a => (
                <span key={a} className="px-3 py-1.5 bg-[#f5f5f4] border border-slate-100 rounded-xl text-[9px] font-bold text-slate-500 uppercase tracking-widest">{a}</span>
              ))}
              {r.amenities.length > 2 && <span className="px-3 py-1.5 bg-[#f5f5f4] border border-slate-100 rounded-xl text-[9px] font-bold text-slate-300 uppercase tracking-widest">+{r.amenities.length - 2} More</span>}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function ResourceRowList({ r }) {
  const imgSrc = r.image_url
    ? (r.image_url.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <Link
        to={`/book/${r.id}`}
        className="group flex items-center gap-10 bg-[#fafaf9] rounded-[2rem] border border-slate-200 p-8 hover:border-[#00bbff]/40 transition-all duration-300 shadow-sm hover:shadow-xl"
      >
        <div className="h-24 w-40 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 group-hover:border-[#00bbff]/20 transition-all">
          {imgSrc
            ? <img src={imgSrc} alt={r.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
            : <div className="w-full h-full flex items-center justify-center text-3xl opacity-10">{TYPE_ICONS[r.type] || "📦"}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-5 flex-wrap mb-3">
            <span className="font-plus text-3xl font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors tracking-tight">{r.name}</span>
            <span className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#f5f5f4] border border-slate-200 text-slate-500">{r.type}</span>
            {r.requires_approval && <span className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00bbff]/10 border border-[#00bbff]/20 text-[#00bbff]">Needs Approval</span>}
          </div>
          <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-5">{r.description}</p>
          <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-3 group-hover:text-[#1a1f2e] transition-colors"><MapPin size={16} className="text-[#00bbff]" /> Floor {r.floor}</span>
            <span className="flex items-center gap-3 group-hover:text-[#1a1f2e] transition-colors"><Users size={16} className="text-[#00bbff]" /> {r.capacity} Capacity</span>
            <span className="flex items-center gap-3 group-hover:text-[#1a1f2e] transition-colors"><Clock size={16} className="text-[#00bbff]" /> {formatTime12hr(r.availability_start)}–{formatTime12hr(r.availability_end)}</span>
          </div>
        </div>
        <div className="bg-[#f5f5f4] group-hover:bg-[#00bbff] text-slate-300 group-hover:text-white h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-inner group-hover:shadow-lg">
           <ArrowRight size={24} />
        </div>
      </Link>
    </motion.div>
  );
}

export default function BrowseResources() {
  const [resources, setResources] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [floor, setFloor] = useState("all");
  const [view, setView] = useState("grid");

  useEffect(() => {
    (async () => { try { const { data } = await api.get("/resources"); setResources(data); } catch(_) {} })();
  }, []);

  const floors = useMemo(() => Array.from(new Set(resources.map(r => r.floor))).sort((a, b) => a - b), [resources]);

  const filtered = useMemo(() =>
    resources.filter(r =>
      r.active &&
      (type === "all" || r.type === type) &&
      (floor === "all" || r.floor === parseInt(floor)) &&
      (q === "" || r.name.toLowerCase().includes(q.toLowerCase()) || (r.description || "").toLowerCase().includes(q.toLowerCase()))
    ), [resources, q, type, floor]);

  const activeTags = [
    ...(type !== "all" ? [{ label: type, clear: () => setType("all") }] : []),
    ...(floor !== "all" ? [{ label: `Floor ${floor}`, clear: () => setFloor("all") }] : []),
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-16 items-start pb-20">

      {/* ── Filter Section ── */}
      <aside className="w-full xl:w-96 min-w-[340px] flex-shrink-0 bg-[#fafaf9] border border-slate-200 rounded-[3rem] p-12 space-y-12 sticky top-12 self-start xl:h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar shadow-xl">
        <div>
          <div className="flex items-center gap-4 mb-6">
             <div className="h-2 w-2 rounded-full bg-[#00bbff] shadow-[0_0_10px_rgba(0,187,255,0.4)]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Resource Search</span>
          </div>
          <h2 className="font-plus text-5xl font-bold text-[#1a1f2e] mb-4 tracking-tight">Explore.</h2>
          <p className="text-sm text-slate-400 font-medium">{filtered.length} resources available for you</p>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00bbff] transition-colors" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search rooms, desks..."
            className="w-full bg-[#f5f5f4] border border-slate-200 hover:border-slate-300 focus:border-[#00bbff]/40 focus:bg-[#fafaf9] rounded-2xl pl-16 pr-8 py-5 text-[#1a1f2e] placeholder:text-slate-300 transition-all outline-none font-bold text-sm shadow-inner"
          />
        </div>

        {/* Type filter */}
        <div className="space-y-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300 ml-2">Resource Type</div>
          <div className="grid grid-cols-1 gap-3">
            {[["all","All Resources", <Globe size={18} />], ["room","Conference Rooms", <Box size={18} />], ["desk","Desks & Pods", <Grid3X3 size={18} />], ["parking","Parking Spaces", <MapPin size={18} />], ["equipment","Other Assets", <Shield size={18} />]].map(([k, label, icon]) => (
              <button
                key={k}
                onClick={() => setType(k)}
                className={cn(
                  "w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border group",
                  type === k 
                    ? "bg-[#00bbff] text-white border-[#00bbff] shadow-lg shadow-[#00bbff]/20" 
                    : "text-slate-500 border-slate-50 bg-[#f5f5f4] hover:bg-slate-100 hover:text-[#1a1f2e]"
                )}
              >
                <span className={cn("shrink-0 transition-colors", type === k ? "text-white" : "text-slate-300 group-hover:text-[#00bbff]")}>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Floor filter */}
        <div className="space-y-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300 ml-2">Location</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFloor("all")}
              className={cn(
                "col-span-2 text-center px-6 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border",
                floor === "all" ? "bg-[#00bbff] text-white border-[#00bbff] shadow-lg shadow-[#00bbff]/20" : "text-slate-500 border-slate-50 bg-[#f5f5f4] hover:bg-slate-100 hover:text-[#1a1f2e]"
              )}
            >
              All Floors
            </button>
            {floors.map(f => (
              <button
                key={f}
                onClick={() => setFloor(String(f))}
                className={cn(
                  "text-center px-6 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all border",
                  floor === String(f) ? "bg-[#00bbff] text-white border-[#00bbff] shadow-lg shadow-[#00bbff]/20" : "text-slate-500 border-slate-50 bg-[#f5f5f4] hover:bg-slate-100 hover:text-[#1a1f2e]"
                )}
              >
                Floor {f}
              </button>
            ))}
          </div>
        </div>

        {/* Clear all */}
        {activeTags.length > 0 && (
          <button
            onClick={() => { setType("all"); setFloor("all"); setQ(""); }}
            className="w-full text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300 hover:text-red-500 transition-all flex items-center justify-center gap-4 pt-8 border-t border-slate-100"
          >
            <X size={16} /> Clear All Filters
          </button>
        )}
      </aside>

      {/* ── Results Section ── */}
      <main className="flex-1 space-y-12 w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-10 pb-10 border-b-2 border-slate-100">
          <div className="flex items-center gap-4 flex-wrap">
            <AnimatePresence>
              {activeTags.map(tag => (
                <motion.span 
                  key={tag.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-4 px-6 py-2.5 bg-[#fafaf9] text-[#00bbff] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#00bbff]/20 shadow-sm"
                >
                  {tag.label}
                  <button onClick={tag.clear} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                </motion.span>
              ))}
            </AnimatePresence>
            {activeTags.length === 0 && (
               <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em]">Showing All Resources</span>
               </div>
            )}
          </div>
          
          {/* View toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-[1.5rem] border border-slate-200">
            <button 
              onClick={() => setView("grid")} 
              className={cn(
                "p-4 rounded-2xl transition-all shadow-sm",
                view === "grid" ? "bg-[#fafaf9] text-[#00bbff] shadow-xl scale-110" : "text-slate-300 hover:text-slate-500"
              )}
            >
              <Grid3X3 size={22} />
            </button>
            <button 
              onClick={() => setView("list")} 
              className={cn(
                "p-4 rounded-2xl transition-all shadow-sm",
                view === "list" ? "bg-[#fafaf9] text-[#00bbff] shadow-xl scale-110" : "text-slate-300 hover:text-slate-500"
              )}
            >
              <List size={22} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-48 text-center bg-[#fafaf9] border-2 border-dashed border-slate-100 rounded-[4rem] shadow-inner">
            <div className="h-24 w-24 bg-[#f5f5f4] rounded-[2.5rem] flex items-center justify-center mb-10 border border-slate-100">
              <Layers size={40} className="text-slate-200" />
            </div>
            <div className="text-4xl font-plus text-slate-300 font-bold tracking-tight">No Resources Found</div>
            <p className="text-slate-400 text-sm mt-6 max-w-sm font-medium leading-relaxed">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        )}

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
            {filtered.map(r => <ResourceCardGrid key={r.id} r={r} />)}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="space-y-8">
            {filtered.map(r => <ResourceRowList key={r.id} r={r} />)}
          </div>
        )}
      </main>
    </div>
  );
}
