import React from "react";
import { CheckCircle2, Clock, XCircle, Ban, AlertTriangle, QrCode, Timer, Hourglass } from "lucide-react";

const STATE_MAP = {
  approved:         { label: "Approved",         icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200",   dot: "bg-emerald-500" },
  pending_approval: { label: "Pending",           icon: Hourglass,    cls: "bg-amber-50 text-amber-700 border-amber-200",         dot: "bg-amber-500" },
  checked_in:       { label: "Checked In",        icon: QrCode,       cls: "bg-indigo-50 text-indigo-700 border-indigo-200",      dot: "bg-indigo-500" },
  completed:        { label: "Completed",         icon: CheckCircle2, cls: "bg-slate-100 text-slate-600 border-slate-200",        dot: "bg-slate-400" },
  rejected:         { label: "Rejected",          icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200",              dot: "bg-red-500" },
  cancelled:        { label: "Cancelled",         icon: Ban,          cls: "bg-gray-100 text-gray-500 border-gray-200",           dot: "bg-gray-400" },
  no_show:          { label: "No Show",           icon: AlertTriangle,cls: "bg-rose-50 text-rose-700 border-rose-200",            dot: "bg-rose-500" },
  no_show_warning:  { label: "Warning",           icon: AlertTriangle,cls: "bg-orange-50 text-orange-700 border-orange-200",      dot: "bg-orange-400" },
  extension_pending:{ label: "Ext. Pending",      icon: Timer,        cls: "bg-violet-50 text-violet-700 border-violet-200",     dot: "bg-violet-500" },
};

export default function BookingStateBadge({ state }) {
  const cfg = STATE_MAP[state] || { label: state, icon: Clock, cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${cfg.cls}`}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}
