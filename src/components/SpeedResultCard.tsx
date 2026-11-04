import React, { useState } from 'react';
import { Award, Clock, Moon, Share2, Check, Bookmark, FileText } from 'lucide-react';
import { SpeedResult } from '../utils/pigeonCalc';
import { formatDateShort, formatTime12h } from '../utils/solar';

interface SpeedResultCardProps {
  result: SpeedResult;
  releaseDate: Date;
  arrivalDate: Date;
  pointAName?: string;
  pointBName?: string;
  onSaveRace?: () => void;
  isSaved?: boolean;
}

export const SpeedResultCard: React.FC<SpeedResultCardProps> = ({
  result,
  releaseDate,
  arrivalDate,
  pointAName,
  pointBName,
  onSaveRace,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const report = `🕊️ PIGEON RACE SPEED RESULT 🕊️
-----------------------------------
📍 Distance: ${result.distanceKm.toFixed(3)} km (${result.distanceMeters.toLocaleString()} m)
${pointAName ? `🚩 Release: ${pointAName}` : ''}
${pointBName ? `🏠 Loft: ${pointBName}` : ''}
🚀 Release Time: ${formatDateShort(releaseDate)} ${formatTime12h(releaseDate)}
🏁 Arrival Time: ${formatDateShort(arrivalDate)} ${formatTime12h(arrivalDate)}
⏱️ Net Flying Time: ${result.breakdown.formattedFlyingTime}
🌙 Dead Time Deducted: ${result.breakdown.formattedDeadTime}
⚡ Velocity / Speed: ${result.mpm.toFixed(2)} MPM (${result.kmh.toFixed(1)} km/h)
🏆 Performance: ${result.performanceRating}
-----------------------------------
Calculated via Pigeon Speed Calculator Pro`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-emerald-500/50 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
      {/* Decorative top ribbon */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/30">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Clocked Speed
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Meter Per Minute (MPM)
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          result.performanceRating === 'Super Fast'
            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
            : result.performanceRating === 'Fast'
            ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400'
            : result.performanceRating === 'Normal'
            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}>
          {result.performanceRating}
        </span>
      </div>

      {/* Main Big Velocity Display */}
      <div className="py-4 text-center">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Calculated Speed
        </div>
        <div className="flex items-baseline justify-center gap-2 mt-1">
          <span className="text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {result.mpm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            MPM
          </span>
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-3">
          <span>{result.kmh.toFixed(2)} km/h</span>
          <span>•</span>
          <span>{result.mph.toFixed(2)} mph</span>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-sky-500" /> Net Flying Time
          </span>
          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
            {result.breakdown.formattedFlyingTime}
          </div>
          <span className="text-[10px] text-slate-400">
            ({result.breakdown.netFlyingMinutes.toFixed(2)} mins)
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Moon className="w-3 h-3 text-indigo-500" /> Dead Time Deducted
          </span>
          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
            {result.breakdown.formattedDeadTime}
          </div>
          <span className="text-[10px] text-slate-400">
            {result.breakdown.deadTimeIntervals.length > 0 ? `${result.breakdown.deadTimeIntervals.length} night(s)` : 'No overnight'}
          </span>
        </div>
      </div>

      {/* Action buttons: Copy Result & Save */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleCopyReport}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Report Copied!' : 'Copy Club Report'}</span>
        </button>

        {onSaveRace && (
          <button
            onClick={onSaveRace}
            disabled={isSaved}
            className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer ${
              isSaved
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
