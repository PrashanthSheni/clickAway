import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Command, ChevronRight, Globe, Cpu, Layers, Sparkles, ArrowRight, 
  Zap, CheckCircle2, Shield, BarChart, Bell, Calendar, Map, Smartphone,
  Activity, TrendingDown, Target, ZapOff, Clock, SmartphoneIcon, UserCheck, RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend, Cell
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const radarData = [
  { subject: 'On-Time', A: 120, fullMark: 150 },
  { subject: 'Check-in', A: 98, fullMark: 150 },
  { subject: 'Resource Care', A: 86, fullMark: 150 },
  { subject: 'Early Release', A: 99, fullMark: 150 },
  { subject: 'Collaboration', A: 85, fullMark: 150 },
];

// --- Accountability Animation Component ---
function AccountabilityFlow() {
  const [step, setStep] = useState(0); // 0: Booked, 1: Countdown, 2: No-Show, 3: Released

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const STAGES = [
    { 
      title: "Booking Active", 
      desc: "Resource locked in system.", 
      icon: <CheckCircle2 className="text-[#00bbff]" />, 
      color: "border-[#00bbff]/30 bg-[#00bbff]/5",
      tag: "RESERVED"
    },
    { 
      title: "Monitoring Entry", 
      desc: "Waiting for physical check-in.", 
      icon: <Clock className="text-amber-500 animate-pulse" />, 
      color: "border-amber-500/30 bg-amber-500/5",
      tag: "10:00 LIMIT"
    },
    { 
      title: "No-Show Detected", 
      desc: "Identity verification failed.", 
      icon: <ZapOff className="text-red-500" />, 
      color: "border-red-500/30 bg-red-500/5",
      tag: "TRIGGERED"
    },
    { 
      title: "Resource Released", 
      desc: "Available for marketplace.", 
      icon: <RefreshCw className="text-emerald-500" />, 
      color: "border-emerald-500/30 bg-emerald-500/5",
      tag: "OPEN"
    }
  ];

  return (
    <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#00bbff]/5 blur-[120px] rounded-full" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className={cn(
            "w-full max-w-sm rounded-[3.5rem] border-2 p-10 shadow-2xl relative z-10 transition-colors duration-1000 backdrop-blur-xl",
            STAGES[step].color
          )}
        >
          <div className="flex justify-between items-start mb-10">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-inner">
               {STAGES[step].icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 bg-zinc-900/50 px-4 py-1.5 rounded-full border border-white/5">
               {STAGES[step].tag}
            </span>
          </div>
          
          <h4 className="text-3xl font-plus font-bold text-white mb-3 tracking-tight">{STAGES[step].title}</h4>
          <p className="text-zinc-400 font-medium mb-12">{STAGES[step].desc}</p>
          
          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex items-center gap-4">
              <SmartphoneIcon size={18} className="text-zinc-500" />
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: step >= 1 ? "100%" : "0%" }}
                  className="h-full bg-[#00bbff]" 
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
               <span>System Beacon</span>
               <span>{step === 3 ? "Released" : "Active"}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Background decorative cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm h-full max-h-[350px] border-2 border-white/5 rounded-[3.5rem] rotate-6 -z-10 opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm h-full max-h-[350px] border-2 border-white/5 rounded-[3.5rem] -rotate-3 -z-20 opacity-10" />
    </div>
  );
}

