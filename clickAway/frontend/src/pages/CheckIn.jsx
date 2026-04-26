import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import BookingStateBadge from "../components/BookingStateBadge";
import { KeyRound, Loader2 } from "lucide-react";

export default function CheckIn() {
  const [bookings, setBookings] = useState([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeQr, setActiveQr] = useState(null); // { id, qr_image }
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const load = async () => {
    const { data } = await api.get("/bookings?scope=mine");
    const now = new Date();
    const soon = data.filter((b) => {
      if (!["approved", "no_show_warning"].includes(b.state)) return false;
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      // within 2h of start/still running
      return end > now && (start - now) < 2 * 60 * 60 * 1000;
    });
    setBookings(soon);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (id) => {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/checkin`, { code: code.trim() });
      toast.success("Checked in!");
      setCode("");
      setActiveQr(null);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  const getQr = async (id) => {
    try {
      const { data } = await api.get(`/bookings/${id}/qr`);
      setActiveQr({ id, qr_image: data.qr_image, code: data.code });
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  const simulateScan = async (id) => {
    setBusy(true);
    try {
      const { data } = await api.post(`/bookings/${id}/trigger-code`);
      toast.success("Code generated and sent to your mail!");
      setActiveQr({ ...activeQr, code: data.check_in_code });
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="checkin-page" className="space-y-6 max-w-2xl">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-600 mb-1">Quick</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">QR Check-in</h1>
        <p className="text-sm text-slate-600 mt-1">
          Enter your 6-digit code. Or scan your QR at the resource kiosk.
        </p>
      </div>

      {bookings.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-sm text-slate-500">No bookings in the next 2 hours. You're all set.</div>
        </div>
      )}

      {bookings.map((b) => (
        <div key={b.id} className="bg-white rounded-lg border border-slate-200 p-5" data-testid={`checkin-card-${b.id}`}>
          <div className="flex items-start justify-between">
            <div>
              <Link to={`/bookings/${b.id}`} className="text-lg font-bold text-slate-900 hover:text-blue-700">
                {b.resource_name}
              </Link>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <BookingStateBadge state={b.state} />
          </div>
          <div className="mt-4">
            {(() => {
              const start = new Date(b.start_time);
              const isTenMinsBefore = now >= new Date(start.getTime() - 10 * 60 * 1000);
              const hasCode = !!b.check_in_code;

              if (!isTenMinsBefore) {
                return (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Request approved. Check back 10 mins before your slot for the QR check-in code.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {activeQr?.id !== b.id ? (
                    <button
                      onClick={() => getQr(b.id)}
                      className="w-full bg-slate-900 text-white font-semibold rounded-md px-4 py-2 hover:bg-slate-800"
                    >
                      Check In (Reveal QR)
                    </button>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center space-y-4">
                      <div className="flex flex-col items-center gap-2">
                        <img src={activeQr.qr_image} alt="Booking QR" className="w-32 h-32 border border-white shadow-sm" />
                        <div className="text-[10px] uppercase font-bold text-slate-500">Scan at kiosk</div>
                      </div>
                      
                      {!b.check_in_code && !activeQr.code && (
                        <button
                          onClick={() => simulateScan(b.id)}
                          disabled={busy}
                          className="text-xs text-blue-600 font-semibold underline hover:text-blue-700 disabled:opacity-50"
                        >
                          [Simulate Scan]
                        </button>
                      )}

                      {(b.check_in_code || activeQr.code) && (
                        <div className="pt-2 border-t border-slate-200">
                          <div className="text-xs text-slate-500 mb-2">
                            Enter the 6-digit code sent to your email or shown below:
                          </div>
                          {activeQr.code && (
                            <div className="text-2xl font-black tracking-[0.3em] text-slate-900 font-mono mb-3">
                              {activeQr.code}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              data-testid={`checkin-input-${b.id}`}
                              placeholder="6-digit code"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              maxLength={6}
                              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              data-testid={`checkin-submit-${b.id}`}
                              onClick={() => submit(b.id)}
                              disabled={busy || code.length !== 6}
                              className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-60"
                            >
                              {busy && <Loader2 size={14} className="animate-spin" />} Confirm Check In
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}
