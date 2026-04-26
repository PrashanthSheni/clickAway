import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
   Calendar, Users, Shield, Zap, ArrowRight, Play,
   ChevronRight, Globe, Layers, BarChart3, Clock, Lock,
   Sun, Moon, Monitor, Camera, Github, Linkedin
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
   const { theme, toggleTheme } = useTheme();
   const [scrolled, setScrolled] = useState(false);
   const [activeSection, setActiveSection] = useState(0);
   const [footerVisible, setFooterVisible] = useState(false);
   const videoRef = useRef(null);
   const containerRef = useRef(null);
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
                  {["Ecosystem", "Solutions", "Pricing"].map(link => (
                     link === "Solutions" || link === "Pricing" ? (
                        <Link
                           key={link}
                           to={`/${link.toLowerCase()}`}
                           className={`text-sm font-semibold transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/60 hover:text-white"}`}
                        >
                           {link}
                        </Link>
                     ) : (
                        <a
                           key={link}
                           href="#"
                           className={`text-sm font-semibold transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/60 hover:text-white"}`}
                        >
                           {link}
                        </a>
                     )
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
      {/* ── Seamless Theme Transition ── */}
      <div className="w-full h-48 bg-gradient-to-b from-[#050505] to-background" />

          {/* ── Section 2: Intelligence Built Right In ── */}
          <section className="py-32 px-8 max-w-7xl mx-auto">
             <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div className="space-y-8">
                   <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
                      Intelligence,<br />built right in.
                   </h2>
                   <p className="text-xl text-muted-foreground leading-relaxed max-w-lg font-medium">
                      We analyzed how enterprises actually use real estate. We built clickAway to automate the friction away.
                   </p>
                </div>
                <div className="relative aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-border/40 group">
                   <video 
                      autoPlay muted loop playsInline 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                      src="/videos/product.mp4" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent pointer-events-none" />
                </div>
             </div>
          </section>
           {/* ── Seamless Transition to Dark Section ── */}
           <div className="w-full h-48 bg-gradient-to-b from-background to-[#050505]" />

           {/* ── Section 3: Shared Asset Ecosystem ── */}
          <section className="py-24 bg-[#050505] text-white overflow-hidden">
             <div className="max-w-7xl mx-auto px-8 space-y-16">
                <div className="max-w-3xl space-y-6">
                   <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                      Share more than<br />just desks.
                   </h2>
                   <p className="text-lg text-white/40 leading-relaxed max-w-2xl font-medium">
                      Unlock the full potential of your real estate with clickAway's asset-sharing intelligence.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                      { title: "Dynamic Suites", icon: <Monitor className="w-8 h-8" />, desc: "High-performance workstations for intensive creative workflows." },
                      { title: "Ergo Hubs", icon: <div className="text-2xl font-black">CH</div>, desc: "Premium ergonomic spaces designed for long-term physiological focus." },
                      { title: "Media Studios", icon: <Camera className="w-8 h-8" />, desc: "Broadcast-ready environments for content capture and distribution." },
                      { title: "Creative Dens", icon: <Users className="w-8 h-8" />, desc: "Collaborative zones built for high-velocity team iteration." }
                   ].map((item, i) => (
                      <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/20 transition-all duration-500 group">
                         <div className="space-y-6">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500">
                               {item.icon}
                            </div>
                            <div className="space-y-3">
                               <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-primary transition-colors">{item.title}</h3>
                               <p className="text-sm text-white/30 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </section>




         {/* ── CTA Section ── */}
         <section className="py-40 px-8 text-center relative overflow-hidden text-white">
            <div className="absolute inset-0 z-0">
               <img
                  src="/videos/allmix.jpeg"
                  className="w-full h-full object-cover opacity-100"
                  alt="Architecture Background"
               />
               {/* Top edge fade (blends into the dark Section 3 above) */}
               <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#050505] to-transparent" />
               
               {/* Bottom edge fade (blends into the theme-aware Footer below) */}
               <div className={`absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t ${theme === 'dark' ? 'from-[#050505]' : 'from-slate-50'} to-transparent`} />
               
               {/* Very light overall vignette for framing */}
               <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-12">
               <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none drop-shadow-2xl">
                  Ready to<br />click<span className="text-primary">A</span>way?
               </h2>
               <p className="text-xl text-white/80 font-medium drop-shadow-md">
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <Link to="/auth" className="sf-btn-primary px-12 py-5 text-lg w-full sm:w-auto shadow-2xl">
                     INITIALIZE ACCESS
                  </Link>
                  <Link to="/auth" className="px-12 py-5 text-lg w-full sm:w-auto font-bold rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-300">
                     Schedule Architecture Review
                  </Link>
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
                        © {new Date().getFullYear()} clickAway Intelligence • ARCHITECTURE RESERVED
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
                        <Link to="/solutions" className="hover:text-primary transition-colors">Strategic Solutions</Link>
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
                     `}>Governance</h4>
                     <div className={`flex flex-col gap-4 text-sm font-semibold
                        ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}
                     `}>
                        <a href="#" className="hover:text-primary transition-colors">Security Identity</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy Ethics</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact Terminal</a>
                     </div>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
}
