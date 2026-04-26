import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
   Calendar, Users, Shield, Zap, ArrowRight, Play,
   ChevronRight, Globe, Layers, BarChart3, Clock, Lock,
   Sun, Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
   const { theme, toggleTheme } = useTheme();
   const [scrolled, setScrolled] = useState(false);
   const [activeSection, setActiveSection] = useState(0);
   const videoRef = useRef(null);
   const containerRef = useRef(null);

   useEffect(() => {
      const handleScroll = () => {
         setScrolled(window.scrollY > 50);

         // Basic section tracking for scroll-driven narratives
         const scrollPos = window.scrollY + window.innerHeight / 2;
         const sections = document.querySelectorAll(".scroll-section");
         sections.forEach((sec, idx) => {
            if (scrollPos > sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
               setActiveSection(idx);
            }
         });
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   const features = [
      {
         title: "Intelligent Resource Governance",
         desc: "Orchestrate your entire workspace with real-time availability and smart optimization logic.",
         icon: <Layers className="w-5 h-5" />,
         video: "/videos/product.mp4"
      },
      {
         title: "Global Visibility Engine",
         desc: "Foster deep collaboration with team-wide transparency and digital twin mapping.",
         icon: <Globe className="w-5 h-5" />,
         video: "/videos/product.mp4"
      },
      {
         title: "Predictive Analytics",
         desc: "Optimize your infrastructure with historical utilization data and trend forecasting.",
         icon: <BarChart3 className="w-5 h-5" />,
         video: "/videos/product.mp4"
      }
   ];

   return (
      <div className="bg-background text-foreground transition-colors duration-700 overflow-x-hidden">

         {/* ── Navigation ── */}
         <nav className={`
        fixed top-0 left-0 w-full z-[100] transition-all duration-500
        ${scrolled
               ? "h-16 bg-background/80 backdrop-blur-xl border-b border-border/40 px-12 shadow-sm text-foreground"
               : "h-24 px-16 bg-[#050505]/40 backdrop-blur-md border-b border-white/5 text-white"}
        flex items-center justify-between
      `}>
            <div className="flex items-center gap-3">
               <img src="/videos/logofinall.png" alt="clickAway" className="h-12 w-12 object-contain" />
               <span className="font-bold text-xl tracking-tight hidden md:block">click<span className="text-primary">A</span>way</span>
            </div>

            <div className="flex items-center gap-8">
               <div className="hidden lg:flex items-center gap-8">
                  {["Ecosystem", "Solutions", "Enterprise"].map(link => (
                     <a
                        key={link}
                        href="#"
                        className={`text-sm font-semibold transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/60 hover:text-white"}`}
                     >
                        {link}
                     </a>
                  ))}
               </div>
               <div className="h-6 w-[1px] bg-border/40" />

               <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl transition-all ${scrolled ? "text-muted-foreground hover:text-foreground hover:bg-accent" : "text-white/60 hover:text-white hover:bg-white/10"}`}
               >
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
               </button>

               <Link
                  to="/auth"
                  className={`text-sm font-bold transition-colors ${scrolled ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white"}`}
               >
                  Sign In
               </Link>
               <Link to="/auth" className="sf-btn-primary px-5 py-2 text-xs">Initialize Platform</Link>
            </div>
         </nav>

         <div className="bg-[#050505]">
            {/* ── Hero Section ── */}
            <section className="relative w-full h-[610px] flex flex-col items-center justify-start pt-24 px-8 overflow-hidden text-white">
               {/* Cinematic Background Image Layer - Always Dark */}
               <div className="absolute inset-0 z-0">
                  <img
                     src="/videos/background.png"
                     className="w-full h-full object-cover transition-opacity duration-1000 opacity-60 grayscale brightness-[0.7]"
                     alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]" />
               </div>

               <div className="relative z-10 max-w-4xl text-center space-y-4 animate-fade-in-up mt-6">
                  <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                     click<span className="text-primary [-webkit-text-fill-color:#3b82f6]">A</span>way
                  </h1>
                  <p className="text-base md:text-xl text-white/60 max-w-xl mx-auto font-medium">
                     High-performance orchestration for modern organizations.
                  </p>
               </div>
            </section>

            {/* Hero Device Reveal */}
            <div className="w-full px-0 animate-fade-in-up pb-20" style={{ animationDelay: "200ms" }}>
               <div className="group overflow-hidden relative">
                  {/* Edge Fading Overlays */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                     <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent" />
                     <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent" />
                     <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-[#050505] to-transparent" />
                     <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[#050505] to-transparent" />
                  </div>

                  <video
                     key="/videos/landingdb.mp4"
                     autoPlay muted loop playsInline
                     className="w-full aspect-video object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                     style={{ filter: theme === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'brightness(1.05)' }}
                     src="/videos/landingdb.mp4"
                  />
               </div>
            </div>
         </div>

         {/* ── Features Matrix — Scroll Driven ── */}
         <section className="py-16 px-8 max-w-5xl mx-auto space-y-20">
            <div className="grid lg:grid-cols-12 gap-20 items-center">
               <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-4">
                     <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Capabilities</span>
                     <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ecosystem<br />Infrastructure.</h2>
                     <p className="text-muted-foreground text-lg leading-relaxed">Everything your organization needs to manage high-velocity workspace dynamics.</p>
                  </div>

                  <div className="space-y-4">
                     {features.map((f, i) => (
                        <div
                           key={i}
                           className={`
                    p-4 rounded-2xl border transition-all duration-500 cursor-pointer
                    ${activeSection === i ? "bg-accent border-primary/20 shadow-lg translate-x-4" : "bg-transparent border-transparent opacity-40 hover:opacity-100"}
                  `}
                           onMouseEnter={() => setActiveSection(i)}
                        >
                           <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${activeSection === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                 {f.icon}
                              </div>
                              <div className="space-y-1">
                                 <h3 className="font-bold text-lg">{f.title}</h3>
                                 <p className="text-sm text-muted-foreground font-medium">{f.desc}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="lg:col-span-7 relative aspect-square lg:aspect-auto lg:h-[420px] sticky top-32">
                  <div className="absolute inset-0 bg-primary/5 rounded-[40px] -rotate-3 -z-10" />
                  <div className="sf-video-frame h-full shadow-2xl">
                     <video
                        key={features[activeSection].video}
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover transition-opacity duration-1000"
                     >
                        <source src={features[activeSection].video} type="video/mp4" />
                     </video>
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                  </div>
               </div>
            </div>
         </section>

         {/* ── Dark Product Band — Ambient Depth ── */}
         <section className="relative py-48 overflow-hidden bg-[#050505] text-white">
            <div className="absolute inset-0 z-0">
               <img
                  src="/videos/conferencehall.jpeg"
                  className="w-full h-full object-cover opacity-20 grayscale"
                  alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center px-8 space-y-12">
               <h2 className="text-5xl md:text-7xl font-bold tracking-tight"></h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12">
                  {[
                     // { val: "2.4k+", label: "Identities" },
                     // { val: "99.9%", label: "Uptime" },
                     // { val: "12ms", label: "Latency" },
                     // { val: "0", label: "Conflicts" },
                  ].map(stat => (
                     <div key={stat.label} className="space-y-2">
                        <div className="text-4xl font-serif italic text-white/40">{stat.val}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── CTA Section ── */}
         <section className="py-40 px-8 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-3xl mx-auto space-y-12">
               <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-none">Ready to unify your ecosystem?</h2>
               <p className="text-xl text-muted-foreground font-medium">Join 2,400+ organizations scaling with Spaceflow intelligence.</p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <Link to="/auth" className="sf-btn-primary px-12 py-5 text-lg w-full sm:w-auto shadow-2xl">
                     Launch Platform
                  </Link>
                  <Link to="/auth" className="sf-btn-secondary px-12 py-5 text-lg w-full sm:w-auto">
                     Schedule Architecture Review
                  </Link>
               </div>
            </div>
         </section>

         {/* ── Footer ── */}
         <footer className="py-20 px-16 border-t border-border/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-12 bg-sf-bg-soft/30">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <img src="/videos/logofinall.png" alt="clickAway" className="h-10 w-10 object-contain" />
                  <span className="font-bold text-lg tracking-tight">click<span className="text-primary">A</span>way</span>
               </div>
               <p className="text-xs text-muted-foreground font-medium tracking-tight">© {new Date().getFullYear()} clickAway Intelligence. All rights reserved.</p>
            </div>

            <div className="flex flex-wrap gap-12">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Platform</h4>
                  <div className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                     <a href="#" className="hover:text-primary transition-colors">Governance</a>
                     <a href="#" className="hover:text-primary transition-colors">Marketplace</a>
                     <a href="#" className="hover:text-primary transition-colors">Intelligence</a>
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Company</h4>
                  <div className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
                     <a href="#" className="hover:text-primary transition-colors">Legal Identity</a>
                     <a href="#" className="hover:text-primary transition-colors">Privacy Ethics</a>
                     <a href="#" className="hover:text-primary transition-colors">Contact Terminal</a>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
}