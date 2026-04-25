import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, BACKEND_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BookingStateBadge from "../components/BookingStateBadge";
import { 
  Plus, ArrowRight, QrCode, CalendarDays, Clock, 
  MapPin, Activity, CheckCircle, Loader2, Star,
  Box, MessageSquare, X, Send, LayoutDashboard, Target,
  ChevronRight, BarChart3, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const activityData = [
  { name: 'Mon', bookings: 1 },
  { name: 'Tue', bookings: 3 },
  { name: 'Wed', bookings: 2 },
  { name: 'Thu', bookings: 4 },
  { name: 'Fri', bookings: 2 },
  { name: 'Sat', bookings: 0 },
  { name: 'Sun', bookings: 0 },
];

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
      toast.success("Feedback Submitted", { description: "Thank you for your feedback." });
      setFeedbackBooking(null);
      setFeedbackContent("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-8 h-8 text-[#0ea5e9]" />
      <p className="text-sm font-semibold text-slate-500">Loading Dashboard...</p>
    </div>
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* ── Welcome Header ── */}
      <motion.div 
        variants={item}
        className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-slate-500 text-base font-medium">
            You have <span className="text-slate-900 font-semibold">{upcoming.length} upcoming bookings</span> scheduled.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/browse" className="bg-[#0ea5e9] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#0284c7] transition-colors shadow-sm flex items-center gap-2">
            <Plus size={18} /> New Booking
          </Link>
          <Link to="/checkin" className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <QrCode size={18} /> Quick Check-in
          </Link>
        </div>
      </motion.div>

      {/* ── Stats & Graph Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graph Card */}
        <motion.div variants={item} className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity size={20} className="text-[#0ea5e9]" /> Weekly Activity
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Your booking frequency over the last 7 days</p>
            </div>
          </div>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={item} className="space-y-8 flex flex-col">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Target size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reliability Score</div>
                <div className="text-3xl font-bold text-slate-900">{reliabilityScore}%</div>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">You're in the top 10% of reliable users. Keep it up to maintain priority access.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</div>
                <div className="text-3xl font-bold text-slate-900">{completed.length} Bookings</div>
              </div>
            </div>
            <Link to="/bookings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2 w-fit">
              View history <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Upcoming & Available Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming */}
        <motion.div variants={item} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays size={20} className="text-[#0ea5e9]" /> Upcoming Bookings
            </h3>
            <Link to="/bookings" className="text-sm font-semibold text-[#0ea5e9] hover:text-[#0284c7]">View All</Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="text-slate-400 mb-3 flex justify-center"><CalendarDays size={32} /></div>
              <p className="text-slate-600 font-semibold">No upcoming bookings</p>
              <p className="text-slate-500 text-sm mt-1">Book a desk or meeting room to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.slice(0, 4).map(b => (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group bg-slate-50">
                  <div className="flex items-center gap-5">
                    <div className="bg-white h-14 w-14 rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-xs font-bold text-slate-500 uppercase">{new Date(b.start_time).toLocaleDateString(undefined, {month:'short'})}</span>
                      <span className="text-xl font-bold text-slate-900 leading-none">{new Date(b.start_time).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{b.resource_name}</h4>
                      <div className="text-sm text-slate-500 font-medium flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> Floor {b.resource_floor || 'G'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 pl-16 sm:pl-0">
                    <BookingStateBadge state={b.state} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Available Resources */}
        <motion.div variants={item} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Box size={20} className="text-[#0ea5e9]" /> Quick Book
            </h3>
            <Link to="/browse" className="text-sm font-semibold text-[#0ea5e9] hover:text-[#0284c7]">Browse All</Link>
          </div>

          <div className="space-y-4">
            {resources.filter(r=>r.active).slice(0, 4).map(r => (
              <Link key={r.id} to={`/book/${r.id}`} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                    {r.image_url 
                      ? <img src={getResourceImg(r)} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">🏬</div>
                    }
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-[#0ea5e9] transition-colors">{r.name}</h4>
                    <p className="text-sm text-slate-500 font-medium capitalize mt-1">{r.type}</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:border-[#0ea5e9] transition-colors shadow-sm">
                  <Plus size={18} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Feedback Modal ── */}
      <AnimatePresence>
        {feedbackBooking && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white border border-slate-200 w-full max-w-lg p-8 relative rounded-3xl shadow-xl"
             >
                <button onClick={() => setFeedbackBooking(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100">
                   <X size={20} />
                </button>
                
                <div className="mb-8">
                   <h2 className="text-2xl font-bold text-slate-900 mb-2">Share your experience</h2>
                   <p className="text-slate-500 text-sm font-medium">How was your time at <span className="text-slate-900 font-bold">{feedbackBooking.resource_name}</span>?</p>
                </div>

                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                   <div>
                      <textarea 
                         required
                         rows={4}
                         className="w-full bg-slate-50 border border-slate-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium resize-none"
                         placeholder="Let us know how the workspace was..."
                         value={feedbackContent}
                         onChange={e => setFeedbackContent(e.target.value)}
                      />
                   </div>

                   <div className="flex gap-4">
                      <button type="button" onClick={() => setFeedbackBooking(null)} className="px-6 py-3 bg-white text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors border border-slate-200">
                         Cancel
                      </button>
                      <button type="submit" disabled={submittingFeedback} className="flex-1 bg-[#0ea5e9] text-white rounded-xl font-semibold text-sm hover:bg-[#0284c7] transition-colors flex items-center justify-center gap-2 shadow-sm">
                         {submittingFeedback ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Submit Feedback</>}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
