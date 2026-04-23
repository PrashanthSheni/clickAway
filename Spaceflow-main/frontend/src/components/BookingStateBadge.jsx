import React from "react";

const MAP = {
  draft: { label: "Draft", c: "bg-slate-100 text-slate-600 border-slate-200" },
  pending_approval: { label: "Pending", c: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", c: "bg-blue-50 text-blue-700 border-blue-200" },
  rejected: { label: "Rejected", c: "bg-red-50 text-red-700 border-red-200" },
  checked_in: { label: "Checked-in", c: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  no_show_warning: { label: "No-show warn", c: "bg-orange-50 text-orange-700 border-orange-200" },
  no_show: { label: "No-show", c: "bg-red-50 text-red-700 border-red-200" },
  extension_pending: { label: "Extension", c: "bg-purple-50 text-purple-700 border-purple-200" },
  cancelled: { label: "Cancelled", c: "bg-slate-100 text-slate-500 border-slate-200" },
  completed: { label: "Completed", c: "bg-slate-900 text-white border-slate-900" },
};

export default function BookingStateBadge({ state }) {
  const m = MAP[state] || MAP.draft;
  return (
    <span
      data-testid={`badge-state-${state}`}
      className={`inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${m.c}`}
    >
      {m.label}
    </span>
  );
}
