import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Command, Check, Zap, Sparkles, Shield, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

export default function Pricing() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTier, setActiveTier] = useState(2); // Default to Professional

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    document.title = "Pricing | clickAway Intelligence";
    window.scrollTo(0, 0);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tiers = [
    {
      name: "Demo",
      price: "$0",
      period: "for 7 days",
      desc: "Experience the full power of clickAway with a zero-risk 1-week trial.",
      features: ["Full AI Suggestion Access", "Reliability Tracking Enabled", "Up to 50 Resources", "24h Support"],
      cta: "Start Free Trial",
    },
    {
      name: "Starter",
      price: "$4",
      period: "per user / month",
      desc: "Essential desk booking for small, growing teams.",
      features: ["Basic Hot Desking", "Interactive Floor Maps", "Team Coordination", "Slack Integration"],
      cta: "Get Started",
    },
    {
      name: "Professional",
      price: "$12",
      period: "per user / month",
      desc: "Advanced tracking for mid-sized enterprises.",
      features: ["Everything in Starter", "Reliability Scores", "Resource Policies", "Advanced Approvals"],
      cta: "Go Pro",
    },
    {
      name: "Enterprise",
      price: "$25",
      period: "per user / month",
      desc: "The complete intelligent workplace engine.",
      features: ["Everything in Pro", "AI Suggestion Engine", "Maintenance Overrides", "Global Portfolio Sync"],
      cta: "Contact Sales",
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-inter selection:bg-[#00bbff]/20 selection:text-[#00bbff] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-plus { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
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
          <span className="font-bold tracking-[0.15em] text-white uppercase text-sm">
            click<span className="text-[#00bbff]">Away</span>
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link to="/solutions" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Solutions</Link>
            <Link to="/pricing" className="text-sm font-bold text-white border-b-2 border-[#00bbff] pb-1">Pricing</Link>
          </div>
          <Link to="/auth" className="text-sm font-bold text-white hover:text-[#00bbff] transition-colors mr-4">Sign In</Link>
          <Link to="/auth" className="bg-[#00bbff] text-black px-6 py-3 rounded-md text-sm font-bold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(0,187,255,0.3)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 px-8 max-w-[1400px] mx-auto text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00bbff]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#00bbff] text-[10px] font-bold tracking-[0.4em] uppercase mb-6"
          >Investment Matrix</motion.p>
          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-6xl md:text-8xl lg:text-9xl font-plus font-bold text-white leading-[1.0] tracking-tighter mb-8"
          >
            Scale with<br />
            <span className="text-zinc-500">intelligence.</span>
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Transparent, enterprise-grade pricing for teams that prioritize space efficiency and employee experience.
          </motion.p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-20 px-8 relative z-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {tiers.map((tier, i) => (
            <motion.div 
              key={i} 
              onClick={() => setActiveTier(i)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: activeTier === i ? 1.05 : 1,
              }}
              transition={{ 
                delay: i * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className={cn(
                "relative group flex flex-col rounded-[3rem] border transition-all duration-500 p-1 cursor-pointer overflow-hidden",
                activeTier === i 
                  ? "border-[#00bbff] bg-gradient-to-b from-[#00bbff]/20 to-[#0a0a0a] shadow-[0_30px_60px_rgba(0,187,255,0.2)] z-20" 
                  : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 grayscale-[40%] opacity-60 hover:opacity-100 hover:grayscale-0"
              )}
            >
              {/* Background Glow for Active Tier */}
              {activeTier === i && (
                <motion.div 
                  layoutId="glow"
                  className="absolute inset-0 bg-[#00bbff]/10 blur-3xl"
                />
              )}

              <AnimatePresence>
                {activeTier === i && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#00bbff] text-black text-[9px] font-bold uppercase tracking-widest px-5 py-2 rounded-full shadow-lg z-30"
                  >
                    Active Plan
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-10 flex-1 flex flex-col relative z-10">
                <div className="mb-8">
                  <h3 className={cn(
                    "text-2xl font-plus font-bold mb-2 transition-colors",
                    activeTier === i ? "text-white" : "text-zinc-400"
                  )}>{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-5xl font-bold transition-colors",
                      activeTier === i ? "text-white" : "text-zinc-600"
                    )}>{tier.price}</span>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{tier.period}</span>
                  </div>
                </div>
                
                <p className={cn(
                  "text-sm mb-10 font-medium leading-relaxed transition-colors",
                  activeTier === i ? "text-zinc-300" : "text-zinc-500"
                )}>{tier.desc}</p>

                <div className="space-y-4 mb-12">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={cn(
                        "h-5 w-5 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                        activeTier === i ? "bg-[#00bbff] text-black border-[#00bbff]" : "bg-white/5 text-zinc-700 border-white/5"
                      )}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        activeTier === i ? "text-zinc-200" : "text-zinc-600"
                      )}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={cn(
                  "mt-auto w-full py-6 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-500 flex items-center justify-center gap-3",
                  activeTier === i 
                    ? "bg-[#00bbff] text-black shadow-[0_0_30px_rgba(0,187,255,0.4)]" 
                    : "bg-white/5 text-zinc-500 border border-white/5 hover:border-white/10"
                )}>
                  {tier.cta}
                  {activeTier === i && <ArrowRight size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-40 px-8 border-t border-white/5 bg-[#080808] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-8xl font-plus font-bold text-[#00bbff] mb-12 tracking-tighter leading-[0.9]">
              Ready to<br />
              <span className="text-white">clickAway?</span>
            </h2>
            
            <div className="bg-[#0a0a0a] border-2 border-white/5 backdrop-blur-xl rounded-[4rem] p-16 text-left relative overflow-hidden group hover:border-[#00bbff]/20 transition-all duration-500">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-20 transition-all duration-1000 group-hover:rotate-12">
                <Sparkles className="text-[#00bbff]" size={100} />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-plus font-bold text-white mb-6">Initialize your 7-day Demo.</h3>
                <p className="text-zinc-400 mb-12 text-lg font-medium leading-relaxed max-w-xl">
                  Unlock the full intelligence suite with a zero-risk trial. Deployment for your entire enterprise takes less than 15 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/auth" className="bg-[#00bbff] text-black px-12 py-6 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-white transition-all flex items-center justify-center gap-3 group shadow-[0_20px_40px_rgba(0,187,255,0.2)]">
                    Start Demo Access <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <button className="text-zinc-500 font-bold hover:text-white transition-colors px-10 py-6 uppercase tracking-widest text-xs border border-white/5 rounded-2xl hover:bg-white/5">
                    Speak to an Expert
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-16 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4 group cursor-pointer">
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
