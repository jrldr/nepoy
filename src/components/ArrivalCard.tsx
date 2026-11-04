import React from 'react';
import { Flag, Calendar, Clock, Sparkles, XCircle } from 'lucide-react';

interface ArrivalCardProps {
  arrivalDateStr: string;   // YYYY-MM-DD
  arrivalTimeStr: string;   // HH:mm:ss or HH:mm
  onChangeDate: (d: string) => void;
  onChangeTime: (t: string) => void;
  onSetNow: () => void;
  onClear: () => void;
  hasArrivalData: boolean;
}

export const ArrivalCard: React.FC<ArrivalCardProps> = ({
  arrivalDateStr,
  arrivalTimeStr,
  onChangeDate,
  onChangeTime,
  onSetNow,
  onClear,
  hasArrivalData,
}) => {
  return (
    <div className={`rounded-2xl p-4 border transition ${
      hasArrivalData
        ? 'bg-white dark:bg-slate-900 border-sky-300 dark:border-sky-800 shadow-sm'
        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 shadow-xs'
    }`}>
      <div className="flex items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Flag className={`w-4 h-4 ${hasArrivalData ? 'text-emerald-500' : 'text-slate-400'}`} />
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Clocking / Arrival Time
            </h2>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
              (Optional — leave blank for Live Speed)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onSetNow}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition cursor-pointer"
            title="Set arrival to current moment"
          >
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Clock Now</span>
          </button>

          {hasArrivalData && (
            <button
              onClick={onClear}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              title="Clear arrival time (re-enable Live Speed)"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Date Input */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-emerald-500" />
            Arrival Date
          </label>
          <input
            type="date"
            value={arrivalDateStr}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Time Input */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-emerald-500" />
            Arrival Time
          </label>
          <input
            type="time"
            step="1"
            value={arrivalTimeStr}
            onChange={(e) => onChangeTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
