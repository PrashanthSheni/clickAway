import React, { useRef, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { Calendar, Users, Shield, Zap, ArrowRight, Play } from "lucide-react";

export default function Home() {

  const demoVideoRef = useRef(null);

  const productVideoRef = useRef(null);

  const productSectionRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  const [productPlaying, setProductPlaying] = useState(false);

  const [ctaVisible, setCtaVisible] = useState(false);

  const ctaRef = useRef(null);

  useEffect(() => {

    const handleScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  useEffect(() => {

    const observer = new IntersectionObserver(

      ([entry]) => { if (entry.isIntersecting) setCtaVisible(true); },

      { threshold: 0.25 }

    );

    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();

  }, []);

  // Auto-play product video — triggered when video element mounts

  const setProductVideoRef = (el) => {

    productVideoRef.current = el;

    if (el) {

      el.play().catch(() => { });

      setProductPlaying(true);

    }

  };

  const handleLaunchPlatform = () => {

    productSectionRef.current?.scrollIntoView({ behavior: "smooth" });

    const v = productVideoRef.current;

    if (v) {

      v.currentTime = 0;

      v.play().catch(() => { });

      setProductPlaying(true);

    }

  };

  const toggleProduct = () => {

    const v = productVideoRef.current;

    if (!v) return;

    if (productPlaying) { v.pause(); setProductPlaying(false); }

    else { v.play().catch(() => { }); setProductPlaying(true); }

  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", fontFamily: "'DM Sans', sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=Cormorant+Garamond:wght@300;400;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nav-link { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 13px; letter-spacing: 0.08em; font-weight: 400; transition: color 0.3s; text-transform: uppercase; }

        .nav-link:hover { color: #fff; }

        .btn-white { background: #fff; border: 1px solid #fff; color: #09090B; padding: 13px 32px; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; cursor: pointer; transition: background 0.25s, color 0.25s; display: inline-block; font-weight: 500; }

        .btn-white:hover { background: transparent; color: #fff; }

        .btn-outline { background: #fff; border: 1px solid #fff; color: #09090B; padding: 13px 32px; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; cursor: pointer; transition: background 0.25s, color 0.25s; display: inline-block; font-weight: 500; }

        .btn-outline:hover { background: transparent; color: #fff; }

        .eyebrow { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.38); font-weight: 400; }

        .stat-number { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 64px; line-height: 1; letter-spacing: -0.02em; color: #fff; }

        .feature-card { border-top: 1px solid rgba(255,255,255,0.08); padding: 36px 0; transition: border-color 0.3s; }

        .feature-card:hover { border-top-color: rgba(255,255,255,0.22); }

        .feature-icon { width: 40px; height: 40px; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }

        .scroll-indicator { position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0.3; pointer-events: none; }

        .scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.9)); animation: scrollPulse 2s ease-in-out infinite; }

        @keyframes scrollPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

        .video-hover-wrapper { position: relative; overflow: hidden; }

        .play-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: rgba(9,9,11,0.52); cursor: pointer; transition: background 0.3s; z-index: 5; }

        .play-overlay:hover { background: rgba(9,9,11,0.38); }

        .play-circle { width: 72px; height: 72px; border: 1px solid rgba(255,255,255,0.35); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; backdrop-filter: blur(6px); background: rgba(255,255,255,0.05); }

        .play-overlay:hover .play-circle { border-color: #fff; background: rgba(255,255,255,0.1); transform: scale(1.08); }

        .cta-section { position: relative; padding: 120px 48px; display: flex; flex-direction: column; align-items: center; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); }

        .cta-section::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 1px; height: 80px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.28)); }

        @media (max-width: 768px) { .stat-number { font-size: 44px; } .hero-title { font-size: 44px !important; } }

        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        .cta-item { opacity: 0; }
        .cta-item.in { animation: fadeSlideUp 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

      `}</style>

      {/* ── Navigation ── */}
      <nav style={{

        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,

        display: "flex", justifyContent: "space-between", alignItems: "center",

        background: scrolled ? "rgba(9,9,11,0.92)" : "transparent",

        backdropFilter: scrolled ? "blur(12px)" : "none",

        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",

        transition: "all 0.4s ease",

      }}>
        <div style={{ width: "50%", padding: "28px 48px", display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/videos/logo3.png" alt="Spaceflow Logo" style={{ height: "32px", width: "auto", display: "block" }} />
        </div>
        <div style={{ width: "50%", padding: "28px 48px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "40px" }}>

          {["Platform", "Solutions", "Pricing"].map(label => (
            <a key={label} href="#" style={{

              color: scrolled ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.62)",

              textDecoration: "none", fontSize: 13, letterSpacing: "0.08em",

              fontWeight: 400, transition: "color 0.3s", textTransform: "uppercase",

            }}

              onMouseEnter={e => e.currentTarget.style.color = scrolled ? "#fff" : "#000"}

              onMouseLeave={e => e.currentTarget.style.color = scrolled ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.62)"}
            >{label}</a>

          ))}
          <Link to="/auth" style={{

            background: "#fff",

            border: "1px solid #fff",

            color: "#09090B",

            padding: "9px 22px", fontSize: 11, letterSpacing: "0.16em",

            textTransform: "uppercase", textDecoration: "none", transition: "background 0.25s, color 0.25s", display: "inline-block",

            fontWeight: 500,

          }}

            onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}

            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#09090B"; }}
          >Launch</Link>
        </div>
      </nav>

      {/* ── Hero — split panel ── */}
      <section style={{ position: "relative", height: "100vh", display: "flex", overflow: "hidden" }}>

        {/* LEFT: dark copy */}
        <div style={{

          width: "50%", background: "#09090B", flexShrink: 0,

          display: "flex", flexDirection: "column", justifyContent: "center",

          padding: "0 56px 0 48px", position: "relative", zIndex: 2,

        }}>
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.07)" }} />
          <p className="eyebrow" style={{ marginBottom: "20px" }}>Workspace Intelligence Platform</p>
          <h1 className="hero-title" style={{

            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,

            fontSize: "68px", lineHeight: 1.0, letterSpacing: "-0.02em", color: "#fff", marginBottom: "28px",

          }}>

            Enterprise<br />
            <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.42)" }}>Space</em>flow
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", lineHeight: 1.8, maxWidth: "340px", marginBottom: "28px", fontWeight: 300 }}>

            High-performance platform for managing your team's workspace intelligence — built for modern organizations.
          </p>

          {/* Primary CTAs */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={handleLaunchPlatform} className="btn-white">Launch Platform</button>
            <Link to="/auth" className="btn-outline">Get Started</Link>
          </div>

          {/* Elegant divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "24px 0 0", maxWidth: "280px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 400, whiteSpace: "nowrap" }}>or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Secondary CTAs */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "20px" }}>
            <Link to="/auth" style={{

              background: "transparent",

              border: "1px solid rgba(255,255,255,0.16)",

              color: "rgba(255,255,255,0.65)",

              padding: "11px 26px",

              fontFamily: "'DM Sans', sans-serif",

              fontSize: "11px",

              letterSpacing: "0.16em",

              textTransform: "uppercase",

              textDecoration: "none",

              display: "inline-block",

              fontWeight: 400,

              transition: "border-color 0.3s, color 0.3s, background 0.3s",

            }}

              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}

              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "transparent"; }}
            >Create Account</Link>

            <Link to="/auth" style={{

              background: "transparent",

              border: "none",

              color: "rgba(255,255,255,0.28)",

              padding: "11px 0",

              fontFamily: "'DM Sans', sans-serif",

              fontSize: "11px",

              letterSpacing: "0.16em",

              textTransform: "uppercase",

              textDecoration: "none",

              display: "inline-flex",

              alignItems: "center",

              gap: "7px",

              fontWeight: 400,

              transition: "color 0.3s",

            }}

              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}

              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}
            >

              Sign In <span style={{ fontSize: 13 }}>→</span>
            </Link>
          </div>

          <div style={{ position: "absolute", bottom: "40px", left: "48px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.15em", textTransform: "uppercase" }}>2,400+ organizations live</span>
          </div>
        </div>

        {/* RIGHT: full-bleed image */}
        <div style={{ width: "50%", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <img src="/videos/background.png" alt="Modern office workspace"

            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #09090B, transparent)", pointerEvents: "none" }} />

          {/* Bottom transition to Section 2 */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(to top, #0C0C0E, transparent)", pointerEvents: "none" }} />
        </div>
        <div className="scroll-indicator">
          <div className="scroll-line" />
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>Scroll</span>
        </div>
      </section>

      {/* ── Section 2: Product video (target of "Launch Platform") ── */}
      <section ref={productSectionRef} style={{ background: "#0C0C0E", position: "relative" }}>

        {/* Top Blend Gradient */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, #09090B, transparent)", zIndex: 5, pointerEvents: "none" }} />
        <div style={{ display: "flex", height: "80vh" }}>

          {/* LEFT — video, full height */}
          <div style={{ width: "60%", flexShrink: 0, position: "relative", overflow: "hidden", height: "80vh" }}>
            <video

              ref={setProductVideoRef}

              playsInline muted loop autoPlay

              onClick={toggleProduct}

              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "pointer", filter: "grayscale(100%) contrast(1.05) brightness(0.88)" }}
            >
              <source src="/videos/product.mp4" type="video/mp4" />
            </video>

            {/* Subtle right edge fade into dark */}
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #0C0C0E, transparent)", pointerEvents: "none" }} />

            {/* Resume overlay when paused */}

            {!productPlaying && (
              <div className="play-overlay" onClick={toggleProduct}>
                <div className="play-circle">
                  <Play style={{ width: 22, height: 22, color: "#fff", marginLeft: 3 }} />
                </div>
                <span style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Resume</span>
              </div>

            )}
          </div>

          {/* RIGHT — heading + 4 features stacked */}
          <div style={{ width: "35%", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 40px", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="eyebrow" style={{ marginBottom: "10px" }}>Platform Overview</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "28px", letterSpacing: "-0.02em", lineHeight: 1.05, color: "#fff", marginBottom: "20px" }}>

              Everything your<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.42)" }}>team needs</em>
            </h2>

            {[

              {

                icon: <Calendar style={{ width: 14, height: 14, color: "rgba(255,255,255,0.55)" }} />,

                title: "Instant Desk Booking",

                desc: "Reserve desks, meeting rooms, and equipment in seconds.",

              },

              {

                icon: <Users style={{ width: 14, height: 14, color: "rgba(255,255,255,0.55)" }} />,

                title: "Live Team Map",

                desc: "See exactly where teammates are sitting today.",

              },

              {

                icon: <Shield style={{ width: 14, height: 14, color: "rgba(255,255,255,0.55)" }} />,

                title: "Manager Approvals",

                desc: "Set rules or review requests manually — full control.",

              },

              {

                icon: <Zap style={{ width: 14, height: 14, color: "rgba(255,255,255,0.55)" }} />,

                title: "Usage Analytics",

                desc: "Track peak hours and no-shows with real-time dashboards.",

              },

            ].map((f, i) => (
              <div key={i} style={{

                display: "flex", gap: "15px", alignItems: "flex-start",

                paddingTop: "10px", paddingBottom: "10px",

                borderTop: "1px solid rgba(255,255,255,0.07)",

              }}>
                <div style={{ width: 28, height: 28, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>

                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", marginBottom: "2px", letterSpacing: "0.01em" }}>{f.title}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.36)", lineHeight: 1.4, fontWeight: 300 }}>{f.desc}</p>
                </div>
              </div>

            ))}
            <div style={{ display: "flex", gap: "14px", marginTop: "20px" }}>
              <Link to="/auth" className="btn-white" style={{ padding: "10px 24px" }}>Get Started Free</Link>
              <Link to="/auth" className="btn-outline" style={{ padding: "10px 24px" }}>Sign In</Link>
            </div>
          </div>
        </div>
      </section>



      {/* ── Dashboard demo video — full bleed, B&W ── */}
      <section style={{ padding: "80px 0 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 48px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "48px" }}>
            <p className="eyebrow" style={{ marginBottom: "12px" }}>Core Engine</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "42px", letterSpacing: "-0.02em", lineHeight: 1.1, color: "#fff" }}>
              Intelligent<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.45)" }}>Automation</em>
            </h2>
          </div>
        </div>

        {/* Full-bleed video strip — FIXED: brighter filter + lighter gradient overlay */}
        <div

          className="video-hover-wrapper"

          style={{

            height: "62vh",

            overflow: "hidden",

            position: "relative",

          }}

          onMouseEnter={() => demoVideoRef.current?.play()}

          onMouseLeave={() => demoVideoRef.current?.pause()}
        >
          <video

            ref={demoVideoRef}

            loop muted playsInline autoPlay

            style={{

              width: "100%",

              height: "140%",

              objectFit: "cover",

              objectPosition: "center 30%",

              display: "block",

              marginTop: "-10%",

              /* FIXED: was brightness(0.75) — now 1.05 so the dashboard content is clearly visible */
              filter: "grayscale(100%) contrast(1.08) brightness(1.05)",

            }}
          >
            <source src="/videos/landingdb.mp4" type="video/mp4" />
          </video>

          {/* Top + bottom cinematic fade — mirrors each other */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #09090B 0%, rgba(9,9,11,0.55) 12%, rgba(9,9,11,0.0) 30%, rgba(9,9,11,0.0) 68%, rgba(9,9,11,0.55) 86%, #09090B 100%)", pointerEvents: "none" }} />

          {/* Side fades */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #09090B 0%, transparent 8%, transparent 92%, #09090B 100%)", pointerEvents: "none" }} />
        </div>

        {/* Bottom breathing room */}
        <div style={{ height: "60px" }} />
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "0 48px 120px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "80px", marginBottom: "64px" }}>
          <p className="eyebrow" style={{ marginBottom: "12px" }}>Capabilities</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "42px", letterSpacing: "-0.02em", color: "#fff" }}>Everything you need</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0 32px" }}>

          {[

            { icon: <Calendar style={{ width: 16, height: 16, color: "rgba(255,255,255,0.55)" }} />, title: "Smart Booking", desc: "Instantly find and reserve resources tailored to your team's exact needs." },

            { icon: <Users style={{ width: 16, height: 16, color: "rgba(255,255,255,0.55)" }} />, title: "Team Visibility", desc: "See when and where colleagues work to foster better, deeper collaboration." },

            { icon: <Shield style={{ width: 16, height: 16, color: "rgba(255,255,255,0.55)" }} />, title: "Approval Flows", desc: "Managers maintain full control via automated and manual approval queues." },

            { icon: <Zap style={{ width: 16, height: 16, color: "rgba(255,255,255,0.55)" }} />, title: "Analytics", desc: "Gain insights into utilization, no-shows, and peak hours to optimize space." },

          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#fff", marginBottom: "12px" }}>{f.title}</h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
            </div>

          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div ref={ctaRef} className="cta-section" style={{ padding: "140px 48px 120px" }}>

        {/* Heading line 1 */}
        <h2 className={`cta-item${ctaVisible ? " in" : ""}`} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(48px, 6vw, 80px)", letterSpacing: "-0.025em", lineHeight: 1.0, color: "#fff", marginBottom: "0px", maxWidth: "700px", animationDelay: "0ms" }}>
          Ready to transform
        </h2>

        {/* Heading line 2 — italic, slightly delayed */}
        <h2 className={`cta-item${ctaVisible ? " in" : ""}`} style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(48px, 6vw, 80px)", letterSpacing: "-0.025em", lineHeight: 1.0, marginBottom: "20px", maxWidth: "700px", animationDelay: "200ms" }}>
          <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.32)" }}>your workspace?</em>
        </h2>

        {/* Divider */}
        <div className={`cta-item${ctaVisible ? " in" : ""}`} style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.15)", margin: "32px auto", animationDelay: "380ms" }} />

        {/* Button */}
        <div className={`cta-item${ctaVisible ? " in" : ""}`} style={{ animationDelay: "560ms", marginBottom: "32px" }}>
          <Link to="/auth" style={{ background: "#fff", border: "1px solid #fff", color: "#09090B", padding: "14px 40px", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", display: "inline-block", fontWeight: 500, transition: "background 0.25s, color 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#09090B"; }}
          >Get Started Free</Link>
        </div>

      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "36px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/videos/logo3.png" alt="Spaceflow Logo" style={{ height: "24px", width: "auto", display: "block" }} />
        </div>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>© {new Date().getFullYear()} clickAway. All rights reserved.</p>
        <div style={{ display: "flex", gap: "32px" }}>

          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" className="nav-link" style={{ fontSize: 12 }}>{l}</a>

          ))}
        </div>
      </footer>
    </div>

  );

}