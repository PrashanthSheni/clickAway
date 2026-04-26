import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api, BACKEND_URL } from "../lib/api";
import { X, ArrowRight, Loader2, Users, MapPin, Clock, ChevronRight, Search } from "lucide-react";

// ── Config ───────────────────────────────────────────────────
const TYPE = {
  room:      { color: "#334155", bg: "var(--muted)", label: "Meeting Room",   icon: "🏢" },
  desk:      { color: "#475569", bg: "var(--muted)", label: "Hot Desk",        icon: "🪑" },
  parking:   { color: "#64748b", bg: "var(--muted)", label: "Parking",         icon: "🚗" },
  equipment: { color: "#94a3b8", bg: "var(--muted)", label: "Equipment",       icon: "⚙️" },
};

// ── Single space card ────────────────────────────────────────
function SpaceCard({ resource, isSelected, onClick }) {
  const [hovering, setHovering] = useState(false);
  const cfg = TYPE[resource.type] || TYPE.room;
  const active = isSelected || hovering;
  const img = resource.image_url
    ? (resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`)
    : null;

  return (
    <div
      onClick={() => onClick(resource)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      data-testid={`resource-card-${resource.id}`}
      style={{
        width: resource.type === "parking" ? 110 : resource.type === "desk" ? 90 : 130,
        background: active ? "var(--foreground)" : "var(--card)",
        border: `1px solid ${active ? "var(--foreground)" : "var(--border)"}`,
        borderRadius: 8,
        cursor: "pointer",
        padding: "12px 10px",
        position: "relative",
        transition: "all 0.1s ease",
        transform: active ? "scale(1.02)" : "scale(1)",
        userSelect: "none",
      }}
    >
      {/* Status dot */}
      <div style={{
        position: "absolute", top: 8, right: 8,
        width: 6, height: 6, borderRadius: "50%",
        background: "#10B981",
        border: "1px solid var(--card)",
      }} />

      {/* Image thumbnail or emoji */}
      {img ? (
        <div style={{ width: "100%", height: 52, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
          <img src={img} alt={resource.name} style={{ width: "100%", height: "100%", objectFit: "cover",
            filter: active ? "brightness(1.1)" : "none" }} />
        </div>
      ) : (
        <div style={{
          fontSize: 24, textAlign: "center", marginBottom: 6,
          opacity: active ? 0.9 : 0.75,
        }}>
          {cfg.icon}
        </div>
      )}

      {/* Name */}
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: active ? "var(--background)" : "var(--foreground)",
        textAlign: "center",
        lineHeight: 1.3,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {resource.name}
      </div>

      {/* Cap */}
      <div style={{
        fontSize: 9.5, textAlign: "center", marginTop: 3,
        color: active ? "var(--background)" : "var(--muted-foreground)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
      }}>
        <span>👥</span> {resource.capacity} · F{resource.floor}
      </div>

      {/* Book arrow on hover */}
      {active && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(255,255,255,0.1)", borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
          padding: "2px 0", textAlign: "center", fontSize: 8, color: "var(--background)", fontWeight: 600,
        }}>
          BOOK
        </div>
      )}
    </div>
  );
}

// ── Zone section ─────────────────────────────────────────────
function Zone({ title, color, children, description }) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "20px",
      position: "relative",
    }}>
      {/* Zone color strip */}
      <div style={{
        position: "absolute", top: 0, left: 20, right: 20, height: 3,
        background: color, borderRadius: "0 0 4px 4px",
        opacity: 0.7,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {title}
          </div>
          {description && <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1 }}>{description}</div>}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

// ── Info side panel ──────────────────────────────────────────
function SidePanel({ resource, onClose, onBook }) {
  if (!resource) return null;
  const cfg = TYPE[resource.type] || TYPE.room;
  const img = resource.image_url
    ? (resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`)
    : null;

  return (
    <div style={{
      position: "sticky", top: 80, alignSelf: "flex-start",
      width: 280, flexShrink: 0,
      background: "var(--card)", borderRadius: 12,
      border: "1px solid var(--border)",
      overflow: "hidden",
      animation: "fadeInRight 0.1s ease",
    }}>
      <style>{`@keyframes fadeInRight { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }`}</style>

      {/* Header image */}
      {img ? (
        <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
          <img src={img} alt={resource.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
          }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 8,
            width: 28, height: 28, cursor: "pointer", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={14} /></button>
        </div>
      ) : (
        <div style={{
          height: 80, background: `linear-gradient(135deg, ${cfg.bg}, ${cfg.color}33)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
        }}>
          <span style={{ fontSize: 36 }}>{cfg.icon}</span>
          <button onClick={onClose} style={{
            background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 8,
            width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={14} className="text-foreground" /></button>
        </div>
      )}

      <div style={{ padding: 18 }}>
        {/* Type chip */}
        <span style={{
          display: "inline-block", padding: "2px 8px", borderRadius: 99,
          fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
          background: cfg.bg, color: cfg.color, marginBottom: 6,
        }}>{cfg.label}</span>

        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.3, marginBottom: 4 }}>
          {resource.name}
        </div>
        {resource.description && (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5, marginBottom: 14 }}>
            {resource.description}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { icon: <MapPin size={12} />, val: `F${resource.floor}`, sub: "Floor" },
            { icon: <Users size={12} />,  val: resource.capacity,    sub: "Cap" },
            { icon: <Clock size={12} />,  val: resource.availability_start || "8:00", sub: "Opens" },
          ].map(({ icon, val, sub }) => (
            <div key={sub} style={{
              background: cfg.bg, borderRadius: 12, padding: "10px 6px", textAlign: "center",
            }}>
              <div style={{ color: cfg.color, display: "flex", justifyContent: "center", marginBottom: 3 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)" }}>{val}</div>
              <div style={{ fontSize: 9, color: "var(--muted-foreground)" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Amenities */}
        {resource.amenities?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Amenities
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {resource.amenities.map(a => (
                <span key={a} style={{
                  padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: cfg.bg, color: cfg.color,
                }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        {resource.requires_approval && (
          <div style={{
            padding: "8px 12px", borderRadius: 10, background: "#FFFBEB",
            border: "1px solid #FDE68A", fontSize: 11, color: "#92400E", marginBottom: 14,
          }}>
            ⚠️ Manager approval required
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onBook(resource.id)}
          style={{
            width: "100%", padding: "12px", borderRadius: 12, border: "none",
            background: cfg.color, color: "white", fontSize: 13, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.target.style.opacity = 0.9}
          onMouseLeave={e => e.target.style.opacity = 1}
        >
          Book this space <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
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
    <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
      <span className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Map Data...</span>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in relative min-h-screen pb-20">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Digital Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Workplace Map</h1>
          <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
            Navigate through our connected ecosystem. Select a node to initialize the booking sequence.
          </p>
        </div>
        
        {/* Advanced Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-background/40 backdrop-blur-xl p-3 rounded-2xl border border-white/5 shadow-2xl">
          {/* Search */}
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Query space identity..."
              className="bg-accent/50 border border-border/50 text-foreground rounded-xl w-64 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30"
            />
          </div>
          {/* Floor tabs */}
          <div className="flex gap-1.5 bg-accent/30 p-1 rounded-xl border border-border/20">
            {["all", ...floors.map(String)].map(f => (
              <button key={f} onClick={() => { setActiveFloor(f); setSelected(null); }}
                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  activeFloor === f
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}>
                {f === "all" ? "All" : `F${f}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Experience Grid */}
      <div className="flex flex-col xl:flex-row gap-8 px-4 items-start">
        {/* Map Canvas */}
        <div className="flex-1 w-full bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 min-h-[750px] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 space-y-12">
            {/* Zones - Modernized */}
            {byType.room.length > 0 && (
              <ZoneSection title="Collaboration Nexus" color="#0ea5e9" description="High-performance meeting environments">
                {byType.room.map(r => (
                  <ResourceNode key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                ))}
              </ZoneSection>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {byType.desk.length > 0 && (
                <ZoneSection title="Focus Terminals" color="#10b981" description="Personalized productivity pods">
                  {byType.desk.map(r => (
                    <ResourceNode key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                  ))}
                </ZoneSection>
              )}
              {byType.equipment.length > 0 && (
                <ZoneSection title="Asset Clusters" color="#8b5cf6" description="Hardware & peripheral nodes">
                  {byType.equipment.map(r => (
                    <ResourceNode key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                  ))}
                </ZoneSection>
              )}
            </div>

            {byType.parking.length > 0 && (
              <ZoneSection title="Logistics Zone" color="#f59e0b" description="Vehicle containment & storage units">
                {byType.parking.map(r => (
                  <ResourceNode key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                ))}
              </ZoneSection>
            )}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 text-center">
                <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                  <Search size={32} className="text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Null Set: No Nodes Detected</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">The current query parameters returned zero active infrastructure nodes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cinematic Side Inspector */}
        {selected && (
          <div className="w-full xl:w-[400px] sticky top-24">
            <ResourceInspector
              resource={selected}
              onClose={() => setSelected(null)}
              onBook={id => navigate(`/book/${id}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Refactored Sub-components ───────────────────────────────

function ResourceNode({ resource, isSelected, onClick }) {
  const cfg = TYPE[resource.type] || TYPE.room;
  const img = resource.image_url
    ? (resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`)
    : null;

  return (
    <div
      onClick={() => onClick(resource)}
      className={`
        relative group cursor-pointer p-4 rounded-2xl border transition-all duration-500
        ${isSelected 
          ? "bg-primary text-primary-foreground border-primary shadow-[0_0_40px_-10px_rgba(14,165,233,0.6)] scale-105 z-10" 
          : "bg-accent/40 border-white/5 hover:border-primary/50 hover:bg-accent/60 hover:scale-105"}
      `}
      style={{ width: resource.type === "parking" ? 140 : resource.type === "desk" ? 110 : 160 }}
    >
      <div className={`absolute top-3 right-3 h-2 w-2 rounded-full ${isSelected ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
      
      <div className="flex flex-col items-center text-center gap-3">
        {img ? (
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner bg-black/20">
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
        ) : (
          <div className="text-3xl py-2">{cfg.icon}</div>
        )}
        
        <div className="space-y-1 w-full">
          <div className={`text-xs font-black truncate uppercase tracking-tighter ${isSelected ? "text-white" : "text-foreground"}`}>
            {resource.name}
          </div>
          <div className={`text-[9px] font-bold flex items-center justify-center gap-2 ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
            <span>👥 {resource.capacity}</span>
            <span className="opacity-30">•</span>
            <span>FL {resource.floor}</span>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute inset-x-0 -bottom-1 h-1 bg-white/20 rounded-full blur-sm" />
      )}
    </div>
  );
}

function ZoneSection({ title, color, children, description }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-1 px-0.5 rounded-full" style={{ backgroundColor: color }} />
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-foreground">{title}</h3>
          <p className="text-xs font-medium text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 p-2">
        {children}
      </div>
    </div>
  );
}

function ResourceInspector({ resource, onClose, onBook }) {
  const cfg = TYPE[resource.type] || TYPE.room;
  const img = resource.image_url
    ? (resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`)
    : null;

  return (
    <div className="bg-background/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl animate-fade-in-right">
      <div className="relative h-56 group">
        {img ? (
          <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl bg-accent/40">{cfg.icon}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-black/60 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95"
        >
          <X size={18} />
        </button>
        <div className="absolute bottom-6 left-8 right-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest">
              {cfg.label}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{resource.name}</h2>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
          "{resource.description || "No tactical description available for this coordinate."}"
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <MapPin size={16} />, label: "FLOOR", val: resource.floor },
            { icon: <Users size={16} />,  label: "UNITS", val: resource.capacity },
            { icon: <Clock size={16} />,  label: "UPTIME", val: resource.availability_start || "08:00" },
          ].map(stat => (
            <div key={stat.label} className="bg-accent/40 rounded-2xl p-4 border border-border/20 text-center space-y-1">
              <div className="flex justify-center text-primary mb-1">{stat.icon}</div>
              <div className="text-sm font-black text-foreground">{stat.val}</div>
              <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {resource.amenities?.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Infrastructure Features</div>
            <div className="flex flex-wrap gap-2">
              {resource.amenities.map(a => (
                <span key={a} className="px-3 py-1.5 rounded-lg bg-accent/60 border border-border/40 text-[10px] font-bold text-foreground">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onBook(resource.id)}
          className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(14,165,233,0.6)] hover:-translate-y-1 transition-all active:translate-y-0"
        >
          Initialize Booking <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

