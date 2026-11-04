import React, { useState, useEffect } from 'react';
import { Sun, Moon, Clock, RefreshCw, BookmarkCheck } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { formatTimeWithSeconds, formatDateShort } from '../utils/solar';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  locationName: string;
  onReset: () => void;
  onOpenHistory?: () => void;
  savedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  locationName,
  onReset,
  onOpenHistory,
  savedCount = 0,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showSeconds, setShowSeconds] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = showSeconds
    ? formatTimeWithSeconds(currentTime)
    : currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  // Separate time number and AM/PM
  const [timePart, ampm] = timeFormatted.split(' ');

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Top bar: Brand + Actions */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-sky-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  PigeonSpeed
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate max-w-[140px]">
                {locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <PWAInstallButton />

            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                title="Saved calculations"
                aria-label="Saved Calculations"
              >
                <BookmarkCheck className="w-4 h-4 text-sky-500" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onReset}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              title="Reset fields"
              aria-label="Reset Calculator"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Big Current Time Display */}
        <div className="mt-1 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-500 inline animate-spin-slow" />
              Live Clock Time
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white select-all">
                {timePart}
              </span>
              <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
                {ampm}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              {formatDateShort(currentTime)}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={() => setShowSeconds(!showSeconds)}
              className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Toggle seconds display"
            >
              {showSeconds ? ':SS ON' : ':SS OFF'}
            </button>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Synced</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
