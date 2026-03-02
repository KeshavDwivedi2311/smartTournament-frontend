import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, LayoutDashboard, Activity, BarChart3, Settings, Home, Menu, X, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app', label: 'Tournaments', icon: Trophy, hash: '#tournaments' },
  { to: '/app', label: 'Live Matches', icon: Activity, badge: 'Soon' },
  { to: '/app', label: 'Analytics', icon: BarChart3, badge: 'Soon' },
];

function NavLink({ to, label, icon: Icon, badge, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'text-[var(--sport-blue)] bg-[var(--sport-blue)]/10'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--sport-purple)]/20 text-[var(--sport-purple)] leading-none">
          {badge}
        </span>
      )}
      {isActive && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--sport-blue)] rounded-full" />
      )}
    </Link>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOnDashboard = location.pathname === '/app';
  const isInApp = location.pathname.startsWith('/app');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ Premium Dark App Shell Header ═══ */}
      <header className="bg-[var(--sport-bg)] border-b border-white/[0.06] sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--sport-blue)] to-[var(--sport-green)] flex items-center justify-center shadow-lg shadow-[var(--sport-blue)]/20 group-hover:shadow-[var(--sport-blue)]/40 transition-shadow">
                <Trophy className="w-4.5 h-4.5 text-[var(--sport-bg)]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Tourn<span className="sport-gradient-text">Pur</span>
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  isActive={item.label === 'Dashboard' && isOnDashboard}
                />
              ))}
            </nav>

            {/* ── Right Side ── */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Home link */}
              {isInApp && (
                <Link
                  to="/"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-[var(--sport-blue)] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden lg:inline">Home</span>
                </Link>
              )}

              {/* Settings placeholder */}
              <button
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--sport-blue)] to-[var(--sport-green)] flex items-center justify-center text-xs font-bold text-[var(--sport-bg)] ring-2 ring-white/10 cursor-pointer hover:ring-[var(--sport-blue)]/30 transition-all">
                U
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[var(--sport-bg)]/95 backdrop-blur-xl animate-fade-slide-up">
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.label === 'Dashboard' && isOnDashboard;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? 'text-[var(--sport-blue)] bg-[var(--sport-blue)]/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--sport-purple)]/20 text-[var(--sport-purple)]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t border-white/[0.06] my-2" />

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
