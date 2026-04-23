import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatTime12hr, BACKEND_URL } from "../lib/api";
import { Search, Users, MapPin, Clock, Layers, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from "lucide-react";

const TYPE_ICONS = { room: "🏢", desk: "🪑", parking: "🚗", equipment: "⚙️" };
const TYPE_COLORS = {
  room:      { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", ring: "ring-slate-300" },
  desk:      { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", ring: "ring-slate-300" },
  parking:   { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", ring: "ring-slate-300" },
  equipment: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", ring: "ring-slate-300" },
};

function ResourceCardGrid({ r }) {
  const c = TYPE_COLORS[r.type] || { bg: "bg-gray-100", text: "text-gray-600", ring: "ring-gray-300" };
  const imgSrc = r.image_url
    ? (r.image_url.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`)
    : null;

  return (
    <Link
      to={`/book/${r.id}`}
      data-testid={`resource-card-${r.id}`}
      className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-slate-400 transition-all duration-150"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {imgSrc ? (
          <img src={imgSrc} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">{TYPE_ICONS[r.type] || "📦"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
            {r.type}
          </span>
          {r.requires_approval && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white">
              Approval needed
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-sm group-hover:text-slate-600 transition-colors">{r.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">{r.description || "No description"}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1"><MapPin size={10} /> F{r.floor}</span>
          <span className="flex items-center gap-1"><Users size={10} /> {r.capacity}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {formatTime12hr(r.availability_start)}</span>
        </div>
        {r.amenities?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {r.amenities.slice(0, 3).map(a => (
              <span key={a} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-medium">{a}</span>
            ))}
            {r.amenities.length > 3 && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[9px]">+{r.amenities.length - 3}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

function ResourceRowList({ r }) {
  const c = TYPE_COLORS[r.type] || { bg: "bg-gray-100", text: "text-gray-600" };
  const imgSrc = r.image_url
    ? (r.image_url.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`)
    : null;

  return (
    <Link
      to={`/book/${r.id}`}
      data-testid={`resource-card-${r.id}`}
      className="group flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-slate-400 transition-all duration-150"
    >
      <div className="h-16 w-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {imgSrc
          ? <img src={imgSrc} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">{TYPE_ICONS[r.type] || "📦"}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-foreground group-hover:text-slate-600 transition-colors">{r.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.bg} ${c.text}`}>{r.type}</span>
          {r.requires_approval && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-700">Needs approval</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.description}</p>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1"><MapPin size={10} /> Floor {r.floor}</span>
          <span className="flex items-center gap-1"><Users size={10} /> {r.capacity} cap</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {formatTime12hr(r.availability_start)}–{formatTime12hr(r.availability_end)}</span>
        </div>
      </div>
      <div className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold flex-shrink-0">
        Select →
      </div>
    </Link>
  );
}

export default function BrowseResources() {
  const [resources, setResources] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [floor, setFloor] = useState("all");
  const [view, setView] = useState("grid"); // "grid" | "list"

  useEffect(() => {
    (async () => { const { data } = await api.get("/resources"); setResources(data); })();
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
    <div data-testid="browse-resources" className="flex flex-col md:flex-row gap-6 items-start">

      {/* ── Left Filter Panel ── */}
      <aside className="w-full md:w-64 min-w-[240px] flex-shrink-0 sf-card p-6 space-y-6 sticky top-20 self-start md:h-[calc(100vh-100px)] overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground">Resource Directory</h2>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} matches found</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            data-testid="browse-search-input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search…"
            className="sf-input pl-9"
          />
        </div>

        {/* Type filter */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Type</div>
          <div className="space-y-1">
            {[["all","All types", "🏬"], ["room","Rooms","🏢"], ["desk","Desks","🪑"], ["parking","Parking","🚗"], ["equipment","Equipment","⚙️"]].map(([k, label, emoji]) => (
              <button
                key={k}
                data-testid={`filter-type-${k}`}
                onClick={() => setType(k)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                  type === k ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Floor filter */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Floor</div>
          <div className="space-y-1">
            <button
              onClick={() => setFloor("all")}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-all ${floor === "all" ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              All floors
            </button>
            {floors.map(f => (
              <button
                key={f}
                value={f}
                onClick={() => setFloor(String(f))}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-all ${floor === String(f) ? "bg-slate-800 text-white" : "text-muted-foreground hover:bg-muted"}`}
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
            className="w-full text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50/50 transition-colors"
          >
            <X size={12} /> Clear all filters
          </button>
        )}
      </aside>

      {/* ── Right Results Panel ── */}
      <main className="flex-1 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {activeTags.map(tag => (
              <span key={tag.label} className="inline-flex items-center gap-1.5 px-3 py-1 bg-card/60 text-indigo-400 text-xs font-semibold rounded-full border border-border backdrop-blur-sm">
                {tag.label}
                <button onClick={tag.clear} className="hover:text-indigo-200"><X size={11} /></button>
                <button onClick={tag.clear} className="hover:text-red-500"><X size={11} /></button>
              </span>
            ))}
            {activeTags.length === 0 && <span className="text-sm text-muted-foreground font-medium">Showing all resources</span>}
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded transition-all ${view === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded transition-all ${view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Layers size={24} className="text-muted-foreground/40" />
            </div>
            <div className="text-base font-bold text-foreground">No resources found</div>
            <div className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query</div>
          </div>
        )}

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(r => <ResourceCardGrid key={r.id} r={r} />)}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="space-y-3">
            {filtered.map(r => <ResourceRowList key={r.id} r={r} />)}
          </div>
        )}
      </main>
    </div>
  );
}
