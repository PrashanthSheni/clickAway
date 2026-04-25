import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { TrendingUp, Activity, Box, ShieldCheck, Download, Filter, Calendar, Zap, Loader2, Sparkles, ChevronRight, BarChart3, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const BRAND_COLORS = ["#00bbff", "#0f172a", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4 shadow-2xl">
      <div className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">{label}</div>
      <div className="text-[#00bbff] font-bold text-2xl tracking-tighter">
        {payload[0].value}
        <span className="text-white/20 text-[10px] font-bold ml-2 uppercase tracking-widest">Units</span>
      </div>
    </div>
  );
};

export default function ReportsAnalytics() {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/reports/overview");
        setData(data);
      } catch (_) {}
    })();
  }, []);

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-[#00bbff]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400">Loading Analytics</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20"
    >
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 pb-10 border-b-2 border-slate-100">
        <div>
           <div className="flex items-center gap-4 mb-4">
             <div className="h-2.5 w-2.5 rounded-full bg-[#00bbff]" />
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Reports & Insights</span>
           </div>
           <h1 className="text-6xl font-plus font-bold text-[#1a1f2e] tracking-tight mb-6">Performance Overview.</h1>
           <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
              View detailed metrics on resource usage, team performance, and workspace efficiency.
           </p>
        </div>
        <div className="flex items-center gap-5">
           <button className="bg-[#fafaf9] text-slate-400 px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-slate-200 hover:text-[#1a1f2e] hover:border-slate-400 transition-all flex items-center gap-4 active:scale-95 shadow-sm">
              <Download size={18} /> Export Report
           </button>
           <button className="bg-[#1a1f2e] text-white px-10 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#00bbff] transition-all shadow-xl flex items-center gap-4 active:scale-95">
              <Filter size={18} /> Filter Results
           </button>
        </div>
      </header>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {[
          { label: "Total Bookings", value: data.total_bookings, icon: TrendingUp, color: "text-[#00bbff]", bg: "bg-blue-50" },
          { label: "Resource Utilization", value: `${data.avg_utilization}%`, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "No-Show Rate", value: `${data.no_show_rate}%`, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Total Resources", value: data.total_resources, icon: Box, color: "text-[#1a1f2e]", bg: "bg-slate-100" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#fafaf9] rounded-[3rem] p-10 border border-slate-200 hover:border-[#00bbff]/30 transition-all group shadow-sm hover:shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[#1a1f2e] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <kpi.icon size={100} />
             </div>
             <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center mb-10 border border-transparent shadow-inner group-hover:rotate-6 transition-all", kpi.bg, kpi.color)}>
                <kpi.icon size={28} strokeWidth={2.5} />
             </div>
             <div className="text-6xl font-bold text-[#1a1f2e] group-hover:text-[#00bbff] transition-colors tracking-tighter mb-2">{kpi.value}</div>
             <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Utilisation Graph */}
        <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 p-12 shadow-sm group hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
             <div className="flex items-center gap-4">
                <BarChart3 size={18} className="text-[#00bbff]" />
                <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">Usage by Resource</h3>
             </div>
             <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Resources with the highest booking rates.</div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.utilization_by_resource} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="utilization" fill="#00bbff" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 p-12 shadow-sm group hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
             <div className="flex items-center gap-4">
                <TrendingUp size={18} className="text-[#00bbff]" />
                <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">Booking Trends</h3>
             </div>
             <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Daily volume of total bookings.</div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.bookings_by_day}>
                <defs>
                   <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bbff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00bbff" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#00bbff" strokeWidth={5} fillOpacity={1} fill="url(#colorVelocity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Usage */}
        <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 p-12 shadow-sm group hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
             <div className="flex items-center gap-4">
                <Zap size={18} className="text-[#00bbff]" />
                <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">Peak Booking Hours</h3>
             </div>
             <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">When your workspace is most active.</div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peak_hours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#1a1f2e" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage by Team */}
        <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 p-12 shadow-sm group hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
             <div className="flex items-center gap-4">
                <Database size={18} className="text-[#00bbff]" />
                <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">Usage by Team</h3>
             </div>
             <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Breakdown of resource usage across departments.</div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.bookings_by_department} dataKey="count" nameKey="department" innerRadius={80} outerRadius={130} paddingAngle={10}>
                  {data.bookings_by_department.map((_, i) => <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} className="outline-none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Underutilised Alert Section */}
      <div className="bg-[#fafaf9] rounded-[4rem] border border-slate-200 p-12 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-[0.02] text-red-500 pointer-events-none group-hover:scale-110 transition-transform duration-1000 uppercase font-bold text-9xl">ALERT</div>
        <div className="flex items-center gap-4 mb-10">
           <ShieldCheck size={18} className="text-red-500" />
           <h3 className="text-[12px] font-bold text-[#1a1f2e] uppercase tracking-[0.5em]">Low Usage Alerts (Below 15%)</h3>
        </div>
        
        {data.underutilized_resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-emerald-50/50 rounded-[3rem] border border-emerald-100">
             <Sparkles size={48} className="text-emerald-500 mb-6" />
             <div className="text-2xl font-plus font-bold text-emerald-900 tracking-tight">All resources are being used efficiently.</div>
             <p className="text-emerald-600/60 text-[10px] font-bold uppercase tracking-widest mt-4">All resources are performing above the 15% threshold.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.underutilized_resources.map((u) => (
              <div key={u.resource_id} className="flex items-center justify-between p-8 bg-[#f5f5f4] rounded-3xl border border-slate-100 group/item hover:bg-[#fafaf9] hover:shadow-xl transition-all">
                <div className="flex items-center gap-5">
                   <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner group-hover/item:scale-110 transition-transform">
                      <Zap size={22} />
                   </div>
                   <span className="text-lg font-bold text-[#1a1f2e] tracking-tight group-hover/item:text-red-500 transition-colors">{u.name}</span>
                </div>
                <div className="text-3xl font-bold text-red-600 tracking-tighter">{u.utilization}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
