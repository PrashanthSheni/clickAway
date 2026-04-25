import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, BACKEND_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { 
  Plus, ArrowRight, QrCode, CalendarDays, Clock, 
  MapPin, Users, Zap, TrendingUp, Activity, CheckCircle, 
  Loader2, Star, Search, Filter, Box, MessageSquare, X, Send
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadData = async () => {
    try {
      const [b, r] = await Promise.all([api.get("/bookings?scope=mine"), api.get("/resources")]);
      setBookings(b.data);
      setResources(r.data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const now = new Date();
  const upcoming = bookings
    .filter(b => new Date(b.end_time) >= now && !["rejected","cancelled","no_show","completed"].includes(b.state))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  const completed = bookings
    .filter(b => b.state === "completed")
    .sort((a, b) => new Date(b.end_time) - new Date(a.end_time));

  const reliabilityScore = Math.round(user?.reliability_score || 0);
  const getResourceImg = (r) => r.image_url?.startsWith("http") ? r.image_url : `${BACKEND_URL}${r.image_url}`;

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;
    setSubmittingFeedback(true);
    try {
      await api.post("/feedback/", {
        booking_id: feedbackBooking.id,
        content: feedbackContent
      });
      toast.success("Feedback submitted to management");
      setFeedbackBooking(null);
      setFeedbackContent("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* ── Welcome Header ── */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Box size={200} />
         </div>
         <div className="relative z-10 text-center md:text-left">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2">Spaceflow Portal</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome back, {user?.name.split(" ")[0]}</h1>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
               You have {upcoming.length} sessions scheduled for the upcoming interval. Your performance index is currently at <span className="font-bold text-slate-900">{reliabilityScore}%</span>.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6 justify-center md:justify-start">
               <Link to="/browse" className="sf-btn-primary py-2 px-5 text-xs h-auto">
                  <Plus size={14} className="mr-2" /> New Reservation
               </Link>
               <Link to="/checkin" className="sf-btn-secondary py-2 px-5 text-xs h-auto bg-slate-50 border-none shadow-none">
                  <QrCode size={14} className="mr-2" /> Express Check-in
               </Link>
            </div>
         </div>
         
         <div className="flex items-center gap-12 bg-slate-50 px-8 py-6 rounded-2xl border border-slate-100 relative z-10">
            <div className="text-center">
               <div className="text-3xl font-bold text-slate-900">{reliabilityScore}%</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reliability</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
               <div className="text-3xl font-bold text-slate-900">{completed.length}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sessions</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Upcoming & Completed */}
        <div className="lg:col-span-2 space-y-12">
           
           {/* Upcoming Schedule */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CalendarDays size={14} /> Upcoming Operations
                 </h3>
                 <Link to="/bookings" className="text-[10px] font-bold text-indigo-600 hover:underline">Full Audit Log</Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="sf-card py-16 flex flex-col items-center justify-center text-center px-8 border-dashed border-2">
                   <div className="font-bold text-slate-900">No Upcoming Sessions</div>
                   <p className="text-slate-500 text-sm mt-1 max-w-xs">Your schedule is currently clear.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.slice(0, 3).map(b => (
                    <Link key={b.id} to={`/bookings/${b.id}`} className="sf-card p-5 group flex items-center gap-6 transition-all hover:border-indigo-200">
                       <div className="flex flex-col items-center justify-center h-14 w-14 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                          <div className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-400 uppercase tracking-tighter">{new Date(b.start_time).toLocaleDateString(undefined, {month:'short'})}</div>
                          <div className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 leading-none mt-1">{new Date(b.start_time).getDate()}</div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{b.resource_name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                             <Clock size={12} className="text-slate-300" /> 
                             {new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                          </div>
                       </div>
                       <BookingStateBadge state={b.state} />
                    </Link>
                  ))}
                </div>
              )}
           </div>

           {/* Completed - Feedback Option */}
           <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                 <CheckCircle size={14} className="text-emerald-500" /> Recently Completed
              </h3>
              <div className="space-y-4">
                 {completed.slice(0, 3).map(b => (
                   <div key={b.id} className="sf-card p-5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                            <Box size={18} className="text-slate-400" />
                         </div>
                         <div>
                            <div className="font-bold text-slate-900">{b.resource_name}</div>
                            <div className="text-xs text-slate-500">{new Date(b.end_time).toLocaleDateString(undefined, {month:'short', day:'numeric'})} · {new Date(b.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                         </div>
                      </div>
                      <button 
                        onClick={() => setFeedbackBooking(b)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-indigo-100"
                      >
                         <MessageSquare size={14} /> Report Issue / Feedback
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Sidebar: Quick Actions & Featured */}
        <div className="space-y-8">
           <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Zap size={14} className="text-amber-500" /> Fast Inventory
              </h3>
              <div className="sf-card p-2">
                 <div className="divide-y divide-slate-100">
                    {resources.filter(r=>r.active).slice(0, 3).map(r => (
                      <Link key={r.id} to={`/book/${r.id}`} className="p-3 flex items-center gap-3 group hover:bg-slate-50 rounded-lg transition-colors">
                         <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            {r.image_url 
                               ? <img src={getResourceImg(r)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                               : <div className="w-full h-full flex items-center justify-center text-xs opacity-20">🏢</div>
                            }
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600">{r.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{r.type}</div>
                         </div>
                         <Plus size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </Link>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                 <Star size={20} />
              </div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Spaceflow Tip</div>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                 "Check-in within 15 minutes of your session start time to maintain a high Reliability Index."
              </p>
           </div>
        </div>

      </div>

      {/* ── Feedback Modal ── */}
      {feedbackBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
           <div className="sf-card w-full max-w-lg p-8 relative shadow-2xl animate-fade-in-up">
              <button onClick={() => setFeedbackBooking(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
                 <X size={20} />
              </button>
              
              <div className="mb-8">
                 <div className="sf-section-label mb-3">Resource Insight</div>
                 <h2 className="text-2xl font-bold text-slate-900">Report an Issue</h2>
                 <p className="text-slate-500 text-sm mt-1">Providing feedback for <span className="text-slate-900 font-semibold">{feedbackBooking.resource_name}</span> session.</p>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                 <div className="space-y-2">
                    <label className="sf-label">Detailed Observations</label>
                    <textarea 
                       required
                       rows={4}
                       className="sf-input py-4 resize-none"
                       placeholder="e.g., Projector bulb flickering, room temperature was too high, or equipment missing..."
                       value={feedbackContent}
                       onChange={e => setFeedbackContent(e.target.value)}
                    />
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => setFeedbackBooking(null)} className="sf-btn-secondary flex-1">
                       Discard
                    </button>
                    <button type="submit" disabled={submittingFeedback} className="sf-btn-primary flex-[2]">
                       {submittingFeedback ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} className="mr-2" /> Submit to Management</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
