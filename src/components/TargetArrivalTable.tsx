import React from 'react';
import { Target, Clock, Moon, ChevronRight, CheckCircle2 } from 'lucide-react';
import { TargetArrivalItem } from '../utils/pigeonCalc';

interface TargetArrivalTableProps {
  targets: TargetArrivalItem[];
  achievedMpm?: number;
  currentLiveMpm?: number;
}

export const TargetArrivalTable: React.FC<TargetArrivalTableProps> = ({
  targets,
  achievedMpm,
  currentLiveMpm,
}) => {
  if (targets.length === 0) {
    return null;
  }

  // Find which bracket achievedMpm falls into
  const getBracketStatus = (itemMpm: number) => {
    if (achievedMpm !== undefined && achievedMpm > 0) {
      if (achievedMpm >= itemMpm && (achievedMpm < itemMpm + 100 || itemMpm === 1400)) {
        return 'achieved';
      }
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-sky-500" />
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Target Arrival Table
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              1,400 to 600 MPM (Dead Time Rule factored in)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          100 MPM steps
        </span>
      </div>

      {/* Table listing */}
      <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
        {targets.map((item) => {
          const isAchieved = getBracketStatus(item.mpm) === 'achieved';
          const isLiveAhead = currentLiveMpm !== undefined && currentLiveMpm >= item.mpm;

          return (
            <div
              key={item.mpm}
              className={`py-2.5 px-2 rounded-xl transition flex items-center justify-between ${
                isAchieved
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Left: Speed MPM badge */}
              <div className="flex items-center gap-2">
                <div className={`w-14 text-center py-1 rounded-lg text-xs font-mono font-extrabold ${
                  item.mpm >= 1200
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                    : item.mpm >= 1000
                    ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400'
                    : item.mpm >= 800
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400'
                }`}>
                  {item.mpm}
                </div>

                <div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Req: {item.requiredFlyingTimeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Right: Target Arrival Time & Day badge */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {item.isOvernight && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      <Moon className="w-2.5 h-2.5" />
                      {item.dayLabel}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {item.targetArrivalDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  {item.targetArrivalDate.toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {isAchieved && (
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      • Achieved Bracket
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dead time notice under table */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
        <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
        <span>
          <strong>Dead Time Notice:</strong> Any speed requiring flight time past official sunset carries over to next day sunrise. Speeds marked with <Moon className="w-2.5 h-2.5 inline text-indigo-400" /> will clock on Day 2 morning.
        </span>
      </div>
    </div>
  );
};
