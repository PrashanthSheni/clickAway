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
        <div className="sf-badge !bg-primary/10 !text-primary !border-primary/20 mb-2">Biometric / QR Access</div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Session Identity</h1>
        <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
          Authenticate your arrival. Enter your 6-digit security code or scan your unique QR at the resource kiosk.
        </p>
      </div>

      {bookings.length === 0 && (
        <div className="sf-card p-12 text-center bg-sf-bg-soft/40 border-dashed">
          <div className="text-sm font-medium text-muted-foreground italic">No active authorizations detected in the immediate window.</div>
        </div>
      )}

      {bookings.map((b) => (
        <div key={b.id} className="sf-card p-8 group hover:border-primary/30 transition-all" data-testid={`checkin-card-${b.id}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Link to={`/bookings/${b.id}`} className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                {b.resource_name}
              </Link>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                {new Date(b.start_time).toLocaleString()} // {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <BookingStateBadge state={b.state} />
          </div>
          <div className="mt-4">
            {(() => {
              const start = new Date(b.start_time);
              const isTenMinsBefore = now >= new Date(start.getTime() - 10 * 60 * 1000);
              
              if (b.state === "checked_in") {
                return (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-green-600 font-bold">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Session in Progress
                      </div>
                      <button
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await api.post(`/bookings/${b.id}/request-release`);
                            toast.success("Release request sent to manager!");
                            load();
                          } catch (e) {
                            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Request failed");
                          } finally {
                            setBusy(false);
                          }
                        }}
                        disabled={busy}
                        className="sf-btn-outline !text-xs !py-2 border-green-500/30 hover:bg-green-500/10 text-green-700"
                      >
                        Release Resource Early
                      </button>
                    </div>
                  </div>
                );
              }

              if (b.state === "release_pending") {
                return (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-blue-600 font-medium flex items-center gap-3 italic">
                    <Loader2 size={16} className="animate-spin opacity-50" />
                    Waiting for manager to acknowledge early release...
                  </div>
                );
              }

              if (!isTenMinsBefore) {
                return (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-sm text-primary font-medium flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin opacity-50" />
                    Identity verification window opens 10 minutes prior to commencement.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {activeQr?.id !== b.id ? (
                    <button
                      onClick={() => getQr(b.id)}
                      className="sf-btn-primary w-full py-4 text-sm uppercase tracking-widest font-black"
                    >
                      Reveal Security Identity
                    </button>
                  ) : (
                    <div className="bg-accent/40 backdrop-blur-xl border border-border/40 rounded-2xl p-8 text-center space-y-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-white rounded-3xl shadow-2xl border-8 border-white/10">
                          <img src={activeQr.qr_image} alt="Booking QR" className="w-40 h-40" />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Encryption Active // Scan at Terminal</div>
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
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input
                              data-testid={`checkin-input-${b.id}`}
                              placeholder="CODE-X"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              maxLength={6}
                              className="sf-input text-center text-xl tracking-[0.3em] font-black h-14"
                            />
                            <button
                              data-testid={`checkin-submit-${b.id}`}
                              onClick={() => submit(b.id)}
                              disabled={busy || code.length !== 6}
                              className="sf-btn-primary h-14 px-8 whitespace-nowrap shadow-xl shadow-primary/20"
                            >
                              {busy ? <Loader2 size={18} className="animate-spin" /> : "Verify Identity"}
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
