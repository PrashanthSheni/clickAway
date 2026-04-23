import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatTime12hr } from "../lib/api";
import { Search, Users, MapPin, Layers, CheckCircle2 } from "lucide-react";
import { BACKEND_URL } from "../lib/api";

const TYPE_LABELS = { room: "Rooms", desk: "Desks", parking: "Parking", equipment: "Equipment" };

export default function BrowseResources() {
  const [resources, setResources] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [floor, setFloor] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/resources");
      setResources(data);
    })();
  }, []);

  const floors = useMemo(
    () => Array.from(new Set(resources.map((r) => r.floor))).sort((a, b) => a - b),
    [resources],
  );

  const filtered = useMemo(
    () =>
      resources.filter(
        (r) =>
          r.active &&
          (type === "all" || r.type === type) &&
          (floor === "all" || r.floor === parseInt(floor)) &&
          (q === "" || r.name.toLowerCase().includes(q.toLowerCase()) || (r.description || "").toLowerCase().includes(q.toLowerCase())),
      ),
    [resources, q, type, floor],
  );

  return (
    <div data-testid="browse-resources" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Catalog</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Browse resources</h1>
        <p className="text-sm text-slate-600 mt-1">Find the right room, desk or asset for your next block of focus.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            data-testid="browse-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or description"
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1">
          <button
            data-testid="filter-type-all"
            onClick={() => setType("all")}
            className={`px-3 py-2 rounded-md text-sm font-semibold border ${type === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"}`}
          >
            All
          </button>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <button
              key={k}
              data-testid={`filter-type-${k}`}
              onClick={() => setType(k)}
              className={`px-3 py-2 rounded-md text-sm font-semibold border ${type === k ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              {v}
            </button>
          ))}
        </div>
        <select
          data-testid="filter-floor"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
        >
          <option value="all">All floors</option>
          {floors.map((f) => (
            <option key={f} value={f}>{`Floor ${f}`}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-lg p-10 text-center">
            <div className="text-sm text-slate-500">No resources match your filters.</div>
          </div>
        )}
        {filtered.map((r) => (
          <Link
            to={`/book/${r.id}`}
            key={r.id}
            data-testid={`resource-card-${r.id}`}
            className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all"
          >
            {r.image_url ? (
              <div
                className="h-40 bg-slate-100"
                style={{ 
                  backgroundImage: `url(${r.image_url.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`})`, 
                  backgroundSize: "cover", 
                  backgroundPosition: "center" 
                }}
              />
            ) : (
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Layers size={32} className="text-slate-400" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{r.type}</div>
                {r.requires_approval && (
                  <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Approval
                  </span>
                )}
              </div>
              <div className="text-base font-bold text-slate-900 mt-1 group-hover:text-blue-700">{r.name}</div>
              <div className="text-xs text-slate-600 mt-1 line-clamp-2 min-h-[32px]">{r.description}</div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> Floor {r.floor}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> {r.capacity}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={12} /> {formatTime12hr(r.availability_start)}–{formatTime12hr(r.availability_end)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
