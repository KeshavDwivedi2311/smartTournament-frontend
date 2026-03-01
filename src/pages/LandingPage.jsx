import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Radio, Trophy, Zap, Users, Target, ArrowRight, ChevronDown, Github } from 'lucide-react';
import './LandingPage.css';

// ── SVG Silhouettes ─────────────────────────────────────────────

function PlayerLeftSVG() {
  return (
    <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Player doing a forehand swing — simplified silhouette */}
      <defs>
        <linearGradient id="playerLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Head */}
      <circle cx="105" cy="45" r="22" fill="url(#playerLeftGrad)" />
      {/* Body */}
      <path d="M105 67 L95 140 L80 130 L60 95 L50 100 L75 140 L85 160 L70 240 L60 310 L78 310 L100 210 L115 310 L133 310 L120 160 L130 140 L155 110 L170 80 L160 72 L135 105 L115 140 L105 67Z"
        fill="url(#playerLeftGrad)" />
      {/* Racket arm extending left */}
      <line x1="50" y1="100" x2="15" y2="60" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Racket head */}
      <ellipse cx="10" cy="50" rx="14" ry="18" stroke="#00d4ff" strokeWidth="2" fill="none" opacity="0.4" />
    </svg>
  );
}

function PlayerRightSVG() {
  return (
    <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Player doing an overhead smash — simplified silhouette */}
      <defs>
        <linearGradient id="playerRightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Head */}
      <circle cx="95" cy="40" r="22" fill="url(#playerRightGrad)" />
      {/* Body — smash pose, arm overhead */}
      <path d="M95 62 L100 140 L115 130 L140 80 L150 50 L155 30 L148 28 L138 55 L120 90 L105 130 L85 155 L70 240 L60 310 L78 310 L95 210 L110 310 L128 310 L115 155 L100 140 L95 62Z"
        fill="url(#playerRightGrad)" />
      {/* Racket arm going up-right */}
      <line x1="155" y1="30" x2="180" y2="8" stroke="#00ff88" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Racket head */}
      <ellipse cx="185" cy="0" rx="14" ry="18" stroke="#00ff88" strokeWidth="2" fill="none" opacity="0.4" transform="rotate(-15 185 0)" />
    </svg>
  );
}

function ShuttleSVG() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simplified shuttlecock */}
      <ellipse cx="16" cy="22" rx="5" ry="6" fill="#00d4ff" opacity="0.9" />
      <path d="M11 18 L6 4 L16 12 L26 4 L21 18" fill="#00d4ff" opacity="0.4" />
      <circle cx="16" cy="23" r="3" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

// ── Intersection Observer Hook ──────────────────────────────────

function useScrollAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const el = ref.current;
    if (el) {
      const children = el.querySelectorAll('.animate-on-scroll');
      children.forEach((child) => observer.observe(child));
      // Also observe self
      if (el.classList.contains('animate-on-scroll')) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

// ── Floating Particles ──────────────────────────────────────────

function Particles({ count = 20 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 10}s`,
    size: `${2 + Math.random() * 3}px`,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  );
}

// ── Landing Page Component ──────────────────────────────────────

export default function LandingPage() {
  const featuresRef = useScrollAnimation();
  const showcaseRef = useScrollAnimation();
  const stepsRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

  return (
    <div className="landing-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero-section">
        {/* Background elements */}
        <div className="hero-court-lines" />
        <div className="hero-orb hero-orb--blue" />
        <div className="hero-orb hero-orb--green" />
        <div className="hero-orb hero-orb--purple" />
        <Particles count={18} />

        {/* Shuttle trail + shuttle */}
        <div className="shuttle-trail" />
        <div className="shuttle-anim">
          <ShuttleSVG />
        </div>

        {/* Player silhouettes */}
        <div className="player-silhouette player-silhouette--left">
          <PlayerLeftSVG />
        </div>
        <div className="player-silhouette player-silhouette--right">
          <PlayerRightSVG />
        </div>

        {/* Hero content */}
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            Built for Badminton &amp; Sports Clubs
          </div>

          <h1 className="hero-title">
            Run Tournaments<br />Without the Chaos
          </h1>

          <p className="hero-subtitle">
            Smart scheduling, live scoring, and standings — built for badminton,
            sports clubs, and competitions.
          </p>

          <div className="hero-buttons">
            <Link to="/app" className="btn-primary-neon">
              <Trophy size={18} />
              Start a Tournament
            </Link>
            <Link to="/login" className="btn-secondary-glass">
              Login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <span />
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="landing-section landing-section--dark" ref={featuresRef}>
        <div className="section-container">
          <div className="animate-on-scroll" style={{ textAlign: 'center' }}>
            <div className="section-label">
              <Zap size={14} /> Core Features
            </div>
            <h2 className="section-title" style={{ margin: '0 auto 0.5rem' }}>
              Everything You Need to Run a Tournament
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              No spreadsheets, no confusion. Just clean tools that work.
            </p>
          </div>

          <div className="features-grid stagger-children">
            {/* Card 1 — Scheduling */}
            <div className="feature-card animate-on-scroll" style={{ '--accent': '#00d4ff' }}>
              <div className="feature-icon">
                <Calendar size={24} />
              </div>
              <h3>Auto Scheduling</h3>
              <p>Generate pools, fixtures, and match orders instantly. No manual work, no errors.</p>
            </div>

            {/* Card 2 — Live Scoring */}
            <div className="feature-card animate-on-scroll" style={{ '--accent': '#00ff88' }}>
              <div className="feature-icon feature-icon--green">
                <Radio size={24} />
              </div>
              <h3>Live Score Tracking</h3>
              <p>Update match results in real-time. Players and spectators stay in the loop instantly.</p>
            </div>

            {/* Card 3 — Standings */}
            <div className="feature-card animate-on-scroll" style={{ '--accent': '#8b5cf6' }}>
              <div className="feature-icon feature-icon--purple">
                <Trophy size={24} />
              </div>
              <h3>Standings &amp; Knockouts</h3>
              <p>Automatic rankings, pool standings, and knockout brackets — calculated live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SHOWCASE ═══════════════════ */}
      <section className="landing-section landing-section--darker" ref={showcaseRef}>
        <div className="section-container">
          <div className="showcase-grid">
            {/* Left — Player visual */}
            <div className="showcase-visual animate-on-scroll">
              <div className="showcase-player">
                <svg viewBox="0 0 260 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="showcaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00ff88" stopOpacity="0.1" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Dynamic smash pose — larger */}
                  <circle cx="130" cy="55" r="28" fill="url(#showcaseGrad)" filter="url(#glow)" />
                  <path d="M130 83 L135 170 L155 155 L185 100 L200 65 L210 35 L200 32 L188 68 L160 115 L140 160 L120 185 L100 280 L88 330 L108 330 L125 245 L145 330 L165 330 L150 185 L135 170 L130 83Z"
                    fill="url(#showcaseGrad)" filter="url(#glow)" />
                  {/* Racket */}
                  <line x1="210" y1="35" x2="235" y2="12" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" opacity="0.6" filter="url(#glow)" />
                  <ellipse cx="242" cy="4" rx="18" ry="22" stroke="#00d4ff" strokeWidth="2.5" fill="none" opacity="0.5" transform="rotate(-20 242 4)" filter="url(#glow)" />
                  {/* Motion lines */}
                  <line x1="80" y1="100" x2="40" y2="120" stroke="#00d4ff" strokeWidth="1" opacity="0.2" />
                  <line x1="75" y1="130" x2="30" y2="145" stroke="#00d4ff" strokeWidth="1" opacity="0.15" />
                  <line x1="85" y1="160" x2="45" y2="170" stroke="#00ff88" strokeWidth="1" opacity="0.15" />
                </svg>
              </div>
            </div>

            {/* Right — Content + UI preview */}
            <div className="animate-on-scroll">
              <div className="section-label">
                <Target size={14} /> Designed for Real Matches
              </div>
              <h2 className="section-title">
                From Club Nights<br />to Major Tournaments
              </h2>
              <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
                Whether it's a casual 8-team round robin or a 64-team championship —
                TournPur scales with you.
              </p>

              {/* Mini UI preview */}
              <div className="showcase-ui-preview">
                <div className="ui-preview-header">
                  <div className="ui-live-badge">
                    <span className="ui-live-dot" />
                    Live
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                    Court 2 · Semi Final
                  </span>
                </div>
                <div className="ui-preview-row">
                  <span className="ui-team-name">🏸 Team Alpha</span>
                  <span className="ui-score ui-score--won">21</span>
                </div>
                <div className="ui-preview-row">
                  <span className="ui-team-name">🏸 Team Bravo</span>
                  <span className="ui-score ui-score--lost">18</span>
                </div>
                <div className="ui-preview-row">
                  <span className="ui-team-name" style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    Set 2 in progress…
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#00d4ff' }}>14 - 12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="landing-section landing-section--dark" ref={stepsRef}>
        <div className="section-container">
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div className="section-label">
              <Zap size={14} /> Simple Workflow
            </div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Get from zero to live tournament in minutes.
            </p>
          </div>

          <div className="steps-grid stagger-children">
            <div className="step-card animate-on-scroll">
              <div className="step-number">1</div>
              <h3>Create Tournament</h3>
              <p>Set the name, sport, and format — pools, knockouts, or both.</p>
            </div>

            <div className="step-card animate-on-scroll">
              <div className="step-number">2</div>
              <h3>Add Teams</h3>
              <p>Register teams and players. Assign seeds if you'd like.</p>
            </div>

            <div className="step-card animate-on-scroll">
              <div className="step-number">3</div>
              <h3>Generate Fixtures</h3>
              <p>Auto-generate matches, pools, and schedules with one click.</p>
            </div>

            <div className="step-card animate-on-scroll">
              <div className="step-number">4</div>
              <h3>Track Scores Live</h3>
              <p>Update scores in real-time. Standings update automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="cta-banner" ref={ctaRef}>
        <div className="animate-on-scroll">
          <h2 className="cta-title">Ready to Run Your Next Tournament?</h2>
          <p className="cta-subtitle">
            Join clubs and organizers who trust TournPur for hassle-free competition management.
          </p>
          <div className="cta-buttons">
            <Link to="/app" className="btn-primary-neon">
              <Trophy size={18} />
              Create Free Tournament
            </Link>
            <Link to="/login" className="btn-secondary-glass">
              Login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <h3>
                <Trophy size={20} style={{ color: '#00d4ff' }} />
                TournPur
              </h3>
              <p>
                The modern tournament management platform. Built for sports clubs,
                organizers, and players who love competition.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-links-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <Link to="/app">Dashboard</Link>
              </div>
              <div className="footer-links-group">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Contact</a>
                <a href="#">Blog</a>
              </div>
              <div className="footer-links-group">
                <h4>Connect</h4>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href="#">Twitter</a>
                <a href="#">Discord</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} TournPur. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">v2.0 Q2</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
