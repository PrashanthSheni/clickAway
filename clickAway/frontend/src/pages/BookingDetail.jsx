import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail, BACKEND_URL } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Loader2, QrCode, Ban, Clock4, KeyRound, Calendar, User, Building2, Users } from "lucide-react";

function TimelineItem({ ev }) {
  return (
    <div className="flex gap-3" data-testid={`timeline-${ev.id}`}>
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0 ring-4 ring-indigo-50" />
        <div className="w-px flex-1 bg-gray-100 mt-1" />
      </div>
      <div className="flex-1 pb-5">
        <div className="text-sm font-semibold text-gray-900 capitalize leading-tight">
          {ev.event_type.replace(/_/g, " ")}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{new Date(ev.created_at).toLocaleString()}</div>
        {ev.message && <div className="text-xs text-gray-600 mt-1.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{ev.message}</div>}
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1.5 font-semibold">
          {ev.from_state} → {ev.to_state}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-gray-500" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{label}</div>
        <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
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
  const [resource, setResource] = useState(null);
  const [checkinCode, setCheckinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [extOpen, setExtOpen] = useState(false);
  const [extEnd, setExtEnd] = useState("");
  const [extReason, setExtReason] = useState("");

  const load = async () => {
    const [b, ev] = await Promise.all([api.get(`/bookings/${id}`), api.get(`/bookings/${id}/events`)]);
    setBooking(b.data);
    setEvents(ev.data);
    if (b.data.resource_id) {
      try { const { data } = await api.get(`/resources/${b.data.resource_id}`); setResource(data); } catch (_) {}
    }
    if (b.data.qr_token) {
      try { const { data } = await api.get(`/bookings/${id}/qr`); setQrData(data); } catch (_) {}
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const doCheckin = async () => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/checkin`, { code: checkinCode });
      toast.success("Checked in successfully!");
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally { setBusy(false); }
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
    } finally { setBusy(false); }
  };

  const extend = async () => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/extend`, { new_end_time: new Date(extEnd).toISOString(), reason: extReason });
      toast.success("Extension requested");
      setExtOpen(false);
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally { setBusy(false); }
  };

  if (!booking) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  const isOwner = booking.user_id === user.id;
  const canCheckin = ["approved", "no_show_warning"].includes(booking.state);
  const canCancel = !["cancelled", "completed", "rejected", "no_show"].includes(booking.state);
  const canExtend = isOwner && ["approved", "checked_in"].includes(booking.state);
  const resourceImage = resource?.image_url;

  return (
    <div data-testid="booking-detail-page" className="space-y-6 animate-fade-in-up">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
        data-testid="detail-back-btn"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Resource Image Banner */}
      {resourceImage && (
        <div className="h-48 rounded-2xl overflow-hidden relative">
          <img
            src={resourceImage.startsWith("http") ? resourceImage : `${BACKEND_URL}${resourceImage}`}
            alt={booking.resource_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Booking</div>
              <h2 className="text-2xl font-extrabold text-white">{booking.resource_name}</h2>
            </div>
            <BookingStateBadge state={booking.state} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main detail card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="sf-card p-6">
            {!resourceImage && (
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="sf-section-title">Booking</div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{booking.resource_name}</h2>
                  {booking.title && <div className="text-sm text-gray-500 mt-1">{booking.title}</div>}
                </div>
                <BookingStateBadge state={booking.state} />
              </div>
            )}
            {resourceImage && booking.title && (
              <div className="mb-4 text-sm font-semibold text-gray-700">{booking.title}</div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Start" value={new Date(booking.start_time).toLocaleString()} icon={Calendar} />
              <InfoRow label="End" value={new Date(booking.end_time).toLocaleString()} icon={Calendar} />
              <InfoRow label="Booked by" value={booking.user_name} icon={User} />
              <InfoRow label="Capacity" value={`${booking.capacity_requested} person${booking.capacity_requested > 1 ? 's' : ''}`} icon={Users} />
              {booking.notes && (
                <div className="sm:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Employee Notes</div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-900 italic">
                    "{booking.notes}"
                  </div>
                </div>
              )}
              {booking.approval_note && (
                <div className="sm:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Approval Note</div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700">
                    {booking.approval_note}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Check-in panel */}
          {canCheckin && isOwner && (
            <div className="sf-card p-5 border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                <KeyRound size={16} className="text-indigo-600" /> Enter check-in code
              </div>
              <div className="text-xs text-gray-500 mb-3">Window: 10 min before start, up to 15 min after</div>
              <div className="flex gap-2">
                <input
                  data-testid="checkin-code-input"
                  value={checkinCode}
                  onChange={(e) => setCheckinCode(e.target.value)}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="sf-input flex-1 font-mono tracking-[0.3em] text-center text-lg font-bold"
                />
                <button
                  data-testid="checkin-submit-btn"
                  onClick={doCheckin}
                  disabled={busy || checkinCode.length !== 6}
                  className="sf-btn-primary px-6"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  Check in
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {canCancel && (
              <button data-testid="cancel-booking-btn" onClick={cancel} disabled={busy} className="sf-btn-danger">
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
                className="sf-btn-secondary"
              >
                <Clock4 size={14} /> Request extension
              </button>
            )}
          </div>

          {extOpen && (
            <div className="sf-card p-5" data-testid="extend-form">
              <div className="text-sm font-bold text-gray-900 mb-3">Request extension</div>
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" data-testid="extend-end-input" value={extEnd} onChange={(e) => setExtEnd(e.target.value)} className="sf-input" />
                <input data-testid="extend-reason-input" placeholder="Reason for extension" value={extReason} onChange={(e) => setExtReason(e.target.value)} className="sf-input" />
              </div>
              <div className="mt-3 flex gap-2">
                <button data-testid="extend-submit-btn" onClick={extend} disabled={busy} className="sf-btn-primary text-xs">Submit</button>
                <button onClick={() => setExtOpen(false)} className="sf-btn-secondary text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {qrData && (
            <div className="sf-card p-5" data-testid="qr-panel">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                <QrCode size={12} className="text-indigo-600" /> QR Check-in
              </div>
              <img src={qrData.qr_image} alt="QR code" className="w-full rounded-xl border border-gray-100" />
              <div className="mt-4 text-center">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">6-digit code</div>
                <div className="font-mono font-black text-4xl tracking-[0.3em] text-gray-900" data-testid="qr-code">
                  {qrData.code}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="sf-card p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Activity timeline</div>
            {events.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">No activity yet</div>
            ) : (
              <div className="space-y-0">
                {events.map((ev) => <TimelineItem key={ev.id} ev={ev} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
