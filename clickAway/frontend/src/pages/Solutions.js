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
      <div className="min-h-screen bg-background text-foreground">
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
<section className="relative min-h-screen flex items-center justify-start px-8 md:px-12 overflow-hidden text-white">
  <div className="absolute inset-0 z-0">
    <img
      src="/videos/camera.jpeg"
      className="w-full h-full object-cover opacity-80"
      alt=""
    />
    <div className="absolute inset-0 bg-black/40" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/55" />
  </div>

  <div className="relative z-10 w-full max-w-7xl mx-auto">
    <div className="max-w-5xl pt-20 md:pt-28 animate-fade-in-up">
      
      <span className="block text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-primary mb-6 md:mb-8">
        Enterprise Intelligence
      </span>

      <h1 className="leading-[0.9] tracking-[-0.035em] font-black">
        <span className="block text-[4rem] sm:text-[5rem] md:text-[6.8rem] lg:text-[8rem] text-white">
          Exhaustive
        </span>
        <span className="block text-[4rem] sm:text-[5rem] md:text-[6.8rem] lg:text-[8rem] text-white">
          Power.
        </span>
        <span className="block text-[4rem] sm:text-[5rem] md:text-[6.8rem] lg:text-[8rem] text-white/40">
          Total Control.
        </span>
      </h1>

      <p className="mt-8 md:mt-10 max-w-3xl text-base md:text-xl leading-snug font-medium text-white/65">
        Unified identity for the modern enterprise. Scale your workspace
        efficiency through our secure AI-driven ecosystem.
      </p>
    </div>
  </div>
</section>
{/* ── AI Suggestion Engine Section ── */}
<section className="relative py-24 md:py-32 px-8 md:px-12 bg-[#050505] text-white overflow-hidden">
  {/* ambient glow */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute right-[18%] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-cyan-500/8 blur-[130px]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,140,255,0.06),transparent_38%)]" />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-16 items-start">
    
    {/* Left Content */}
    <div className="max-w-xl">
      <h2 className="text-[2.6rem] sm:text-[3.4rem] md:text-[4.2rem] font-black tracking-[-0.04em] leading-[0.92] text-white">
        Suggestion
        <br />
        Engine
      </h2>

      <p className="mt-6 text-sm md:text-lg leading-[1.55] text-white/55 max-w-lg font-medium">
        We don't just reject bookings. Our backend uses high-fidelity algorithms to
        scan your entire facility and offer proactive alternatives in real-time.
      </p>

      <div className="mt-12 space-y-8">
        {[
          {
            title: "Dynamic Scoring",
            desc: "Every suggestion is ranked by proximity and similarity to your initial request."
          },
          {
            title: "Smart Substitution",
            desc: "Automatically upgrade to larger spaces if smaller units are occupied."
          },
          {
            title: "Conflict Mitigation",
            desc: "Instantly finds the next available window, minimizing calendar friction."
          }
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/5">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.85)]" />
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-white">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm md:text-base leading-relaxed text-white/35 font-medium max-w-lg">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Right Panel */}
    <div className="relative">
      <div className="relative rounded-[2.25rem] border border-white/5 bg-[#070707] p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.6)]">
        
        {/* soft panel glow */}
        <div className="absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(circle_at_50%_50%,rgba(0,170,255,0.06),transparent_55%)] pointer-events-none" />

        <div className="relative space-y-5">
          {[
            {
              label: "Attempt",
              title: "Boardroom 402",
              status: "Occupied",
              color: "text-red-400"
            },
            {
              label: "Suggestion",
              title: "Executive Suite 408",
              status: "98% Match",
              color: "text-cyan-400"
            },
            {
              label: "Suggestion",
              title: "Boardroom 402 @ 2:30 PM",
              status: "Available",
              color: "text-cyan-400"
            }
          ].map((card, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-[1.6rem] border border-white/[0.04] bg-white/[0.02] px-5 py-5 md:px-6 md:py-6 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] hover:shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_30px_rgba(34,211,238,0.08)]"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.22em] font-black text-white/20 transition-colors duration-300 group-hover:text-white/35">
                    {card.label}
                  </div>
                  <div className="mt-1.5 text-lg md:text-xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-cyan-300">
                    {card.title}
                  </div>
                </div>

                <div className={`text-[10px] font-black uppercase tracking-[0.14em] mt-1.5 transition-colors duration-300 ${card.color} group-hover:text-cyan-300`}>
                  {card.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
                  <div key={i} className="sf-card group relative p-10 overflow-hidden bg-sf-bg-soft/40">
                     <div className="absolute top-0 right-0 p-8">
                        <span className="sf-badge !bg-primary/10 !text-primary !border-primary/20">
                           {solver.tag}
                        </span>
                     </div>
                     
                     <div className="space-y-8">
                         <div className="space-y-3">
                            <div className="sf-label !mb-0">The Challenge</div>
                            <h3 className="text-3xl font-black tracking-tight text-foreground/80 group-hover:text-foreground transition-colors leading-none">
                               {solver.problem}
                            </h3>
                         </div>

                         <div className="h-[1px] w-full bg-border/40" />

                         <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#3b82f6]" />
                               <div className="text-[11px] font-black uppercase tracking-widest text-primary">Intelligence Vector: {solver.solution}</div>
                            </div>
                            <p className="text-sm leading-relaxed font-medium text-muted-foreground group-hover:text-foreground/70 transition-colors">
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
