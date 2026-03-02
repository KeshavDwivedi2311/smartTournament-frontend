import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Radio, Trophy, Zap, Users, Target, ArrowRight, ChevronDown, Github } from 'lucide-react';
import './LandingPage.css';

// ── SVG Silhouettes ─────────────────────────────────────────────

function PlayerLeftSVG() {
  return (
    <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="playerLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <circle cx="105" cy="45" r="22" fill="url(#playerLeftGrad)" />
      <path d="M105 67 L95 140 L80 130 L60 95 L50 100 L75 140 L85 160 L70 240 L60 310 L78 310 L100 210 L115 310 L133 310 L120 160 L130 140 L155 110 L170 80 L160 72 L135 105 L115 140 L105 67Z"
        fill="url(#playerLeftGrad)" />
      <line x1="50" y1="100" x2="15" y2="60" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="10" cy="50" rx="14" ry="18" stroke="#00d4ff" strokeWidth="2" fill="none" opacity="0.4" />
    </svg>
  );
}

function PlayerRightSVG() {
  return (
    <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="playerRightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <circle cx="95" cy="40" r="22" fill="url(#playerRightGrad)" />
      <path d="M95 62 L100 140 L115 130 L140 80 L150 50 L155 30 L148 28 L138 55 L120 90 L105 130 L85 155 L70 240 L60 310 L78 310 L95 210 L110 310 L128 310 L115 155 L100 140 L95 62Z"
        fill="url(#playerRightGrad)" />
      <line x1="155" y1="30" x2="180" y2="8" stroke="#00ff88" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="185" cy="0" rx="14" ry="18" stroke="#00ff88" strokeWidth="2" fill="none" opacity="0.4" transform="rotate(-15 185 0)" />
    </svg>
  );
}

function ShuttleSVG() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="22" rx="5" ry="6" fill="#00d4ff" opacity="0.9" />
      <path d="M11 18 L6 4 L16 12 L26 4 L21 18" fill="#00d4ff" opacity="0.4" />
      <circle cx="16" cy="23" r="3" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 1: LIVE MATCH SIMULATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MATCH_SCRIPT = [
  // Each entry: [teamAScore, teamBScore, set, serving, status]
  // Simulate a fast-paced rally of a badminton set
  { a: 0, b: 0, set: 1, serving: 'a', status: 'In Play' },
  { a: 1, b: 0, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 1, b: 1, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 2, b: 1, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 3, b: 1, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 3, b: 2, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 3, b: 3, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 4, b: 3, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 5, b: 3, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 5, b: 4, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 6, b: 4, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 7, b: 4, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 7, b: 5, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 8, b: 5, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 9, b: 5, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 10, b: 5, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 11, b: 5, set: 1, serving: 'a', status: 'Interval', scored: 'a' },
  // After interval, pace picks up
  { a: 11, b: 6, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 12, b: 6, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 12, b: 7, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 13, b: 7, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 14, b: 7, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 14, b: 8, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 15, b: 8, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 16, b: 8, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 16, b: 9, set: 1, serving: 'b', status: 'In Play', scored: 'b' },
  { a: 17, b: 9, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 18, b: 9, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 19, b: 9, set: 1, serving: 'a', status: 'In Play', scored: 'a' },
  { a: 20, b: 9, set: 1, serving: 'a', status: 'Set Point', scored: 'a' },
  { a: 21, b: 9, set: 1, serving: 'a', status: 'Set 1 Won!', scored: 'a', setEnd: true },
  // Set 2 begins — tighter contest
  { a: 0, b: 0, set: 2, serving: 'b', status: 'In Play', setsWon: [1, 0] },
  { a: 0, b: 1, set: 2, serving: 'b', status: 'In Play', scored: 'b', setsWon: [1, 0] },
  { a: 1, b: 1, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 2, b: 1, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 2, b: 2, set: 2, serving: 'b', status: 'In Play', scored: 'b', setsWon: [1, 0] },
  { a: 3, b: 2, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 3, b: 3, set: 2, serving: 'b', status: 'In Play', scored: 'b', setsWon: [1, 0] },
  { a: 4, b: 3, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 5, b: 3, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 6, b: 3, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 7, b: 3, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 8, b: 3, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 9, b: 3, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 10, b: 3, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 11, b: 3, set: 2, serving: 'a', status: 'Interval', scored: 'a', setsWon: [1, 0] },
  { a: 11, b: 4, set: 2, serving: 'b', status: 'In Play', scored: 'b', setsWon: [1, 0] },
  { a: 12, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 13, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 14, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 15, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 16, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 17, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 18, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 19, b: 4, set: 2, serving: 'a', status: 'In Play', scored: 'a', setsWon: [1, 0] },
  { a: 20, b: 4, set: 2, serving: 'a', status: 'Match Point', scored: 'a', setsWon: [1, 0] },
  { a: 21, b: 4, set: 2, serving: 'a', status: 'Match Won!', scored: 'a', setsWon: [2, 0], winner: 'a' },
];

function LiveMatchSimulator() {
  const [step, setStep] = useState(0);
  const [scoringTeam, setScoringTeam] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        const next = (prev + 1) % MATCH_SCRIPT.length;
        const frame = MATCH_SCRIPT[next];
        if (frame.scored) {
          setScoringTeam(frame.scored);
          setTimeout(() => setScoringTeam(null), 400);
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const frame = MATCH_SCRIPT[step];
  const setsWon = frame.setsWon || [0, 0];

  return (
    <div className="match-simulator">
      <div className="match-sim-header">
        <div className="match-sim-live">
          <span className="match-sim-live-dot" />
          Live Match
        </div>
        <span className="match-sim-court">Court 3 · Final</span>
      </div>

      <div className="match-sim-teams">
        {/* Team A */}
        <div className={`match-sim-team ${scoringTeam === 'a' ? 'scoring' : ''}`}>
          <span className="match-sim-team-name">
            {frame.serving === 'a' && <span className="serving-dot" />}
            Smashers
          </span>
          <div className="match-sim-scores">
            {frame.set >= 2 && (
              <span className={`match-sim-set-score ${setsWon[0] >= 1 ? 'won' : ''}`}>
                {frame.set === 2 && step < MATCH_SCRIPT.length - 1 ? 21 : setsWon[0] >= 1 ? 21 : '-'}
              </span>
            )}
            <span className={`match-sim-current ${scoringTeam === 'a' ? 'point-scored' : ''}`}>
              {frame.a}
            </span>
          </div>
        </div>

        {/* Team B */}
        <div className={`match-sim-team ${scoringTeam === 'b' ? 'scoring' : ''}`}>
          <span className="match-sim-team-name">
            {frame.serving === 'b' && <span className="serving-dot" />}
            Netblazers
          </span>
          <div className="match-sim-scores">
            {frame.set >= 2 && (
              <span className={`match-sim-set-score ${setsWon[1] >= 1 ? 'won' : ''}`}>
                {frame.set === 2 && step < MATCH_SCRIPT.length - 1 ? 9 : setsWon[1] >= 1 ? 21 : '-'}
              </span>
            )}
            <span className={`match-sim-current ${scoringTeam === 'b' ? 'point-scored' : ''}`}>
              {frame.b}
            </span>
          </div>
        </div>
      </div>

      <div className="match-sim-footer">
        <span className="match-sim-set-label">Set {frame.set} of 3</span>
        <span className="match-sim-status">{frame.status}</span>
      </div>

      {frame.winner && (
        <div className="match-sim-winner">
          <span className="match-sim-winner-text">
            <span className="match-sim-winner-trophy">★</span>
            Smashers Win!
          </span>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 2: TYPEWRITER SPORT ROTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SPORTS = ['Badminton', 'Table Tennis', 'Cricket', 'Football', 'Volleyball', 'Tennis'];

function TypewriterSport() {
  const [sportIndex, setSportIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSport = SPORTS[sportIndex];

    if (!isDeleting && charIndex === currentSport.length) {
      // Pause at full word, then start deleting
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charIndex === 0) {
      // Move to next sport
      setIsDeleting(false);
      setSportIndex((prev) => (prev + 1) % SPORTS.length);
      return;
    }

    const speed = isDeleting ? 50 : 100;
    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, sportIndex]);

  const currentText = SPORTS[sportIndex].slice(0, charIndex);

  return (
    <span className="typewriter-wrapper">
      <span className="typewriter-sport">{currentText}</span>
      <span className="typewriter-cursor" />
    </span>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 3: ESPN STATS TICKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TICKER_ITEMS = [
  { number: '2,400+', label: 'Matches Tracked' },
  { number: '350+', label: 'Tournaments Run' },
  { number: '8,000+', label: 'Players Registered' },
  { number: '12', label: 'Cities Active' },
  { number: '98%', label: 'Uptime' },
  { number: '4.9★', label: 'Club Rating' },
  { number: '15s', label: 'Avg Score Update' },
  { number: '50+', label: 'Sports Clubs' },
];

function StatsTicker() {
  // Double the items for seamless infinite scroll
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="stats-ticker">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <div className="ticker-item">
              <span className="ticker-number">{item.number}</span>
              <span>{item.label}</span>
            </div>
            {i < doubled.length - 1 && <span className="ticker-separator">◆</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 4: ANIMATED TOURNAMENT BRACKET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BRACKET_TEAMS = {
  r1: [
    { a: 'Smashers', b: 'Hawks', scoreA: 21, scoreB: 15, winner: 'a' },
    { a: 'Netblazers', b: 'Falcons', scoreA: 21, scoreB: 18, winner: 'a' },
    { a: 'Shuttlers', b: 'Eagles', scoreA: 19, scoreB: 21, winner: 'b' },
    { a: 'Aces', b: 'Thunder', scoreA: 21, scoreB: 12, winner: 'a' },
  ],
  r2: [
    { a: 'Smashers', b: 'Netblazers', scoreA: 21, scoreB: 17, winner: 'a' },
    { a: 'Eagles', b: 'Aces', scoreA: 18, scoreB: 21, winner: 'b' },
  ],
  final: { a: 'Smashers', b: 'Aces', scoreA: 21, scoreB: 14, winner: 'a', champion: 'Smashers' },
};

function TournamentBracket() {
  const bracketRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0=hidden, 1=R1, 2=R2, 3=Final, 4=Champion

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && phase === 0) {
          setPhase(1);
          setTimeout(() => setPhase(2), 1200);
          setTimeout(() => setPhase(3), 2400);
          setTimeout(() => setPhase(4), 3600);
        }
      },
      { threshold: 0.3 }
    );
    if (bracketRef.current) observer.observe(bracketRef.current);
    return () => observer.disconnect();
  }, [phase]);

  // SVG bracket layout
  const W = 900, H = 380;
  const col1X = 30, col2X = 300, col3X = 570, col4X = 760;
  const boxW = 200, boxH = 32;

  const r1Positions = [40, 110, 200, 270];
  const r2Positions = [75, 235];
  const finalY = 155;
  const champY = 155;

  return (
    <section className="bracket-section" ref={bracketRef}>
      <div className="bracket-container">
        <div style={{ textAlign: 'center' }}>
          <div className="section-label">
            <Trophy size={14} /> Live Bracket
          </div>
          <h2 className="section-title">Watch the Tournament Unfold</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Real brackets, real scores — auto-calculated as matches finish.
          </p>
        </div>

        <div className="bracket-visual">
          <svg viewBox={`0 0 ${W} ${H}`} className="bracket-svg">
            <defs>
              <linearGradient id="bracketBoxGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
              <filter id="bracketGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Round 1 — 4 matches */}
            {BRACKET_TEAMS.r1.map((match, i) => {
              const y = r1Positions[i];
              return (
                <g key={`r1-${i}`} className={`bracket-team-box ${phase >= 1 ? 'visible' : ''}`}
                  style={{ transitionDelay: `${i * 0.15}s` }}>
                  <rect x={col1X} y={y} width={boxW} height={boxH} rx="6" fill="url(#bracketBoxGrad)"
                    stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
                  <text x={col1X + 10} y={y + 14} className="bracket-team-text">{match.a}</text>
                  <text x={col1X + boxW - 10} y={y + 14} className="bracket-score-text" textAnchor="end">{match.scoreA}</text>
                  <text x={col1X + 10} y={y + 27} className="bracket-team-text" opacity="0.5">{match.b}</text>
                  <text x={col1X + boxW - 10} y={y + 27} className="bracket-score-text" textAnchor="end" opacity="0.5">{match.scoreB}</text>
                </g>
              );
            })}

            {/* Connector lines R1 → R2 */}
            {[0, 1].map((i) => {
              const y1a = r1Positions[i * 2] + boxH / 2;
              const y1b = r1Positions[i * 2 + 1] + boxH / 2;
              const y2 = r2Positions[i] + boxH / 2;
              const midX = col1X + boxW + 20;
              return (
                <g key={`conn1-${i}`}>
                  <line x1={col1X + boxW} y1={y1a} x2={midX} y2={y1a}
                    className={`bracket-line ${phase >= 2 ? 'drawn' : ''}`}
                    style={{ '--line-length': '20', transitionDelay: `${0.3 + i * 0.2}s` }} />
                  <line x1={col1X + boxW} y1={y1b} x2={midX} y2={y1b}
                    className={`bracket-line ${phase >= 2 ? 'drawn' : ''}`}
                    style={{ '--line-length': '20', transitionDelay: `${0.4 + i * 0.2}s` }} />
                  <line x1={midX} y1={y1a} x2={midX} y2={y1b}
                    className={`bracket-line ${phase >= 2 ? 'drawn' : ''}`}
                    style={{ '--line-length': `${y1b - y1a}`, transitionDelay: `${0.5 + i * 0.2}s` }} />
                  <line x1={midX} y1={y2} x2={col2X} y2={y2}
                    className={`bracket-line ${phase >= 2 ? 'drawn' : ''}`}
                    style={{ '--line-length': `${col2X - midX}`, transitionDelay: `${0.7 + i * 0.2}s` }} />
                </g>
              );
            })}

            {/* Round 2 — 2 matches */}
            {BRACKET_TEAMS.r2.map((match, i) => {
              const y = r2Positions[i];
              return (
                <g key={`r2-${i}`} className={`bracket-team-box ${phase >= 2 ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.8 + i * 0.15}s` }}>
                  <rect x={col2X} y={y} width={boxW} height={boxH} rx="6" fill="url(#bracketBoxGrad)"
                    stroke="rgba(0,212,255,0.15)" strokeWidth="1" />
                  <text x={col2X + 10} y={y + 14} className="bracket-team-text">{match.a}</text>
                  <text x={col2X + boxW - 10} y={y + 14} className="bracket-score-text" textAnchor="end">{match.scoreA}</text>
                  <text x={col2X + 10} y={y + 27} className="bracket-team-text" opacity="0.5">{match.b}</text>
                  <text x={col2X + boxW - 10} y={y + 27} className="bracket-score-text" textAnchor="end" opacity="0.5">{match.scoreB}</text>
                </g>
              );
            })}

            {/* Connector lines R2 → Final */}
            {(() => {
              const y1 = r2Positions[0] + boxH / 2;
              const y2 = r2Positions[1] + boxH / 2;
              const yf = finalY + boxH / 2;
              const midX = col2X + boxW + 20;
              return (
                <g>
                  <line x1={col2X + boxW} y1={y1} x2={midX} y2={y1}
                    className={`bracket-line ${phase >= 3 ? 'drawn' : ''}`}
                    style={{ '--line-length': '20', transitionDelay: '1.2s' }} />
                  <line x1={col2X + boxW} y1={y2} x2={midX} y2={y2}
                    className={`bracket-line ${phase >= 3 ? 'drawn' : ''}`}
                    style={{ '--line-length': '20', transitionDelay: '1.3s' }} />
                  <line x1={midX} y1={y1} x2={midX} y2={y2}
                    className={`bracket-line ${phase >= 3 ? 'drawn' : ''}`}
                    style={{ '--line-length': `${y2 - y1}`, transitionDelay: '1.4s' }} />
                  <line x1={midX} y1={yf} x2={col3X} y2={yf}
                    className={`bracket-line ${phase >= 3 ? 'drawn' : ''}`}
                    style={{ '--line-length': `${col3X - midX}`, transitionDelay: '1.6s' }} />
                </g>
              );
            })()}

            {/* Final */}
            <g className={`bracket-team-box ${phase >= 3 ? 'visible' : ''}`}
              style={{ transitionDelay: '1.8s' }}>
              <rect x={col3X} y={finalY} width={boxW} height={boxH} rx="6" fill="url(#bracketBoxGrad)"
                stroke="rgba(0,255,136,0.2)" strokeWidth="1.5" />
              <text x={col3X + 10} y={finalY + 14} className="bracket-team-text">{BRACKET_TEAMS.final.a}</text>
              <text x={col3X + boxW - 10} y={finalY + 14} className="bracket-score-text" textAnchor="end">{BRACKET_TEAMS.final.scoreA}</text>
              <text x={col3X + 10} y={finalY + 27} className="bracket-team-text" opacity="0.5">{BRACKET_TEAMS.final.b}</text>
              <text x={col3X + boxW - 10} y={finalY + 27} className="bracket-score-text" textAnchor="end" opacity="0.5">{BRACKET_TEAMS.final.scoreB}</text>
            </g>

            {/* Champion connector */}
            <line x1={col3X + boxW} y1={finalY + boxH / 2} x2={col4X} y2={champY + boxH / 2}
              className={`bracket-line ${phase >= 4 ? 'drawn' : ''}`}
              style={{ '--line-length': `${col4X - col3X - boxW}`, transitionDelay: '2.2s', stroke: 'rgba(0,255,136,0.4)' }} />

            {/* Champion box */}
            <g className={`bracket-team-box ${phase >= 4 ? 'visible' : ''}`}
              style={{ transitionDelay: '2.5s' }}>
              <rect x={col4X} y={champY} width={110} height={boxH} rx="8"
                fill="rgba(0,255,136,0.08)" stroke="rgba(0,255,136,0.3)" strokeWidth="2" />
              <text x={col4X + 18} y={champY + 20} className="bracket-winner-text">
                ★ {BRACKET_TEAMS.final.champion}
              </text>
            </g>

            {/* Champion glow */}
            <circle cx={col4X + 55} cy={champY + boxH / 2} r="50"
              fill="none" stroke="rgba(0,255,136,0.1)" strokeWidth="1"
              className={`bracket-champion-glow ${phase >= 4 ? 'visible' : ''}`}
              filter="url(#bracketGlow)" />
          </svg>
        </div>
      </div>
    </section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 5: 3D TILT CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TiltCard({ children, accentColor = '#00d4ff', className = '', style = {} }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card feature-card ${className}`}
      style={{ ...style, transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="tilt-glow"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${accentColor}15 0%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

// ── Shared Utilities ────────────────────────────────────────────

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
      if (el.classList.contains('animate-on-scroll')) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

function Particles({ count = 20 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 10}s`,
      size: `${2 + Math.random() * 3}px`,
      opacity: 0.2 + Math.random() * 0.4,
    })), [count]
  );

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN LANDING PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

          {/* ★ Typewriter subtitle */}
          <p className="hero-subtitle">
            Smart scheduling, live scoring, and standings — built for{' '}
            <TypewriterSport />{' '}
            clubs, and competitions.
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

          {/* ★ Live Match Simulator — inline below CTA */}
          <LiveMatchSimulator />
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <span />
        </div>
      </section>

      {/* ═══════════════════ STATS TICKER ═══════════════════ */}
      <StatsTicker />

      {/* ═══════════════════ FEATURES (3D Tilt Cards) ═══════════════════ */}
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
            {/* ★ 3D Tilt Card 1 — Scheduling */}
            <TiltCard accentColor="#00d4ff" className="animate-on-scroll" style={{ '--accent': '#00d4ff' }}>
              <div className="feature-icon">
                <Calendar size={24} />
              </div>
              <h3>Auto Scheduling</h3>
              <p>Generate pools, fixtures, and match orders instantly. No manual work, no errors.</p>
            </TiltCard>

            {/* ★ 3D Tilt Card 2 — Live Scoring */}
            <TiltCard accentColor="#00ff88" className="animate-on-scroll" style={{ '--accent': '#00ff88' }}>
              <div className="feature-icon feature-icon--green">
                <Radio size={24} />
              </div>
              <h3>Live Score Tracking</h3>
              <p>Update match results in real-time. Players and spectators stay in the loop instantly.</p>
            </TiltCard>

            {/* ★ 3D Tilt Card 3 — Standings */}
            <TiltCard accentColor="#8b5cf6" className="animate-on-scroll" style={{ '--accent': '#8b5cf6' }}>
              <div className="feature-icon feature-icon--purple">
                <Trophy size={24} />
              </div>
              <h3>Standings &amp; Knockouts</h3>
              <p>Automatic rankings, pool standings, and knockout brackets — calculated live.</p>
            </TiltCard>
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
                  <circle cx="130" cy="55" r="28" fill="url(#showcaseGrad)" filter="url(#glow)" />
                  <path d="M130 83 L135 170 L155 155 L185 100 L200 65 L210 35 L200 32 L188 68 L160 115 L140 160 L120 185 L100 280 L88 330 L108 330 L125 245 L145 330 L165 330 L150 185 L135 170 L130 83Z"
                    fill="url(#showcaseGrad)" filter="url(#glow)" />
                  <line x1="210" y1="35" x2="235" y2="12" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" opacity="0.6" filter="url(#glow)" />
                  <ellipse cx="242" cy="4" rx="18" ry="22" stroke="#00d4ff" strokeWidth="2.5" fill="none" opacity="0.5" transform="rotate(-20 242 4)" filter="url(#glow)" />
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
                  <span className="ui-team-name">Team Alpha</span>
                  <span className="ui-score ui-score--won">21</span>
                </div>
                <div className="ui-preview-row">
                  <span className="ui-team-name">Team Bravo</span>
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

      {/* ═══════════════════ TOURNAMENT BRACKET ═══════════════════ */}
      <TournamentBracket />

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
