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
    <div className="flex items-center justify-center h-80">
      <Loader2 size={22} className="animate-spin text-indigo-500" />
      <span className="ml-3 text-gray-500 font-medium">Loading floor plan…</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="sf-section-title">Visual Map</div>
          <h1 className="sf-page-title">Floor Plan</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} spaces available · Interact with any space to view details</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search spaces…"
              className="sf-input w-48 pl-9 py-2"
            />
          </div>
          {/* Floor tabs */}
          <div className="flex gap-1">
            {["all", ...floors.map(String)].map(f => (
              <button key={f} onClick={() => { setActiveFloor(f); setSelected(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFloor === f
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-gray-500 hover:bg-white/60 hover:text-gray-900"
                }`}>
                {f === "all" ? "All" : `F${f}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Floor plan canvas */}
        <div className="flex-1 w-full sf-card p-6 min-h-[600px] overflow-auto">
          <div className="space-y-6">
            {/* Zones */}
            {byType.room.length > 0 && (
              <Zone title="Conference & Meeting Rooms" color="#6366F1" description="High-performance spaces for team collaboration">
                {byType.room.map(r => (
                  <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                ))}
              </Zone>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {byType.desk.length > 0 && (
                <Zone title="Hot Desks" color="#10B981" description="Flexible open workspaces">
                  {byType.desk.map(r => (
                    <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                  ))}
                </Zone>
              )}
              {byType.equipment.length > 0 && (
                <Zone title="Resources" color="#8B5CF6" description="Available tools & hardware">
                  {byType.equipment.map(r => (
                    <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                  ))}
                </Zone>
              )}
            </div>

            {byType.parking.length > 0 && (
              <Zone title="Parking Area" color="#F59E0B" description="Reserved vehicle spaces">
                {byType.parking.map(r => (
                  <SpaceCard key={r.id} resource={r} isSelected={selected?.id === r.id} onClick={handleSelect} />
                ))}
              </Zone>
            )}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-lg font-black text-foreground tracking-tight">No spaces found</div>
                <div className="text-sm font-medium text-muted-foreground">Try a different floor or search term</div>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        {selected && (
          <div className="w-full lg:w-[320px] animate-fade-in-right">
            <SidePanel
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
