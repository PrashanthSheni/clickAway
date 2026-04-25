import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api, formatApiErrorDetail, BACKEND_URL } from "../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";

function toLocalInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingForm() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resource, setResource] = useState(null);

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 30 * 60000);
  defaultStart.setMinutes(0, 0, 0);
  defaultStart.setHours(defaultStart.getHours() + 1);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60000);

  const [form, setForm] = useState({
    title: searchParams.get("title") || "",
    notes: "",
    start_time: searchParams.get("prefillStart") || toLocalInput(defaultStart),
    end_time: searchParams.get("prefillEnd") || toLocalInput(defaultEnd),
    capacity_requested: 1,
  });
  const [recurring, setRecurring] = useState({ enabled: false, pattern: "daily", occurrences: 5 });
  const [recurringResult, setRecurringResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/resources/${resourceId}`);
      setResource(data);
    })();
  }, [resourceId]);

  useEffect(() => {
    if (!resource) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setValidating(true);
      try {
        const { data } = await api.post("/bookings/validate", {
          resource_id: resource.id,
          title: form.title,
          notes: form.notes,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
          capacity_requested: parseInt(form.capacity_requested) || 1,
        });
        setValidation(data);
      } catch (e) {
        setValidation(null);
      } finally {
        setValidating(false);
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [resource, form]);

  const applySuggestion = (s) => {
    setForm((f) => ({
      ...f,
      start_time: toLocalInput(new Date(s.start_time)),
      end_time: toLocalInput(new Date(s.end_time)),
    }));
    if (s.resource_id !== resourceId) {
      navigate(`/book/${s.resource_id}`);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRecurringResult(null);
    try {
      if (recurring.enabled && recurring.occurrences > 1) {
        const { data } = await api.post("/bookings/recurring", {
          resource_id: resource.id,
          title: form.title,
          notes: form.notes,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
          capacity_requested: parseInt(form.capacity_requested) || 1,
          pattern: recurring.pattern,
          occurrences: parseInt(recurring.occurrences),
        });
        setRecurringResult(data);
        if (data.created.length > 0) {
          toast.success(`${data.created.length} bookings created · ${data.failed.length} failed`);
        } else {
          toast.error("No bookings could be created. Review the conflicts below.");
        }
        return;
      }
      const { data } = await api.post("/bookings", {
        resource_id: resource.id,
        title: form.title,
        notes: form.notes,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        capacity_requested: parseInt(form.capacity_requested) || 1,
      });
      toast.success(data.state === "approved" ? "Booking auto-approved" : "Booking created — awaiting approval");
      navigate(`/bookings/${data.id}`);
    } catch (e2) {
      toast.error(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!resource) {
    return <div className="text-slate-500">Loading…</div>;
  }

  const canSubmit = form.title.trim().length >= 3 && validation && validation.ok && !submitting;

  return (
    <div data-testid="booking-form-page" className="space-y-6">
      <button
        data-testid="booking-back-btn"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={onSubmit} className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {resource.image_url && (
              <div className="w-full sm:w-32 h-32 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                <img 
                  src={resource.image_url.startsWith("http") ? resource.image_url : `${BACKEND_URL}${resource.image_url}`} 
                  alt={resource.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Book</div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{resource.name}</h2>
              <div className="text-sm text-slate-600 mt-1">
                {resource.type.toUpperCase()} · Floor {resource.floor} · Capacity {resource.capacity}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="booking-title-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Design review, client sync, deep work…"
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Start</label>
              <input
                type="datetime-local"
                data-testid="booking-start-input"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">End</label>
              <input
                type="datetime-local"
                data-testid="booking-end-input"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          {resource.type === "parking" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Spots requested</label>
              <input
                type="number"
                min="1"
                data-testid="booking-capacity-input"
                value={form.capacity_requested}
                onChange={(e) => setForm({ ...form, capacity_requested: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Notes</label>
            <textarea
              data-testid="booking-notes-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recurring */}
          <div className="pt-3 border-t border-slate-200">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                data-testid="booking-recurring-toggle"
                checked={recurring.enabled}
                onChange={(e) => setRecurring((r) => ({ ...r, enabled: e.target.checked }))}
              />
              Recurring booking
            </label>
            {recurring.enabled && (
              <div className="mt-3 grid grid-cols-2 gap-3" data-testid="booking-recurring-fields">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Pattern</label>
                  <select
                    data-testid="recurring-pattern"
                    value={recurring.pattern}
                    onChange={(e) => setRecurring((r) => ({ ...r, pattern: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="daily">Every day</option>
                    <option value="weekday">Every weekday (Mon–Fri)</option>
                    <option value="weekly">Every week (same day)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Occurrences (max 30)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    data-testid="recurring-occurrences"
                    value={recurring.occurrences}
                    onChange={(e) => setRecurring((r) => ({ ...r, occurrences: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {recurringResult && (
            <div className="p-3 border border-slate-200 rounded-md bg-slate-50" data-testid="recurring-result">
              <div className="text-sm font-semibold text-slate-900">
                Created {recurringResult.created.length} · Failed {recurringResult.failed.length}
              </div>
              {recurringResult.failed.length > 0 && (
                <ul className="mt-2 text-xs text-red-700 space-y-1">
                  {recurringResult.failed.slice(0, 5).map((f, i) => (
                    <li key={i}>
                      • {new Date(f.start_time).toLocaleString()} — {f.errors.map((e) => e.message).join(", ")}
                    </li>
                  ))}
                </ul>
              )}
              {recurringResult.created.length > 0 && (
                <button
                  type="button"
                  data-testid="recurring-view-bookings"
                  onClick={() => navigate("/bookings")}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View created bookings →
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            data-testid="booking-submit-btn"
            disabled={!canSubmit}
            className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {recurring.enabled
              ? `Create series (${recurring.occurrences}×)`
              : validation?.auto_approve
              ? "Confirm booking (auto-approve)"
              : "Submit for approval"}
          </button>
        </form>

        {/* Live validation panel */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 h-fit sticky top-24">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Live validation</div>
            {validating && <Loader2 size={14} className="animate-spin text-slate-400" />}
          </div>
          {!validation && <div className="text-xs text-slate-500">Fill in the form to validate.</div>}
          {validation && validation.ok && (
            <div
              data-testid="validation-ok"
              className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-sm font-semibold"
            >
              <CheckCircle2 size={16} /> Slot is available.
              {validation.auto_approve && <span className="ml-auto text-[10px] uppercase tracking-widest">Auto-approve</span>}
              {validation.requires_approval && !validation.auto_approve && (
                <span className="ml-auto text-[10px] uppercase tracking-widest text-amber-700">Needs approval</span>
              )}
            </div>
          )}
          {validation && validation.errors.length > 0 && (
            <div className="space-y-2 mt-2" data-testid="validation-errors">
              {validation.errors.map((e, i) => (
                <div key={i} className="flex gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{e.message}</span>
                </div>
              ))}
            </div>
          )}
          {validation && validation.warnings.length > 0 && (
            <div className="space-y-2 mt-2" data-testid="validation-warnings">
              {validation.warnings.map((w, i) => (
                <div key={i} className="flex gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}
          {validation && validation.suggestions.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                <Sparkles size={12} /> Smart suggestions
              </div>
              <div className="space-y-2">
                {validation.suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    data-testid={`suggestion-${i}`}
                    onClick={() => applySuggestion(s)}
                    className="w-full text-left p-2 border border-slate-200 rounded-md hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="text-xs font-semibold text-slate-900">{s.resource_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(s.start_time).toLocaleString()} → {new Date(s.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-blue-700 font-bold mt-1">{s.reason}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
