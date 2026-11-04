import React from 'react';
import { Send, Calendar, Clock, Sparkles } from 'lucide-react';

interface ReleaseCardProps {
  releaseDateStr: string;   // YYYY-MM-DD
  releaseTimeStr: string;   // HH:mm (24h format for input)
  onChangeDate: (d: string) => void;
  onChangeTime: (t: string) => void;
  onSetNow: () => void;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({
  releaseDateStr,
  releaseTimeStr,
  onChangeDate,
  onChangeTime,
  onSetNow,
}) => {
  const commonTossTimes = ['05:30', '06:00', '06:15', '06:30', '07:00'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Send className="w-4 h-4 text-sky-500" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Liberation / Release Time
          </h2>
        </div>

        <button
          onClick={onSetNow}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Release Now</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Date Input */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-sky-500" />
            Release Date
          </label>
          <input
            type="date"
            value={releaseDateStr}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Time Input */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-sky-500" />
            Release Time
          </label>
          <input
            type="time"
            step="1"
            value={releaseTimeStr}
            onChange={(e) => onChangeTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Quick Common Toss Presets */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 dark:text-slate-500 text-[10px]">Common Toss:</span>
        <div className="flex items-center gap-1">
          {commonTossTimes.map((t) => (
            <button
              key={t}
              onClick={() => onChangeTime(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                releaseTimeStr.startsWith(t)
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
