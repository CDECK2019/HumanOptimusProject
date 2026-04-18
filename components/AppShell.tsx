import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  MessageCircle,
  LineChart,
  Repeat,
  Activity,
  UserRound,
  Menu,
  X,
  Sparkles,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { computeReadiness } from '../utils/readinessScore';
import type { UserProfile } from '../types';

export type AppNavId = 'overview' | 'coach' | 'reports' | 'insights' | 'habits' | 'body' | 'profile';

interface AppShellProps {
  userEmail?: string;
  profile: UserProfile;
  active: AppNavId;
  onNavigate: (id: AppNavId) => void;
  onLogout: () => void;
  /** Dev-only: sign-in skipped, profile in localStorage */
  devAuthBypass?: boolean;
  /** Optional global error to surface as a dismissible banner above the main pane. */
  globalError?: string | null;
  onDismissError?: () => void;
  children: React.ReactNode;
}

const NAV: { id: AppNavId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'coach', label: 'Coach', icon: MessageCircle },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'insights', label: 'Insights', icon: LineChart },
  { id: 'habits', label: 'Habits', icon: Repeat },
  { id: 'body', label: 'Body & vitals', icon: Activity },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

export const AppShell: React.FC<AppShellProps> = ({
  userEmail,
  profile,
  active,
  onNavigate,
  onLogout,
  devAuthBypass,
  globalError,
  onDismissError,
  children,
}) => {
  const [drawer, setDrawer] = useState(false);
  const { readiness, consistencyHint } = computeReadiness(profile);

  const drawerRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Body scroll lock + ESC to close + return focus to menu button when drawer
  // closes. Focus is moved into the drawer's first focusable element on open.
  useEffect(() => {
    if (!drawer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'a, button, input, select, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawer(false);
      } else if (e.key === 'Tab' && drawerRef.current) {
        // Lightweight focus trap — keep tab navigation inside the drawer.
        const nodes = drawerRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'
        );
        const focusables: HTMLElement[] = [];
        nodes.forEach((el) => {
          if (!el.hasAttribute('disabled')) focusables.push(el);
        });
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement as HTMLElement | null;
        if (e.shiftKey && activeEl === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      menuButtonRef.current?.focus();
    };
  }, [drawer]);

  const NavButtons = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
      {NAV.map((item) => {
        const Icon = item.icon;
        const locked = item.id === 'insights' && readiness < 40;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (locked) return;
              onNavigate(item.id);
              setDrawer(false);
            }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              isActive
                ? 'bg-white/15 text-white'
                : locked
                  ? 'cursor-not-allowed text-emerald-100/35'
                  : 'text-emerald-50/90 hover:bg-white/10'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            <span className="flex-1">{item.label}</span>
            {locked && <span className="text-[10px] font-bold uppercase tracking-wide">Soon</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[18%] top-[-8%] h-[42vh] w-[42vh] rounded-full bg-emerald-400/12 blur-[120px]" />
        <div className="absolute -right-[12%] bottom-[-8%] h-[38vh] w-[38vh] rounded-full bg-emerald-500/10 blur-[110px]" />
      </div>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-emerald-950/20 bg-emerald-950 px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2 font-display text-lg font-black tracking-tight">
          <span className="text-white">Human</span>
          <span className="text-emerald-300">Optimus</span>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          className="rounded-xl p-2 hover:bg-white/10"
          onClick={() => setDrawer((d) => !d)}
          aria-label={drawer ? 'Close menu' : 'Open menu'}
          aria-expanded={drawer}
          aria-controls="ho-mobile-drawer"
        >
          {drawer ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {drawer && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          role="presentation"
          onClick={() => setDrawer(false)}
        />
      )}

      <div className="relative z-10 flex min-h-[calc(100vh-52px)] md:min-h-screen">
        {/* Sidebar desktop */}
        <aside className="relative z-50 hidden w-64 shrink-0 flex-col bg-emerald-950 text-white md:flex">
          <div className="border-b border-white/10 px-6 py-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-200/80">Health desk</p>
            <h1 className="mt-2 font-display text-xl font-black tracking-tight">
              <span className="text-white">Human</span>{' '}
              <span className="text-emerald-300">Optimus</span>
            </h1>
            {userEmail && <p className="mt-2 truncate text-xs text-emerald-100/70">{userEmail}</p>}
            {devAuthBypass && (
              <p className="mt-3 rounded-lg bg-amber-400/15 px-2 py-1.5 text-[10px] font-semibold leading-snug text-amber-100">
                Dev mode: auth skipped · data in this browser only
              </p>
            )}
          </div>
          {NavButtons}
          <div className="mt-auto space-y-3 border-t border-white/10 px-5 py-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/70">Readiness</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-display text-3xl font-black text-white">{readiness}</span>
                <span className="pb-1 text-xs font-medium text-emerald-100/80">/ 100</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-300 transition-all duration-700"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-emerald-100/75">{consistencyHint}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-xl border border-white/15 py-2 text-xs font-bold text-emerald-50 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Drawer mobile */}
        <aside
          ref={drawerRef}
          id="ho-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Primary navigation"
          aria-hidden={!drawer}
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(88vw,300px)] transform flex-col bg-emerald-950 text-white shadow-2xl transition md:hidden ${
            drawer ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
          }`}
        >
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-2 font-display text-lg font-black">
              <Sparkles className="h-5 w-5 text-emerald-300" />
              <span>Navigate</span>
            </div>
            {userEmail && (
              <p className="mt-3 truncate text-xs font-medium text-emerald-100/80">{userEmail}</p>
            )}
            {devAuthBypass && (
              <p className="mt-2 rounded-lg bg-amber-400/15 px-2 py-1.5 text-[10px] font-semibold leading-snug text-amber-100">
                Dev mode: auth skipped · data in this browser only
              </p>
            )}
          </div>
          {NavButtons}
          <div className="mt-auto space-y-3 border-t border-white/10 px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/70">Readiness</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-2xl font-black text-white">{readiness}</span>
                <span className="pb-0.5 text-xs font-medium text-emerald-100/80">/ 100</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-300 transition-all duration-700"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-emerald-100/75">{consistencyHint}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-xl bg-white/10 py-2 text-sm font-bold hover:bg-white/15"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="relative min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10 lg:pl-12">
          {globalError && (
            <div
              role="alert"
              className="mx-auto mb-6 flex max-w-5xl items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1 text-sm font-medium leading-relaxed">{globalError}</div>
              {onDismissError && (
                <button
                  type="button"
                  onClick={onDismissError}
                  className="rounded-lg p-1 text-rose-700 hover:bg-rose-100"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
