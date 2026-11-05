import React, { useState, useEffect } from 'react';
import { Activity, Clock, Moon, Zap, Timer } from 'lucide-react';
import {
  calculatePigeonSpeed,
  calculateArrivalDateForFlyingMinutes,
  SpeedResult,
  formatDuration,
} from '../utils/pigeonCalc';
import { formatTime12h } from '../utils/solar';

interface LiveSpeedCardProps {
  distanceKm: number;
  releaseDate: Date | null;
  lat: number;
  lng: number;
  customOverride?: { sunriseHour?: number; sunsetHour?: number };
  sunrise: Date;
  sunset: Date;
}

export const LiveSpeedCard: React.FC<LiveSpeedCardProps> = ({
  distanceKm,
  releaseDate,
  lat,
  lng,
  customOverride,
  sunrise,
}) => {
  const [liveNow, setLiveNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!releaseDate || distanceKm <= 0) {
    return (
      <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl p-4 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
        <Activity className="w-5 h-5 mx-auto mb-1.5 text-slate-400 opacity-60" />
        <p className="font-medium">Live Speed Tracker Inactive</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Enter Distance & Release Time above to start tracking live MPM
        </p>
      </div>
    );
  }

  // If release is in the future
  if (liveNow.getTime() < releaseDate.getTime()) {
    const diffMs = releaseDate.getTime() - liveNow.getTime();
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-4 border border-sky-200 dark:border-sky-900 shadow-sm text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold mb-2">
          <Clock className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Countdown to Liberation</span>
        </div>
        <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
          -{formatDuration(diffMs)}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Pigeon release scheduled for {releaseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </p>
      </div>
    );
  }

  const liveResult: SpeedResult | null = calculatePigeonSpeed(
    distanceKm,
    releaseDate,
    liveNow,
    lat,
    lng,
    customOverride
  );

  if (!liveResult) return null;

  // Rule: Only start live speed tracking display when calculated live speed <= 1400 MPM
  if (liveResult.mpm > 1400) {
    const requiredFlyingMinutes = (distanceKm * 1000) / 1400;
    const { arrivalDate: target1400Date } = calculateArrivalDateForFlyingMinutes(
      releaseDate,
      requiredFlyingMinutes,
      lat,
      lng,
      customOverride
    );

    const diffTo1400Ms = Math.max(0, target1400Date.getTime() - liveNow.getTime());

    return (
      <div className="bg-gradient-to-br from-sky-900 via-slate-900 to-slate-900 text-white rounded-2xl p-4 border border-sky-700/70 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Liberation In Progress
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
            &gt; 1,400 MPM
          </span>
        </div>

        <div className="my-3 text-center relative z-10">
          <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-300">
            Waiting for 1,400 MPM Speed Window
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 mt-1 drop-shadow-sm">
            -{formatDuration(diffTo1400Ms)}
          </div>
          <div className="text-xs font-medium text-slate-300 mt-1">
            Expected 1,400 MPM at <strong className="text-white font-mono">{formatTime12h(target1400Date)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs relative z-10">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              Elapsed Flight Time
            </div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              {liveResult.breakdown.formattedFlyingTime}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Live Tracking Window
            </div>
            <div className="text-xs font-bold font-mono text-amber-300 mt-1">
              Starts at ≤ 1,400 MPM
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDeadTime = liveResult.breakdown.isCurrentlyDeadTime;

  return (
    <div className={`rounded-2xl p-4 border transition shadow-sm relative overflow-hidden ${
      isDeadTime
        ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-700 text-white'
        : 'bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 text-white border-sky-700/80'
    }`}>
      {/* Background glow decorative element */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header of Live Card */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isDeadTime ? 'bg-indigo-400' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isDeadTime ? 'bg-indigo-500' : 'bg-emerald-500'
            }`} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isDeadTime ? 'Live Speed (Paused - Dead Time)' : 'Live In-Flight Speed'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-sky-300 bg-white/10 px-2 py-0.5 rounded-full">
          <Zap className="w-3 h-3 text-amber-300" />
          <span>Realtime</span>
        </div>
      </div>

      {/* Main Live MPM display */}
      <div className="my-3 text-center relative z-10">
        <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-300">
          Current Live Speed
        </div>
        <div className="flex items-baseline justify-center gap-2 mt-0.5">
          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm">
            {liveResult.mpm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-lg font-bold font-mono text-sky-400">
            mpm
          </span>
        </div>
        <div className="text-xs font-medium text-slate-300 mt-1 flex items-center justify-center gap-2">
          <span>{liveResult.kmh.toFixed(1)} km/h</span>
          <span>•</span>
          <span>{liveResult.mph.toFixed(1)} mph</span>
        </div>
      </div>

      {/* Dead time paused notice if active */}
      {isDeadTime && (
        <div className="mb-3 p-2.5 rounded-xl bg-indigo-900/60 border border-indigo-500/40 text-xs flex items-center gap-2 relative z-10">
          <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
          <div className="text-[11px] leading-tight text-indigo-200">
            <strong>Dead Time Rule in Effect:</strong> Night pause active. Speed is frozen at sunset and will resume counting at tomorrow sunrise ({formatTime12h(sunrise)}).
          </div>
        </div>
      )}

      {/* Flight Time Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs relative z-10">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            Net Flying Time
          </div>
          <div className="text-sm font-bold font-mono text-white mt-0.5">
            {liveResult.breakdown.formattedFlyingTime}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Moon className="w-3 h-3 text-indigo-400" />
            Deducted Dead Time
          </div>
          <div className="text-sm font-bold font-mono text-white mt-0.5">
            {liveResult.breakdown.formattedDeadTime}
          </div>
        </div>
      </div>
    </div>
  );
};
