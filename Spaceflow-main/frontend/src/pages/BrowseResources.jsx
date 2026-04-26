import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, BACKEND_URL } from "../lib/api";
import { 
  Search, Filter, MapPin, Users, Zap, Loader2, 
  ChevronRight, Box, ArrowUpRight, Grid, List, SlidersHorizontal
} from "lucide-react";

export default function BrowseResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data } = await api.get("/resources");
        setResources(data.filter(r => r.active));
      } catch (_) {}
      setLoading(false);
    };
    fetchResources();
  }, []);

  const filtered = resources.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                       r.type.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.type === filterType;
    return matchSearch && matchType;
  });

  const getResourceImg = (r) => r.image_url?.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin w-12 h-12 text-primary/20" />
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in-up">
      
      {/* ── Page Header & Search ── */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
           <div className="space-y-4">
              <div className="sf-badge !bg-primary/10 !text-primary !border-primary/20">Resource Intelligence</div>
              <h1 className="text-5xl font-black tracking-tight">Marketplace</h1>
              <p className="text-muted-foreground font-medium max-w-lg">Provision high-performance assets for your team's immediate operational needs.</p>
           </div>
           
           <div className="flex items-center gap-2 p-1.5 bg-accent/40 backdrop-blur-md rounded-2xl border border-border/40">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-background text-primary shadow-lg border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-background text-primary shadow-lg border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List size={18} />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-3 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Search by asset name, location, or protocol..." 
                className="sf-input pl-14 py-5 text-base shadow-2xl shadow-primary/[0.02]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <div className="relative">
              <SlidersHorizontal className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select 
                className="sf-input pl-14 py-5 appearance-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="all">All Ecosystems</option>
                <option value="desk">Workstations</option>
                <option value="room">Meeting Hubs</option>
                <option value="equipment">Specialized Gear</option>
              </select>
           </div>
        </div>
      </div>

      {/* ── Resource Grid ── */}
      {filtered.length === 0 ? (
        <div className="sf-card py-32 flex flex-col items-center justify-center text-center p-12 bg-sf-bg-soft/40 border-dashed">
           <Box size={48} className="text-muted-foreground/20 mb-6" />
           <h3 className="text-xl font-bold">No assets match your query.</h3>
           <p className="text-muted-foreground text-sm font-medium mt-2">Adjust your search parameters or explore the global registry.</p>
           <button onClick={() => {setSearch(""); setFilterType("all");}} className="sf-btn-secondary mt-8 px-8 py-3 text-[10px] uppercase tracking-widest">Reset Parameters</button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10" : "space-y-6"}>
           {filtered.map(r => (
             <Link 
               key={r.id} 
               to={`/book/${r.id}`} 
               className={`
                 sf-card group overflow-hidden transition-all duration-700
                 ${viewMode === "list" ? "flex items-center gap-8 p-6" : "flex flex-col h-full"}
               `}
             >
                <div className={`
                  relative overflow-hidden bg-black shrink-0
                  ${viewMode === "list" ? "h-32 w-48 rounded-2xl" : "aspect-video"}
                `}>
                   {r.image_url 
                     ? <img src={getResourceImg(r)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" alt={r.name} />
                     : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20 grayscale">🏢</div>
                   }
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                   <div className="absolute top-4 right-4 z-10">
                      <div className="sf-badge !bg-background/80 !backdrop-blur-md !text-foreground !border-border/50">
                        {r.type}
                      </div>
                   </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                   <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                         <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors truncate">{r.name}</h3>
                         <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1">
                            <ArrowUpRight size={20} className="text-primary" />
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2">
                         <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <MapPin size={14} className="text-primary/40" /> {r.location}
                         </div>
                         <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <Users size={14} className="text-primary/40" /> Capacity: {r.capacity}
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provision Ready</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                         Initialize <ChevronRight size={14} />
                      </span>
                   </div>
                </div>
             </Link>
           ))}
        </div>
      )}
    </div>
  );
}
