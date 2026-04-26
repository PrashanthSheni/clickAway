import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { 
   Monitor, Camera, Github, Linkedin,
   Globe, Shield, Zap, ArrowRight, CheckCircle2 
} from "lucide-react";

const Solutions = () => {
   const { theme, toggleTheme } = useTheme();
   const [scrolled, setScrolled] = useState(false);
   const [footerVisible, setFooterVisible] = useState(false);
   const footerRef = useRef(null);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setFooterVisible(true);
            }
         },
         { threshold: 0.1 }
      );
      if (footerRef.current) {
         observer.observe(footerRef.current);
      }
      return () => observer.disconnect();
   }, []);

   useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   const features = [
      { title: "Smart Conflict Resolution", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, desc: "Our engine automatically scans for alternative rooms and suggests the perfect slot when your primary choice is unavailable." },
      { title: "Reliability Tracking", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, desc: "Eliminate 'ghost bookings' forever. We track physical check-ins and issue reliability scores to hold teams accountable." },
      { title: "Autonomous Approvals", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, desc: "Lock down premium assets by department or role. High-value requests route to managers for one-click approval." },
      { title: "Total Facility Control", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, desc: "Instantly deploy maintenance blocks that automatically re-route impacted employees and notify users." }
   ];

   return (
      <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-background text-foreground'}`}>
         {/* ── Nav ── */}
         <nav className={`
            fixed top-0 left-0 w-full z-[100] transition-all duration-500
            ${scrolled
               ? "h-16 bg-background/80 backdrop-blur-xl border-b border-border/40 px-12 text-foreground"
               : "h-24 px-16 bg-transparent text-white"}
            flex items-center justify-between
         `}>
            <div className="flex items-center gap-3">
               <img src="/videos/logofinall.png" alt="clickAway" className="h-10 w-10 object-contain" />
               <span className="font-bold text-lg tracking-tight">click<span className="text-primary">A</span>way</span>
            </div>

            <div className="flex items-center gap-8">
               <div className="hidden lg:flex items-center gap-8">
                  <Link to="/" className={`text-sm font-semibold transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/60 hover:text-white"}`}>Home</Link>
                  <Link to="/solutions" className={`text-sm font-semibold transition-colors underline underline-offset-4 ${scrolled ? "text-foreground" : "text-white"}`}>Solutions</Link>
                  <Link to="/pricing" className={`text-sm font-semibold transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/60 hover:text-white"}`}>Pricing</Link>
               </div>
               <div className="h-6 w-[1px] bg-border/40" />
               <button onClick={toggleTheme} className="p-2 rounded-xl">
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
               </button>
               <Link to="/auth" className="sf-btn-primary px-5 py-2 text-xs">Sign In</Link>
            </div>
         </nav>

         {/* ── Solutions Hero ── */}
         <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-8 overflow-hidden text-white">
            <div className="absolute inset-0 z-0">
               <img
                  src="/videos/camera.jpeg"
                  className="w-full h-full object-cover opacity-60"
                  alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
            </div>

            <div className="relative z-10 max-w-5xl text-center space-y-8 animate-fade-in-up">
               <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Enterprise Intelligence</span>
                  <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                     Exhaustive Power.<br />
                     <span className="text-white/40">Total Control.</span>
                  </h1>
               </div>
               <p className="text-lg md:text-2xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed">
                  We don't just manage spaces. We solve the fundamental inefficiencies of modern real estate.
               </p>
            </div>
         </section>

         {/* ── Problem/Solution Solver Section ── */}
         <section className="py-32 px-8 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
               {[
                  {
                     problem: "The Empty Office Paradox",
                     solution: "Asset Monetization Engine",
                     desc: "Solving the $12B problem of underutilized real estate. clickAway turns dormant desks and meeting rooms into active, shareable, and monetizable assets.",
                     tag: "Financial Efficiency"
                  },
                  {
                     problem: "The Scheduling Chaos",
                     solution: "Conflict Resolution Core",
                     desc: "Eliminating the friction of manual booking. Our engine automatically re-routes overlapping requests and optimizes room selection based on team size and equipment needs.",
                     tag: "Operational Speed"
                  },
                  {
                     problem: "The 'Ghost Booking' Drain",
                     solution: "Reliability Validation",
                     desc: "Solving the issue of reserved but unused spaces. We implement physical check-in validation and reliability scoring to ensure 100% asset availability.",
                     tag: "Resource Integrity"
                  },
                  {
                     problem: "Governance Overload",
                     solution: "Autonomous Approvals",
                     desc: "Removing the manual approval bottleneck. High-value assets are governed by role-based logic that automates security and manager oversight without delays.",
                     tag: "Enterprise Security"
                  }
               ].map((solver, i) => (
                  <div key={i} className={`
                     group relative p-8 rounded-[32px] border transition-all duration-500 overflow-hidden
                     ${theme === 'dark' 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                        : 'bg-accent/50 border-border hover:bg-accent/80'}
                  `}>
                     <div className="absolute top-0 right-0 p-6">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border
                           ${theme === 'dark' 
                              ? 'text-primary bg-primary/10 border-primary/20' 
                              : 'text-primary bg-primary/5 border-primary/20'}
                        `}>
                           {solver.tag}
                        </span>
                     </div>
                     
                     <div className="space-y-8">
                        <div className="space-y-3">
                           <div className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/30' : 'text-muted-foreground/60'}`}>The Challenge</div>
                           <h3 className={`text-2xl font-bold tracking-tight transition-colors
                              ${theme === 'dark' ? 'text-white/60 group-hover:text-white' : 'text-foreground/70 group-hover:text-foreground'}
                           `}>
                              {solver.problem}
                           </h3>
                        </div>

                        <div className={`h-[1px] w-full bg-gradient-to-r ${theme === 'dark' ? 'from-primary/40 to-transparent' : 'from-primary/20 to-transparent'}`} />

                        <div className="space-y-4">
                           <div className="flex items-center gap-2.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#3b82f6]" />
                              <div className="text-[11px] font-black uppercase tracking-widest text-primary">The Solution: {solver.solution}</div>
                           </div>
                           <p className={`text-base leading-relaxed font-medium transition-colors
                              ${theme === 'dark' ? 'text-white/40 group-hover:text-white/70' : 'text-muted-foreground group-hover:text-foreground/80'}
                           `}>
                              {solver.desc}
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* ── Unified Ecosystem Background Section (Projector Fit) ── */}
         <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 overflow-hidden text-white">
            <div className="absolute inset-0 z-0">
               <img
                  src="/videos/conferencehall.jpeg"
                  className="w-full h-full object-cover opacity-90"
                  alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl h-[400px] flex flex-col items-center justify-center animate-fade-in-up">
               {/* This inner container is sized to overlay the projector screen in the background image */}
               <div className="max-w-md space-y-3 px-4 translate-y-[-70px]">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.85] uppercase text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                     Unified<br />Ecosystem.
                  </h2>
                  <p className="text-[10px] md:text-[11px] text-white/90 max-w-[280px] mx-auto font-black tracking-[0.15em] leading-relaxed drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                     WE SOLVE THE FRAGMENTATION OF WORKPLACE TOOLS BY CONSOLIDATING IDENTITY, ACCESS, AND BOOKING INTO A SINGLE ORCHESTRATION LAYER.
                  </p>
               </div>
            </div>
         </section>

         {/* ── Professional Theme-Aware Footer ── */}
         <footer ref={footerRef} className={`py-24 px-8 border-t transition-all duration-1000 overflow-hidden
            ${theme === 'dark' ? 'bg-[#050505] border-white/5 text-white' : 'bg-slate-50 border-black/5 text-slate-900'}
            ${footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
         `}>
            <div className="max-w-7xl mx-auto space-y-20">
               {/* Top Branding Cluster */}
               <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3">
                     <img src="/videos/logofinall.png" alt="clickAway" className="h-10 w-10 object-contain" />
                     <span className="font-bold text-3xl tracking-tighter">click<span className="text-primary">A</span>way</span>
                  </div>
                  <div className="space-y-4">
                     <p className={`text-xs font-medium tracking-[0.2em] uppercase
                        ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}
                     `}>
                        © {new Date().getFullYear()} clickAway Solutions • ARCHITECTURE RESERVED
                     </p>
                     <div className={`h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-current to-transparent opacity-20`} />
                     <p className={`text-[10px] font-bold tracking-[0.4em] uppercase
                        ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}
                     `}>
                        Prashanth • Pankaj • Ananya • Praneetha
                     </p>
                  </div>
               </div>

               {/* Navigation Ecosystem */}
               <div className={`grid grid-cols-1 md:grid-cols-3 gap-16 pt-16 border-t 
                  ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}
               `}>
                  <div className="space-y-8 text-left">
                     <h4 className={`text-xs font-black uppercase tracking-[0.3em] 
                        ${theme === 'dark' ? 'text-white/30' : 'text-slate-500'}
                     `}>Platform</h4>
                     <div className={`flex flex-col gap-4 text-sm font-semibold
                        ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}
                     `}>
                        <Link to="/" className="hover:text-primary transition-colors">Enterprise Home</Link>
                        <a href="#" className="hover:text-primary transition-colors">Asset Marketplace</a>
                        <a href="#" className="hover:text-primary transition-colors">Intelligence Layer</a>
                     </div>
                  </div>

                  <div className="space-y-8 text-center">
                     <h4 className={`text-xs font-black uppercase tracking-[0.3em] 
                        ${theme === 'dark' ? 'text-white/30' : 'text-slate-500'}
                     `}>Social Connect</h4>
                     <div className="flex items-center justify-center gap-8">
                        <a href="#" className={`transition-all duration-500 transform hover:scale-110 hover:text-primary
                           ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}
                        `}>
                           <Github className="w-6 h-6" />
                        </a>
                        <a href="#" className={`transition-all duration-500 transform hover:scale-110 hover:text-primary
                           ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}
                        `}>
                           <Linkedin className="w-6 h-6" />
                        </a>
                     </div>
                  </div>

                  <div className="space-y-8 text-right">
                     <h4 className={`text-xs font-black uppercase tracking-[0.3em] 
                        ${theme === 'dark' ? 'text-white/30' : 'text-slate-500'}
                     `}>Access</h4>
                     <div className={`flex flex-col gap-4 text-sm font-semibold
                        ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}
                     `}>
                        <Link to="/auth" className="hover:text-primary transition-colors font-bold">Initialize Identity</Link>
                        <a href="#" className="hover:text-primary transition-colors">Terminal Portal</a>
                        <a href="#" className="hover:text-primary transition-colors">Architecture Review</a>
                     </div>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Solutions;