export default function Solutions() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    document.title = "Solutions Hub | clickAway Intelligence";
    window.scrollTo(0, 0);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-inter selection:bg-[#00bbff]/20 selection:text-[#00bbff] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-plus { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        @keyframes subtle-zoom {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-10px); }
          100% { transform: scale(1) translateY(0); }
        }
        .animate-subtle-zoom { animation: subtle-zoom 15s ease-in-out infinite; }
      `}</style>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-300",
        scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20" : "bg-transparent"
      )}>
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00bbff] to-[#0055ff] p-[1px] shadow-[0_0_20px_rgba(0,187,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,187,255,0.5)] transition-shadow">
            <div className="h-full w-full bg-[#0a0a0a] rounded-xl flex items-center justify-center">
              <Command size={18} className="text-[#00bbff]" />
            </div>
          </div>
          <span className="font-bold tracking-[0.15em] text-white uppercase text-sm drop-shadow-md">
            click<span className="text-[#00bbff]">Away</span>
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link to="/solutions" className="text-sm font-bold text-white border-b-2 border-[#00bbff] pb-1">Solutions</Link>
            <Link to="/pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          </div>
          <Link to="/auth" className="text-sm font-bold text-white hover:text-[#00bbff] transition-colors mr-4">Sign In</Link>
          <Link to="/auth" className="bg-[#00bbff] text-black px-6 py-3 rounded-md text-sm font-bold hover:bg-white transition-all duration-300">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/solutions_hero.jpg" 
            alt="Intelligence" 
            className="w-full h-full object-cover opacity-60 grayscale-[30%] brightness-[0.5] animate-subtle-zoom transform-gpu"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>
        
        <div className="relative z-10 px-8 max-w-[1400px] mx-auto w-full">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#00bbff] text-[10px] font-bold tracking-[0.4em] uppercase mb-8"
          >Enterprise Intelligence</motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-9xl font-plus font-bold text-white leading-[0.95] tracking-tighter mb-8 max-w-5xl"
          >
            Exhaustive Power.<br />
            <span className="text-zinc-500">Total Control.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-3xl font-medium leading-relaxed mb-12"
          >
            Unified identity for the modern enterprise. Scale your workspace efficiency through our secure AI-driven ecosystem.
          </motion.p>
          <div className="flex flex-wrap gap-6">
            <a href="#core-engine" className="bg-[#00bbff] text-black px-12 py-6 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-white transition-all flex items-center gap-4 group shadow-[0_20px_40px_rgba(0,187,255,0.2)]">
              Explore Engine <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Core AI Section */}
      <section id="core-engine" className="py-48 px-8 bg-[#080808] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#00bbff] mb-10 border border-white/5 shadow-inner">
              <Cpu size={32} />
            </div>
            <h2 className="text-5xl md:text-7xl font-plus font-bold text-white mb-8 leading-[1.0] tracking-tighter">AI Suggestion Engine</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-12 font-medium">
              We don't just reject bookings. Our backend uses high-fidelity algorithms to scan your entire facility and offer proactive alternatives in real-time.
            </p>
            <div className="space-y-8">
              {[
                { title: "Dynamic Scoring", desc: "Every suggestion is ranked by proximity and similarity to your initial request." },
                { title: "Smart Substitution", desc: "Automatically upgrade to larger spaces if smaller units are occupied." },
                { title: "Conflict Mitigation", desc: "Instantly finds the next available window, minimizing calendar friction." }
              ].map((f, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="mt-1 h-6 w-6 rounded-full border-2 border-[#00bbff]/20 flex items-center justify-center shrink-0 group-hover:border-[#00bbff] transition-colors">
                    <div className="h-2 w-2 rounded-full bg-[#00bbff]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-2">{f.title}</h4>
                    <p className="text-zinc-500 font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#00bbff]/10 blur-[120px] rounded-full" />
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[4rem] p-12 relative z-10 shadow-2xl">
               <div className="space-y-6">
                 {[
                   { label: "ATTEMPT", val: "Boardroom 402", status: "Occupied", color: "text-red-500" },
                   { label: "SUGGESTION", val: "Executive Suite 408", status: "98% Match", color: "text-[#00bbff]" },
                   { label: "SUGGESTION", val: "Boardroom 402 @ 2:30 PM", status: "Available", color: "text-[#00bbff]" }
                 ].map((s, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl flex justify-between items-center group hover:bg-zinc-900 transition-all"
                   >
                     <div>
                       <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{s.label}</p>
                       <p className="text-white font-bold text-lg">{s.val}</p>
                     </div>
                     <span className={cn("text-[10px] font-bold uppercase tracking-widest", s.color)}>{s.status}</span>
                   </motion.div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accountability Section - Redesigned with Animation */}
      <section className="py-48 px-8 bg-[#0a0a0a] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
             <AccountabilityFlow />
          </div>

          <div className="order-1 lg:order-2">
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#00bbff] mb-10 border border-white/5 shadow-inner">
              <Shield size={32} />
            </div>
            <h2 className="text-5xl md:text-7xl font-plus font-bold text-white mb-8 leading-[1.0] tracking-tighter">Accountability is Built-In.</h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-12 font-medium">
              Every booking requires a QR check-in via the Smartphone App. No show? The resource is <span className="text-[#00bbff] font-bold underline underline-offset-8 decoration-2 decoration-[#00bbff]/30 italic">automatically released</span> to the marketplace within 10 minutes.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: TrendingDown, title: "Ghost Mitigation", desc: "94% reduction in empty rooms within 30 days." },
                { icon: ZapOff, title: "Auto-Release", desc: "Sensors detect inactivity and force-release assets." },
                { icon: Target, title: "Access Gating", desc: "Only high-score employees gain premium labs." },
                { icon: UserCheck, title: "ID Verification", desc: "Secure tokens ensure the right person in the right space." }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] group hover:bg-zinc-900 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-[#00bbff] transition-all mb-6 border border-white/5 shadow-inner">
                    <item.icon size={20} />
                  </div>
                  <h4 className="text-white font-bold mb-2">{item.title}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Matrix */}
      <section className="py-48 px-8 bg-[#080808] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-32">
            <h2 className="text-5xl md:text-8xl font-plus font-bold text-white tracking-tighter leading-[1.0] mb-8">Service Matrix.</h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium">From the physical floor to the digital cloud. One unified backend.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Map, title: "Live Floor Plans", desc: "Interactive map visualizations showing live occupancy and colleague proximity." },
              { icon: Calendar, title: "Team Sync", desc: "See where your team is sitting. clickAway suggests desks near your project leads." },
              { icon: Smartphone, title: "Mobile QR Hub", desc: "Native iOS & Android apps for instant booking, physical check-ins, and door access." },
              { icon: Shield, title: "Access Policies", desc: "Role-based access control. Reserve executive wings for specific departments." },
              { icon: Command, title: "Maintenance", desc: "Instantly deploy maintenance blocks that automatically re-route impacted employees." },
              { icon: Globe, title: "Global Portfolio", desc: "Manage multi-region portfolios. Shared credits across London, NY, and Tokyo." }
            ].map((item, i) => (
              <div key={i} className="group bg-zinc-900/40 border border-white/5 p-12 rounded-[3.5rem] hover:bg-zinc-900 hover:border-[#00bbff]/20 transition-all duration-500">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#00bbff] mb-10 border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-48 px-8 bg-[#0a0a0a] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-24 items-center">
           <div className="lg:w-1/2">
              <h2 className="text-5xl md:text-8xl font-plus font-bold text-white mb-16 tracking-tighter leading-[1.0]">Roadmap.</h2>
              <div className="space-y-16">
                {[
                  { year: "Q3 2026", title: "Virtual Space Twins", desc: "Full 3D walk-throughs integrated into the booking flow." },
                  { year: "Q4 2026", title: "Occupancy AI v2", desc: "Predictive heating and lighting optimization based on density." },
                  { year: "2027", title: "Facility Robotics", desc: "Integrated cleaning and security robot routing via live usage data." }
                ].map((r, i) => (
                  <div key={i} className="relative pl-12 border-l-2 border-white/5 hover:border-[#00bbff] transition-colors pb-2">
                    <div className="absolute top-0 left-[-9px] h-4 w-4 rounded-full bg-zinc-900 border-2 border-white/5 group-hover:bg-[#00bbff]" />
                    <p className="text-[#00bbff] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{r.year}</p>
                    <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">{r.title}</h4>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
           </div>
           <div className="lg:w-1/2 w-full">
              <div className="bg-zinc-900/80 backdrop-blur-3xl border border-white/5 p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-20 transition-all group-hover:rotate-12 duration-1000">
                    <Sparkles className="text-[#00bbff]" size={150} />
                 </div>
                 <div className="relative z-10">
                   <h3 className="text-5xl font-plus font-bold text-white mb-8 italic tracking-tighter">Suggest the future?</h3>
                   <p className="text-zinc-400 text-xl mb-12 leading-relaxed font-medium">We are an engineer-led platform. Have a scope you need? Let's build it together.</p>
                   <Link to="/feature-request" className="w-full bg-white text-black py-8 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-[#00bbff] transition-all flex items-center justify-center gap-4 group">
                      Initialize Consultation <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                   </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-16 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-xl bg-white/5 p-[1px]">
              <div className="h-full w-full bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                <Command size={20} className="text-[#00bbff]" />
              </div>
            </div>
            <span className="text-base font-bold text-white uppercase tracking-[0.2em]">
              click<span className="text-[#00bbff]">Away</span>
            </span>
          </div>
          <div className="flex items-center gap-10">
            <Link to="#" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Terms</Link>
            <Link to="#" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Privacy</Link>
            <Link to="#" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
