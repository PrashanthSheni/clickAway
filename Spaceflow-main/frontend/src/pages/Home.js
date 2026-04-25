import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Users, Shield, Zap, ArrowRight, CheckCircle2, ChevronRight, Monitor, Coffee, Car, Mic, Command } from "lucide-react";
import { cn } from "../lib/utils";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const demoVideoRef = useRef(null);

  useEffect(() => {
    // Scroll listener for nav
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    
    // SEO Metadata
    document.title = "clickAway | Intelligent Workspace Automation & Desk Booking";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "clickAway is the premier workspace intelligence platform. Automate hot desking, meeting room management, and office analytics for enterprise hybrid teams.";

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-inter selection:bg-[#00bbff]/20 selection:text-[#00bbff] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-plus { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        /* Background Animations */
        @keyframes slowPan {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.1) translate(-1%, 1%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }
        .animate-slow-pan {
          animation: slowPan 20s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
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
            <Link to="/solutions" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Solutions</Link>
            <Link to="/pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          </div>
          <Link to="/auth" className="text-sm font-bold text-white hover:text-[#00bbff] transition-colors mr-4">Sign In</Link>
          <Link to="/auth" className="bg-[#00bbff] text-black px-6 py-3 rounded-md text-sm font-bold hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(0,187,255,0.3)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-8 flex flex-col items-center justify-center text-center w-full min-h-[95vh] overflow-hidden">
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
          }}
        >
          <div 
            className="absolute inset-0 opacity-30 grayscale-[30%] brightness-[0.7] animate-slow-pan transform-gpu origin-center"
            style={{ 
              backgroundImage: "url('/videos/background.png')", 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
            }} 
          />
        </div>
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00bbff]/10 blur-[130px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col items-center max-w-5xl mt-12 animate-float">
          <h1 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#00bbff] mb-6">
            Intelligent Workspace Automation
          </h1>
          
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-plus font-bold text-white tracking-tighter leading-[0.95] mb-8 drop-shadow-2xl">
            Your Workspace,<br />
            <span className="text-zinc-500 italic">actually working.</span>
          </h2>
          
          <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-md">
            The premier platform to proactively manage hot desking, team locations, and office real estate. Every tool unified into one intelligent system.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link to="/auth" className="w-full sm:w-auto bg-[#00bbff] text-black px-12 py-6 rounded-2xl text-lg font-bold hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,187,255,0.2)] flex items-center justify-center gap-3 group">
              Try clickAway Free <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-white px-12 py-6 rounded-2xl text-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-3 border border-white/5 shadow-2xl">
              See it in action
            </button>
          </div>
        </div>
      </section>

      {/* Shareable Resources Section */}
      <section className="relative w-full pt-48 pb-24 z-20 overflow-hidden bg-[#080808] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="mb-24 max-w-3xl">
            <p className="text-[#00bbff] text-[10px] font-bold uppercase tracking-[0.4em] mb-6">Resource Marketplace</p>
            <h2 className="text-5xl md:text-7xl font-plus font-bold text-white mb-8 leading-[1.0] tracking-tighter">
              Share more than<br />just desks.
            </h2>
            <p className="text-zinc-500 text-xl font-medium leading-relaxed">
              Unlock the full potential of your real estate. clickAway allows you to manage, monetize, and share a vast array of premium workplace amenities with your team.
            </p>
          </div>

          <div 
            className="group relative overflow-hidden transition-all duration-700 cursor-crosshair aspect-[4/1] md:aspect-[5/1] w-full flex items-center justify-center mx-auto mb-24 rounded-[3rem] border border-white/5 shadow-2xl"
            onMouseEnter={() => demoVideoRef.current?.play()}
            onMouseLeave={() => demoVideoRef.current?.pause()}
          >
            <video 
              ref={demoVideoRef}
              loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-[1.05] group-hover:scale-100 grayscale-[30%] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-[0.9]"
            >
              <source src="/videos/landingdb.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            {[
              { title: "Hot Workstations", icon: Monitor, desc: "High-performance desks with premium monitors and ergonomic seating." },
              { title: "Elite Boardrooms", icon: Coffee, desc: "State-of-the-art meeting spaces for critical executive decisions." },
              { title: "Podcast Studios", icon: Mic, desc: "Acoustically treated environments for media production." },
              { title: "VIP Parking", icon: Car, desc: "Dedicated secure spaces for your team and high-profile visitors." }
            ].map((item, i) => (
              <div key={i} className="group bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] hover:bg-zinc-900 transition-all duration-500">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#00bbff] mb-8 border border-white/5 shadow-inner">
                  <item.icon size={24} />
                </div>
                <h3 className="text-2xl font-plus font-bold text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="pt-24 pb-48 w-full bg-[#0a0a0a] border-y border-white/5 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col xl:flex-row items-center gap-20 mb-32 relative">
            <div className="flex-1 max-w-3xl relative z-10">
              <h2 className="text-5xl md:text-8xl font-plus font-bold text-white mb-8 tracking-tighter leading-[1.0]">
                Intelligence,<br />built right in.
              </h2>
              <p className="text-zinc-500 text-xl md:text-2xl font-medium">We analyzed how enterprises actually use real estate. We built clickAway to automate the friction away.</p>
            </div>

            <div className="flex-1 w-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#00bbff]/5 blur-[120px] rounded-full pointer-events-none" />
              <div 
                className="relative overflow-hidden aspect-[4/3] w-full group rounded-3xl"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
                }}
              >
                <video 
                  autoPlay loop muted playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-[1.05] group-hover:scale-100 grayscale-[40%] brightness-[0.6] group-hover:grayscale-[10%] group-hover:brightness-[0.9]"
                >
                  <source src="/videos/product.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none opacity-80" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { id: "ai", icon: Zap, title: "Smart Conflict Resolution", desc: "Our engine automatically scans for alternative rooms and suggests the perfect slot when your primary choice is unavailable." },
              { id: "reliability", icon: CheckCircle2, title: "Reliability Tracking", desc: "Eliminate 'ghost bookings' forever. We track physical check-ins and issue reliability scores to hold teams accountable." },
              { id: "approvals", icon: Shield, title: "Autonomous Approvals", desc: "Lock down premium assets by department or role. High-value requests route to managers for one-click approval." },
              { id: "control", icon: Command, title: "Total Facility Control", desc: "Instantly deploy maintenance blocks that automatically re-route impacted employees and notify users." }
            ].map((f, index) => (
              <div key={f.id} id={f.id} className="rounded-[3.5rem] bg-zinc-900/40 p-12 border border-white/5 hover:bg-zinc-900 transition-all group shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#00bbff] mb-10 border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                  <f.icon size={32} />
                </div>
                <h3 className="text-3xl font-plus font-bold text-white mb-6 tracking-tight">{f.title}</h3>
                <p className="text-zinc-500 text-lg leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Massive CTA Section */}
      <section className="py-48 px-8 relative overflow-hidden bg-[#0a0a0a]">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[#00bbff]/15 blur-[180px] rounded-full pointer-events-none" 
        />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[#00bbff] text-[11px] font-bold uppercase tracking-[0.4em] mb-10"
          >Final Transmission</motion.p>
          <h2 className="text-7xl md:text-9xl font-plus font-bold text-[#00bbff] mb-16 tracking-tighter leading-[0.9]">
            Ready to<br />
            <span className="text-white">clickAway?</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/auth" className="w-full sm:w-auto bg-[#00bbff] text-black px-16 py-8 rounded-[2rem] text-xl font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_30px_60px_rgba(0,187,255,0.3)] flex items-center justify-center gap-4 group active:scale-95">
              Initialize Access <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-16 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 opacity-30 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 p-[1px]">
              <div className="h-full w-full bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                <Command size={20} className="text-[#00bbff]" />
              </div>
            </div>
            <span className="text-base font-bold text-white uppercase tracking-[0.2em]">
              click<span className="text-[#00bbff]">Away</span>
            </span>
          </div>
          <div className="text-xs font-bold text-zinc-600 tracking-[0.1em] uppercase">
            © {new Date().getFullYear()} clickAway. Built for high-fidelity enterprise.
          </div>
        </div>
      </footer>
    </div>
  );
}