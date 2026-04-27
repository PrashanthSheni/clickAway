import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, BACKEND_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { 
  Plus, ArrowRight, QrCode, CalendarDays, Clock, 
  MapPin, Users, Zap, TrendingUp, Activity, CheckCircle, 
  Loader2, Star, Search, Filter, Box, MessageSquare, X, Send,
  ChevronRight, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
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
      toast.success("Intelligence report dispatched");
      setFeedbackBooking(null);
      setFeedbackContent("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Report failed");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin w-12 h-12 text-primary/20" />
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* ── Dashboard Identity Header ── */}
      <div className="relative overflow-hidden p-10 rounded-[32px] border border-border/40 bg-sf-bg-soft shadow-2xl">
         {/* Ambient media depth */}
         <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none grayscale">
            <video autoPlay muted loop className="w-full h-full object-cover">
               <source src="/videos/landingdb.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-l from-sf-bg-soft via-transparent to-sf-bg-soft" />
         </div>

         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-6 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Corporate Identity Node
               </div>
               <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight">Welcome, {user?.name.split(" ")[0]}</h1>
                  <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
                     Your reliability index is <span className="text-foreground font-bold">{reliabilityScore}%</span>. 
                     You have <span className="text-foreground font-bold">{upcoming.length} upcoming sessions</span> in the current interval.
                  </p>
               </div>
               <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                  <Link to="/browse" className="sf-btn-primary px-8 py-3 text-xs">
                     <Plus size={16} /> New Asset Request
                  </Link>
                  <Link to="/checkin" className="sf-btn-secondary px-8 py-3 text-xs">
                     <QrCode size={16} /> Identity Check-in
                  </Link>
               </div>
            </div>

            <div className="flex items-center gap-10 bg-accent/40 backdrop-blur-md p-8 rounded-3xl border border-border/40 shadow-xl">
               <div className="text-center space-y-1">
                  <div className="text-4xl font-serif italic text-foreground leading-none">{reliabilityScore}%</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reliability</div>
               </div>
               <div className="h-12 w-[1px] bg-border/40" />
               <div className="text-center space-y-1">
                  <div className="text-4xl font-serif italic text-foreground leading-none">{completed.length}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Utilized</div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Content Pane */}
        <div className="lg:col-span-2 space-y-12">
           
           {/* Upcoming Operations */}
           <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                    <CalendarDays size={14} className="text-primary" /> Upcoming Operations
                 </h3>
                 <Link to="/bookings" className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                    Audit Log <ChevronRight size={12} />
                 </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="sf-card group relative h-[300px] flex flex-col items-center justify-center text-center p-12 border-dashed overflow-hidden">
                   <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover opacity-5 grayscale group-hover:opacity-10 transition-opacity duration-500">
                      <source src="/videos/landingdb.mp4" type="video/mp4" />
                   </video>
                   <div className="relative z-10 space-y-4">
                      <div className="h-16 w-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50">
                         <Activity size={24} className="text-muted-foreground" />
                      </div>
                      <div className="font-bold text-lg">No Active Sessions</div>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">Your operational schedule is currently clear. Request an asset to begin.</p>
                      <Link to="/browse" className="sf-btn-primary py-2 px-6 text-[10px] uppercase tracking-widest mt-4">Browse Inventory</Link>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.slice(0, 4).map(b => (
                    <Link key={b.id} to={`/bookings/${b.id}`} className="sf-card p-6 group flex items-center gap-6 hover:border-primary/40">
                       <div className="flex flex-col items-center justify-center h-16 w-16 bg-accent rounded-2xl border border-border/60 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/20">
                          <div className="text-[9px] font-black uppercase tracking-tighter opacity-60">{new Date(b.start_time).toLocaleDateString(undefined, {month:'short'})}</div>
                          <div className="text-2xl font-serif italic leading-none mt-1">{new Date(b.start_time).getDate()}</div>
                       </div>
                       <div className="flex-1 min-w-0 space-y-1">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{b.resource_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                             <Clock size={12} className="text-muted-foreground/40" /> 
                             {new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                          </div>
                       </div>
                       <BookingStateBadge state={b.state} />
                    </Link>
                  ))}
                </div>
              )}
           </div>

           {/* Performance Audit (Recently Completed) */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2 px-2">
                 <CheckCircle size={14} className="text-emerald-500" /> Operational History
              </h3>
              <div className="space-y-4">
                 {completed.slice(0, 3).map(b => (
                   <div key={b.id} className="sf-card p-6 flex items-center justify-between group bg-sf-bg-soft/40">
                      <div className="flex items-center gap-6">
                         <div className="h-12 w-12 bg-accent rounded-xl flex items-center justify-center border border-border/40">
                            <Box size={20} className="text-muted-foreground" />
                         </div>
                         <div className="space-y-1">
                            <div className="font-bold text-foreground">{b.resource_name}</div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(b.end_time).toLocaleDateString(undefined, {month:'short', day:'numeric'})} · {new Date(b.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                         </div>
                      </div>
                      <button 
                        onClick={() => setFeedbackBooking(b)}
                        className="sf-btn-secondary py-2 px-4 text-[10px] uppercase tracking-widest hover:border-primary/30"
                      >
                         <MessageSquare size={14} className="mr-2" /> Report Conflict
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-10">
           {/* Quick Access Inventory */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2 px-2">
                 <Zap size={14} className="text-amber-500" /> Quick Provisioning
              </h3>
              <div className="sf-card p-2 bg-sf-bg-soft/60">
                 <div className="divide-y divide-border/20">
                    {resources.filter(r=>r.active).slice(0, 4).map(r => (
                      <Link key={r.id} to={`/book/${r.id}`} className="p-4 flex items-center gap-4 group hover:bg-accent/40 rounded-2xl transition-all">
                         <div className="h-12 w-12 rounded-xl overflow-hidden border border-border/50 bg-black">
                            {r.image_url 
                               ? <img src={getResourceImg(r)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt="" />
                               : <div className="w-full h-full flex items-center justify-center text-lg opacity-20 grayscale">🏢</div>
                            }
                         </div>
                         <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                               <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{r.name}</div>
                               <div className={`h-1.5 w-1.5 rounded-full ${r.requires_approval ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`} title={r.requires_approval ? 'Approval Required' : 'Instant Approval'} />
                            </div>
                            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest truncate">{r.type}</div>
                         </div>
                         <ArrowUpRight size={16} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </Link>
                    ))}
                 </div>
              </div>
           </div>

           {/* High-End Empty State / Tip Card */}
           <div className="relative overflow-hidden rounded-[32px] p-8 border border-border/40 bg-background shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -z-10" />
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                 <Star size={24} />
              </div>
              <div className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-3">Protocol Optimization</div>
              <p className="text-sm text-muted-foreground leading-relaxed italic font-medium">
                 "Check-in within 15 minutes of your session window to maintain peak operational reliability."
              </p>
              <div className="mt-8 pt-6 border-t border-border/40 flex items-center gap-3">
                 <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Governance Engine Active</span>
              </div>
           </div>
        </div>

      </div>

      {/* ── Intelligence Report Modal ── */}
      {feedbackBooking && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
           <div className="sf-card w-full max-w-lg p-10 relative shadow-2xl animate-fade-in-up">
              <button onClick={() => setFeedbackBooking(null)} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-all p-2 hover:bg-accent rounded-xl">
                 <X size={20} />
              </button>
              
              <div className="mb-10 space-y-4">
                 <div className="sf-badge !bg-primary/10 !text-primary !border-primary/20">Resource Incident</div>
                 <h2 className="text-3xl font-bold tracking-tight">Report Intelligence Conflict</h2>
                 <p className="text-muted-foreground text-sm font-medium">Reporting issue for <span className="text-foreground font-bold">{feedbackBooking.resource_name}</span> session.</p>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-8">
                 <div className="space-y-3">
                    <label className="sf-label">Detailed Observations</label>
                    <textarea 
                       required
                       rows={5}
                       className="sf-input py-4 resize-none"
                       placeholder="Describe the discrepancy or resource failure..."
                       value={feedbackContent}
                       onChange={e => setFeedbackContent(e.target.value)}
                    />
                 </div>

                 <div className="pt-6 border-t border-border/40 flex gap-4">
                    <button type="button" onClick={() => setFeedbackBooking(null)} className="sf-btn-secondary flex-1 py-4">
                       Discard
                    </button>
                    <button type="submit" disabled={submittingFeedback} className="sf-btn-primary flex-[2] py-4">
                       {submittingFeedback ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Dispatch Report</>}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
