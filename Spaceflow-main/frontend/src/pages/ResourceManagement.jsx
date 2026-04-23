import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Wrench, Trash2, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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
  useEffect(() => setForm(initial || EMPTY_RES), [initial, open]);
  if (!open) return null;

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, amenities: Array.isArray(form.amenities) ? form.amenities : String(form.amenities).split(",").map((s) => s.trim()).filter(Boolean) };
      if (form.id) {
        await api.put(`/resources/${form.id}`, payload);
      } else {
        await api.post(`/resources`, payload);
      }
      toast.success("Saved");
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" data-testid="resource-dialog">
      <div className="bg-white rounded-lg border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="font-bold text-slate-900">{form.id ? "Edit resource" : "New resource"}</div>
          <button onClick={onClose} data-testid="resource-dialog-close"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Name</label>
              <input data-testid="res-form-name" value={form.name} onChange={(e) => upd("name", e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Type</label>
              <select data-testid="res-form-type" value={form.type} onChange={(e) => upd("type", e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white">
                <option value="room">Room</option>
                <option value="desk">Desk</option>
                <option value="parking">Parking</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Floor</label>
              <input type="number" data-testid="res-form-floor" value={form.floor} onChange={(e) => upd("floor", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Capacity</label>
              <input type="number" data-testid="res-form-capacity" value={form.capacity} onChange={(e) => upd("capacity", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Building</label>
              <input data-testid="res-form-building" value={form.building} onChange={(e) => upd("building", e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Avail. start</label>
              <input type="time" data-testid="res-form-avail-start" value={form.availability_start} onChange={(e) => upd("availability_start", e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Avail. end</label>
              <input type="time" data-testid="res-form-avail-end" value={form.availability_end} onChange={(e) => upd("availability_end", e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Description</label>
              <textarea data-testid="res-form-desc" value={form.description} onChange={(e) => upd("description", e.target.value)} rows={2} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Amenities (comma-separated)</label>
              <input data-testid="res-form-amenities" value={Array.isArray(form.amenities) ? form.amenities.join(", ") : form.amenities} onChange={(e) => upd("amenities", e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" data-testid="res-form-req-approval" checked={form.requires_approval} onChange={(e) => upd("requires_approval", e.target.checked)} />
              Requires approval
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" data-testid="res-form-active" checked={form.active} onChange={(e) => upd("active", e.target.checked)} />
              Active
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Policy</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Max duration (min)</label>
                <input type="number" value={form.policy?.max_duration_minutes} onChange={(e) => updPolicy("max_duration_minutes", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Min advance (min)</label>
                <input type="number" value={form.policy?.min_advance_minutes} onChange={(e) => updPolicy("min_advance_minutes", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Max advance (days)</label>
                <input type="number" value={form.policy?.max_advance_days} onChange={(e) => updPolicy("max_advance_days", parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200">
          <button onClick={onClose} className="text-sm text-slate-600 px-3 py-2">Cancel</button>
          <button data-testid="res-form-save" onClick={save} disabled={busy} className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-60">
            {busy && <Loader2 size={14} className="animate-spin" />} Save
          </button>
        </div>
      </div>
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
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
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
      toast.success("Maintenance scheduled. Affected bookings cancelled.");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" data-testid="maintenance-dialog">
      <div className="bg-white rounded-lg border border-slate-200 w-full max-w-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="font-bold text-slate-900">Schedule maintenance · {resource.name}</div>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" data-testid="maint-start" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <input type="datetime-local" data-testid="maint-end" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <input data-testid="maint-reason" placeholder="Reason (AC repair, upgrade, etc.)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <button data-testid="maint-preview-btn" onClick={doPreview} disabled={busy || !form.start_time || !form.end_time} className="bg-white border border-slate-300 text-slate-900 font-semibold rounded-md px-4 py-2 hover:bg-slate-50 inline-flex items-center gap-2 disabled:opacity-60">
            Preview impact
          </button>
          {preview && (
            <div className="mt-2 p-3 border border-amber-200 bg-amber-50 rounded-md text-sm">
              <div className="font-semibold text-amber-900">{preview.affected_bookings.length} affected bookings</div>
              <ul className="mt-1 space-y-1">
                {preview.affected_bookings.slice(0, 8).map((b) => (
                  <li key={b.id} className="text-xs text-amber-800">
                    • {b.user_name} · {new Date(b.start_time).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200">
          <button onClick={onClose} className="text-sm text-slate-600 px-3 py-2">Cancel</button>
          <button data-testid="maint-apply-btn" onClick={apply} disabled={busy || !preview} className="bg-red-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-red-700 inline-flex items-center gap-2 disabled:opacity-60">
            {busy && <Loader2 size={14} className="animate-spin" />} Apply & cancel bookings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResourceManagement() {
  const [resources, setResources] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [maintenanceFor, setMaintenanceFor] = useState(null);

  const load = async () => {
    const { data } = await api.get("/resources");
    setResources(data);
  };
  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Deactivate this resource?")) return;
    await api.delete(`/resources/${id}`);
    toast.success("Deactivated");
    load();
  };

  return (
    <div data-testid="resource-mgmt-page" className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Admin</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Resource management</h1>
        </div>
        <button
          data-testid="res-create-btn"
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <Plus size={16} /> New resource
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Name</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Type</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Floor</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Capacity</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Policy</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`res-row-${r.id}`}>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <Link to={`/resource/${r.id}/calendar`} className="hover:text-blue-700">{r.name}</Link>
                </td>
                <td className="px-4 py-3 uppercase text-xs tracking-wider text-slate-500 font-bold">{r.type}</td>
                <td className="px-4 py-3 text-slate-600">F{r.floor}</td>
                <td className="px-4 py-3 text-slate-600">{r.capacity}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {r.policy ? `${r.policy.max_duration_minutes}m max · ${r.policy.max_advance_days}d ahead` : "—"}
                </td>
                <td className="px-4 py-3">
                  {r.active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Off</span>
                  )}
                  {r.requires_approval && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-200">Approval</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right flex gap-1 justify-end">
                  <button data-testid={`res-edit-${r.id}`} onClick={() => { setEditing(r); setDialogOpen(true); }} className="text-slate-600 hover:text-blue-700 p-1.5"><Pencil size={14} /></button>
                  <button data-testid={`res-maint-${r.id}`} onClick={() => setMaintenanceFor(r)} className="text-slate-600 hover:text-amber-700 p-1.5"><Wrench size={14} /></button>
                  <button data-testid={`res-del-${r.id}`} onClick={() => del(r.id)} className="text-slate-600 hover:text-red-700 p-1.5"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResourceDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
      />
      <MaintenanceDialog
        open={!!maintenanceFor}
        resource={maintenanceFor}
        onClose={() => setMaintenanceFor(null)}
        onSaved={load}
      />
    </div>
  );
}
