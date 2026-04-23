import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

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
      toast.success("Policy saved");
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
        resource_id: selectedId, title: "Simulation",
        start_time: start.toISOString(), end_time: end.toISOString(),
        capacity_requested: 1,
      });
      setSimulation(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  if (!policy) return <div className="text-slate-500">Loading…</div>;

  return (
    <div data-testid="policy-config-page" className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Admin</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Policy configuration</h1>
        <p className="text-sm text-slate-600 mt-1">Tune the rules. Simulate the impact. Save when confident.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Resource</div>
          <select
            data-testid="policy-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name} · F{r.floor}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Max duration (min)</label>
              <input type="number" data-testid="policy-max-duration" value={policy.max_duration_minutes} onChange={(e) => upd("max_duration_minutes", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Min advance (min)</label>
              <input type="number" data-testid="policy-min-advance" value={policy.min_advance_minutes} onChange={(e) => upd("min_advance_minutes", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Max advance (days)</label>
              <input type="number" data-testid="policy-max-advance" value={policy.max_advance_days} onChange={(e) => upd("max_advance_days", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Allowed departments (comma-separated; empty = all)</label>
            <input
              data-testid="policy-depts"
              value={(policy.allowed_departments || []).join(", ")}
              onChange={(e) => upd("allowed_departments", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Allowed roles (employee/manager/admin)</label>
            <input
              data-testid="policy-roles"
              value={(policy.allowed_roles || []).join(", ")}
              onChange={(e) => upd("allowed_roles", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button data-testid="policy-save-btn" onClick={save} disabled={busy} className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save policy
            </button>
            <button data-testid="policy-sim-btn" onClick={simulate} className="bg-white text-slate-900 border border-slate-300 font-semibold rounded-md px-4 py-2 hover:bg-slate-50">
              Simulate (1h from now)
            </button>
          </div>

          {simulation && (
            <div className="mt-3 p-3 border border-slate-200 rounded-md bg-slate-50">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Simulation result</div>
              {simulation.ok ? (
                <div className="text-sm text-emerald-700 font-semibold">✓ Valid · {simulation.auto_approve ? "auto-approve" : simulation.requires_approval ? "needs approval" : "standard"}</div>
              ) : (
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {simulation.errors.map((e, i) => <li key={i}>{e.message}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
