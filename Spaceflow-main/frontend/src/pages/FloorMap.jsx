import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Layers } from "lucide-react";

export default function FloorMap() {
  const [resources, setResources] = useState([]);
  const [floor, setFloor] = useState(2);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/resources");
      setResources(data);
    })();
  }, []);

  const floors = Array.from(new Set(resources.map((r) => r.floor))).sort((a, b) => a - b);
  const onFloor = resources.filter((r) => r.floor === floor && r.active);

  return (
    <div data-testid="floor-map-page" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Floor map</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Building layout</h1>
          <p className="text-sm text-slate-600 mt-1">Click a marker to open the booking form.</p>
        </div>
        <div className="flex gap-1">
          {floors.map((f) => (
            <button
              key={f}
              data-testid={`floor-btn-${f}`}
              onClick={() => setFloor(f)}
              className={`px-4 py-2 rounded-md text-sm font-semibold border ${
                floor === f ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div
          className="relative w-full"
          style={{
            aspectRatio: "16/9",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1721244654195-943615c56ac4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwZmxvb3IlMjBwbGFuJTIwYmx1ZXByaW50fGVufDB8fHx8MTc3NjgzNTczOHww&ixlib=rb-4.1.0&q=85')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
          {onFloor.map((r) => (
            <Link
              key={r.id}
              to={`/book/${r.id}`}
              data-testid={`floor-pin-${r.id}`}
              className="absolute group"
              style={{ left: `${Math.min(90, Math.max(4, r.x))}%`, top: `${Math.min(90, Math.max(4, r.y))}%` }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-600/20 group-hover:ring-blue-600/40 transition-all">
                  <Layers size={16} />
                </div>
                <div className="absolute left-1/2 top-full -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-slate-900 text-white text-xs px-2 py-1 rounded font-semibold">
                  {r.name} · {r.type}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {onFloor.map((r) => (
          <Link
            key={r.id}
            to={`/book/${r.id}`}
            data-testid={`floor-list-${r.id}`}
            className="p-3 bg-white border border-slate-200 rounded-md hover:border-blue-400"
          >
            <div className="text-sm font-semibold text-slate-900">{r.name}</div>
            <div className="text-xs text-slate-500">{r.type} · {r.capacity} cap</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
