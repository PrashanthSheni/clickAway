import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Loader2, QrCode, Ban, Clock4, KeyRound } from "lucide-react";

function TimelineItem({ ev }) {
  return (
    <div className="flex gap-3" data-testid={`timeline-${ev.id}`}>
      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
      <div className="flex-1 pb-4 border-l border-slate-200 pl-4 -ml-[5px]">
        <div className="text-sm font-semibold text-slate-900 capitalize">{ev.event_type.replace(/_/g, " ")}</div>
        <div className="text-xs text-slate-500">{new Date(ev.created_at).toLocaleString()}</div>
        {ev.message && <div className="text-xs text-slate-600 mt-1">{ev.message}</div>}
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-bold">
          {ev.from_state} → {ev.to_state}
        </div>
      </div>
    </div>
  );
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [events, setEvents] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [checkinCode, setCheckinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [extOpen, setExtOpen] = useState(false);
  const [extEnd, setExtEnd] = useState("");
  const [extReason, setExtReason] = useState("");

  const load = async () => {
    const [b, ev] = await Promise.all([api.get(`/bookings/${id}`), api.get(`/bookings/${id}/events`)]);
    setBooking(b.data);
    setEvents(ev.data);
    if (b.data.qr_token) {
      try {
        const { data } = await api.get(`/bookings/${id}/qr`);
        setQrData(data);
      } catch (_) {}
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const doCheckin = async () => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/checkin`, { code: checkinCode });
      toast.success("Checked in!");
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel this booking?")) return;
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  const extend = async () => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/extend`, {
        new_end_time: new Date(extEnd).toISOString(),
        reason: extReason,
      });
      toast.success("Extension requested");
      setExtOpen(false);
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!booking) return <div className="text-slate-500">Loading…</div>;

  const isOwner = booking.user_id === user.id;
  const canCheckin = ["approved", "no_show_warning"].includes(booking.state);
  const canCancel = !["cancelled", "completed", "rejected", "no_show"].includes(booking.state);
  const canExtend = isOwner && ["approved", "checked_in"].includes(booking.state);

  return (
    <div data-testid="booking-detail-page" className="space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900" data-testid="detail-back-btn">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Booking</div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{booking.resource_name}</h2>
              {booking.title && <div className="text-sm text-slate-600 mt-1">{booking.title}</div>}
            </div>
            <BookingStateBadge state={booking.state} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Start</div>
              <div className="text-sm text-slate-900 font-semibold">{new Date(booking.start_time).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">End</div>
              <div className="text-sm text-slate-900 font-semibold">{new Date(booking.end_time).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Booked by</div>
              <div className="text-sm text-slate-900 font-semibold">{booking.user_name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Capacity</div>
              <div className="text-sm text-slate-900 font-semibold">{booking.capacity_requested}</div>
            </div>
            {booking.notes && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Notes</div>
                <div className="text-sm text-slate-700">{booking.notes}</div>
              </div>
            )}
            {booking.approval_note && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Approval note</div>
                <div className="text-sm text-slate-700">{booking.approval_note}</div>
              </div>
            )}
          </div>

          {canCheckin && isOwner && (
            <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                <KeyRound size={16} /> Check in
              </div>
              <div className="text-xs text-blue-800 mb-3">
                Window: 10 min before start, up to 15 min after. Enter your 6-digit code.
              </div>
              <div className="flex gap-2">
                <input
                  data-testid="checkin-code-input"
                  value={checkinCode}
                  onChange={(e) => setCheckinCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
                />
                <button
                  data-testid="checkin-submit-btn"
                  onClick={doCheckin}
                  disabled={busy || checkinCode.length !== 6}
                  className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  Check in
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {canCancel && (
              <button
                data-testid="cancel-booking-btn"
                onClick={cancel}
                disabled={busy}
                className="bg-white text-red-700 border border-red-200 font-semibold rounded-md px-4 py-2 hover:bg-red-50 inline-flex items-center gap-2"
              >
                <Ban size={14} /> Cancel booking
              </button>
            )}
            {canExtend && !extOpen && (
              <button
                data-testid="extend-booking-btn"
                onClick={() => {
                  setExtOpen(true);
                  const d = new Date(booking.end_time);
                  d.setMinutes(d.getMinutes() + 30);
                  const pad = (n) => String(n).padStart(2, "0");
                  setExtEnd(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                }}
                className="bg-white text-slate-900 border border-slate-300 font-semibold rounded-md px-4 py-2 hover:bg-slate-50 inline-flex items-center gap-2"
              >
                <Clock4 size={14} /> Request extension
              </button>
            )}
          </div>

          {extOpen && (
            <div className="mt-4 p-4 border border-slate-200 rounded-md bg-slate-50" data-testid="extend-form">
              <div className="text-sm font-semibold text-slate-900 mb-2">Request extension</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  data-testid="extend-end-input"
                  value={extEnd}
                  onChange={(e) => setExtEnd(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  data-testid="extend-reason-input"
                  placeholder="Reason"
                  value={extReason}
                  onChange={(e) => setExtReason(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  data-testid="extend-submit-btn"
                  onClick={extend}
                  disabled={busy}
                  className="bg-blue-600 text-white font-semibold rounded-md px-3 py-1.5 hover:bg-blue-700 text-sm"
                >
                  Submit
                </button>
                <button
                  onClick={() => setExtOpen(false)}
                  className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {qrData && (
            <div className="bg-white rounded-lg border border-slate-200 p-5" data-testid="qr-panel">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">
                <QrCode size={12} /> Check-in QR
              </div>
              <img src={qrData.qr_image} alt="QR code" className="w-full rounded-md border border-slate-200" />
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-3 font-bold">6-digit code</div>
              <div className="font-mono font-black text-3xl tracking-[0.3em] text-slate-900" data-testid="qr-code">
                {qrData.code}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Timeline</div>
            <div className="space-y-1">
              {events.map((ev) => (
                <TimelineItem key={ev.id} ev={ev} />
              ))}
              {events.length === 0 && <div className="text-xs text-slate-500">No events yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
