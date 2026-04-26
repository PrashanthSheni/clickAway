import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Check, ArrowRight, Sparkles, Github, Linkedin } from "lucide-react";

const Pricing = () => {
   const { theme, toggleTheme } = useTheme();
   const [scrolled, setScrolled] = useState(false);
   const [hoveredPlan, setHoveredPlan] = useState(null);

   useEffect(() => {
      const handleScroll = () => {
         setScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   const plans = [
      {
         name: "Demo",
         price: "0",
         duration: "FOR 7 DAYS",
         desc: "Experience the full power of clickAway with a zero-risk 1-week trial.",
         features: [
            "Full AI Suggestion Access",
            "Reliability Tracking Enabled",
            "Up to 50 Resources",
            "24/7 Support"
         ],
         btnText: "START FREE TRIAL",
         active: false
      },
      {
         name: "Starter",
         price: "4",
         duration: "PER USER / MONTH",
         desc: "Essential desk booking for small, growing teams.",
         features: [
            "Basic Hot Desking",
            "Interactive Floor Maps",
            "Team Coordination",
            "Slack Integration"
         ],
         btnText: "GET STARTED",
         active: false
      },
      {
         name: "Professional",
         price: "12",
         duration: "PER USER / MONTH",
         desc: "Advanced tracking for mid-sized enterprises.",
         features: [
            "Everything in Starter",
            "Reliability Scores",
            "Resource Policies",
            "Advanced Approvals"
         ],
         btnText: "GO PRO",
         active: false
      },
      {
         name: "Enterprise",
         price: "25",
         duration: "PER USER / MONTH",
         desc: "The complete intelligent workplace engine.",
         features: [
            "Everything in Pro",
            "AI Suggestion Engine",
            "Maintenance Overrides",
            "Global Portfolio Sync"
         ],
         btnText: "CONTACT SALES →",
         active: true
      }
   ];

   return (
      <div className={`min-h-screen font-sans overflow-x-hidden ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#050505] text-white'}`}>
         {/* Force dark theme for this page as per the design */}

         {/* ── Nav ── */}
         <nav className={`
            fixed top-0 left-0 w-full z-[100] transition-all duration-500
            ${scrolled
               ? "h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 text-white"
               : "h-24 px-16 bg-transparent text-white"}
            flex items-center justify-between
         `}>
            <div className="flex items-center gap-3">
               <img src="/videos/logofinall.png" alt="clickAway" className="h-10 w-10 object-contain" />
               <span className="font-bold text-lg tracking-tight">click<span className="text-primary">A</span>way</span>
            </div>

            <div className="flex items-center gap-8">
               <div className="hidden lg:flex items-center gap-8">
                  <Link to="/" className={`text-sm font-semibold transition-colors ${scrolled ? "text-white/60 hover:text-white" : "text-white/60 hover:text-white"}`}>Home</Link>
                  <Link to="/solutions" className={`text-sm font-semibold transition-colors ${scrolled ? "text-white/60 hover:text-white" : "text-white/60 hover:text-white"}`}>Solutions</Link>
                  <Link to="/pricing" className={`text-sm font-semibold transition-colors underline underline-offset-4 ${scrolled ? "text-white" : "text-white"}`}>Pricing</Link>
               </div>
               <div className="h-6 w-[1px] bg-white/10" />
               <button onClick={toggleTheme} className="p-2 rounded-xl text-white/60 hover:text-white">
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
               </button>
               <Link to="/auth" className="bg-[#0ea5e9] text-white rounded-full font-bold px-5 py-2 text-xs hover:bg-[#0284c7] transition-colors">Sign In</Link>
            </div>
         </nav>

         {/* ── Pricing Grid Section ── */}
         <section className="pt-40 pb-12 px-8 max-w-7xl mx-auto flex flex-col items-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-center leading-[1.1] mb-6">
               <span className="text-[#0ea5e9]">Ready to</span><br />
               clickAway?
            </h1>
            <p className="text-white/50 font-medium text-center max-w-2xl text-lg mb-16">
               Transparent, enterprise-grade pricing for teams that prioritize space efficiency and employee experience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
               {plans.map((plan, index) => {
                  const isActive = hoveredPlan === plan.name;
                  
                  return (
                  <div 
                     key={plan.name}
                     onMouseEnter={() => setHoveredPlan(plan.name)}
                     onMouseLeave={() => setHoveredPlan(null)}
                     className={`
                        relative flex flex-col p-8 rounded-[2rem] transition-all duration-500 cursor-pointer
                        ${isActive 
                           ? 'bg-[#0f1520] border-2 border-primary shadow-[0_0_40px_rgba(14,165,233,0.15)] scale-105 z-10' 
                           : 'bg-[#0f1115] border border-white/5 hover:border-white/10'}
                     `}
                  >
                     {/* Background active glow */}
                     {isActive && <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-[2rem] pointer-events-none" />}
                     
                     <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                           <h3 className={`text-xl font-bold tracking-tight ${isActive ? 'text-white' : 'text-white/80'}`}>{plan.name}</h3>
                           {isActive && (
                              <span className="bg-[#0ea5e9] text-black text-[9px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
                                 ACTIVE PLAN
                              </span>
                           )}
                        </div>

                        <div className="flex items-baseline gap-2 mb-8">
                           <span className="text-5xl font-black tracking-tighter text-white">${plan.price}</span>
                           <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">{plan.duration}</span>
                        </div>

                        <p className="text-sm text-white/50 leading-relaxed mb-8 min-h-[60px]">
                           {plan.desc}
                        </p>

                        <div className="space-y-4 mb-12 flex-1">
                           {plan.features.map(feature => (
                              <div key={feature} className="flex items-center gap-3">
                                 <div className={`flex items-center justify-center rounded-full p-1 transition-colors duration-500
                                    ${isActive ? 'bg-[#0ea5e9] text-black' : 'bg-white/5 text-white/30'}
                                 `}>
                                    <Check size={12} strokeWidth={4} />
                                 </div>
                                 <span className={`text-xs font-medium transition-colors duration-500 ${isActive ? 'text-white/90' : 'text-white/50'}`}>
                                    {feature}
                                 </span>
                              </div>
                           ))}
                        </div>

                        <Link to="/auth" className={`
                           block text-center w-full py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-500
                           ${isActive 
                              ? 'bg-white/10 text-[#0ea5e9] hover:bg-white/20' 
                              : 'bg-transparent border border-white/10 text-white/40 hover:text-white hover:bg-white/5'}
                        `}>
                           {plan.btnText}
                        </Link>
                     </div>
                  </div>
                  );
               })}
            </div>
         </section>

         {/* ── Demo CTA Section ── */}
         <section className="pt-12 pb-20 px-8 flex flex-col items-center justify-center">
            {/* Demo CTA Card */}
            <div className="w-full max-w-4xl bg-[#0f1115] border border-white/5 rounded-[2rem] p-12 md:p-16 relative overflow-hidden group">
               {/* Subtle background glow */}
               <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
               
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                  <div className="md:col-span-2 space-y-6">
                     <h3 className="text-3xl font-bold tracking-tight text-white">Initialize your 7-day Demo.</h3>
                     <p className="text-white/50 text-base leading-relaxed max-w-lg">
                        Unlock the full intelligence suite with a zero-risk trial. Deployment for your entire enterprise takes less than 15 minutes.
                     </p>
                     <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Link to="/auth" className="flex items-center gap-2 bg-[#0ea5e9] text-black font-bold px-8 py-4 rounded-xl text-xs tracking-widest shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all">
                           START DEMO ACCESS <ArrowRight size={16} />
                        </Link>
                        <button className="flex items-center gap-2 bg-transparent border border-white/10 text-white/50 font-bold px-8 py-4 rounded-xl text-xs tracking-widest hover:bg-white/5 hover:text-white transition-all">
                           SPEAK TO AN EXPERT
                        </button>
                     </div>
                  </div>
                  <div className="hidden md:flex justify-end pr-8">
                     <Sparkles className="w-32 h-32 text-primary/20 group-hover:text-primary/40 transition-colors duration-700" strokeWidth={1} />
                  </div>
               </div>
            </div>
         </section>

         {/* ── Professional Footer ── */}
         <footer className="py-24 px-8 border-t border-white/5 mt-20">
            <div className="max-w-7xl mx-auto space-y-20">
               {/* Top Branding Cluster */}
               <div className="flex flex-col items-center text-center space-y-6">
                  <div className="flex items-center gap-3">
                     <img src="/videos/logofinall.png" alt="clickAway" className="h-10 w-10 object-contain" />
                     <span className="font-bold text-3xl tracking-tighter">click<span className="text-primary">A</span>way</span>
                  </div>
                  <div className="space-y-4">
                     <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/50">
                        © {new Date().getFullYear()} clickAway Intelligence • ARCHITECTURE RESERVED
                     </p>
                     <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-20" />
                     <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">
                        Prashanth • Pankaj • Ananya • Praneetha
                     </p>
                  </div>
               </div>

               {/* Navigation Ecosystem */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-16 border-t border-white/10">
                  <div className="space-y-8 text-left">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Platform</h4>
                     <div className="flex flex-col gap-4 text-sm font-semibold text-white/70">
                        <Link to="/" className="hover:text-primary transition-colors">Enterprise Home</Link>
                        <a href="#" className="hover:text-primary transition-colors">Asset Marketplace</a>
                        <a href="#" className="hover:text-primary transition-colors">Intelligence Layer</a>
                     </div>
                  </div>

                  <div className="space-y-8 text-center">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Social Connect</h4>
                     <div className="flex items-center justify-center gap-8">
                        <a href="#" className="transition-all duration-500 transform hover:scale-110 hover:text-primary text-white/50">
                           <Github className="w-6 h-6" />
                        </a>
                        <a href="#" className="transition-all duration-500 transform hover:scale-110 hover:text-primary text-white/50">
                           <Linkedin className="w-6 h-6" />
                        </a>
                     </div>
                  </div>

                  <div className="space-y-8 text-right">
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Access</h4>
                     <div className="flex flex-col gap-4 text-sm font-semibold text-white/70">
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

export default Pricing;
