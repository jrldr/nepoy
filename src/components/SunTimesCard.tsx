import React, { useState } from 'react';
import { Sunrise, Sunset, MapPin, Navigation, Info, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import { formatTime12h, LocationCoordinates } from '../utils/solar';

interface SunTimesCardProps {
  location: LocationCoordinates;
  sunrise: Date;
  sunset: Date;
  isAutoLocal: boolean;
  isLoadingLocal: boolean;
  onAutoLocalClick: () => void;
  onResetLocation: () => void;
  isDeadTimeActive: boolean;
  customOverride?: { sunriseHour?: number; sunsetHour?: number };
  onUpdateOverride?: (override?: { sunriseHour?: number; sunsetHour?: number }) => void;
}

export const SunTimesCard: React.FC<SunTimesCardProps> = ({
  location,
  sunrise,
  sunset,
  isAutoLocal,
  isLoadingLocal,
  onAutoLocalClick,
  onResetLocation,
  isDeadTimeActive,
  customOverride,
  onUpdateOverride,
}) => {
  const [showRuleInfo, setShowRuleInfo] = useState(false);
  const [showCustomConfig, setShowCustomConfig] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm">
      {/* Title & Location toggle */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
            {location.name}
          </span>
          {isAutoLocal ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              GPS
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Station
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onAutoLocalClick}
            disabled={isLoadingLocal}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              isAutoLocal
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Auto-detect local coordinates & solar time"
          >
            <Navigation className={`w-3 h-3 ${isLoadingLocal ? 'animate-spin' : ''}`} />
            <span>{isLoadingLocal ? 'Locating...' : 'Auto-Local'}</span>
          </button>

          {isAutoLocal && (
            <button
              onClick={onResetLocation}
              className="px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              title="Reset location"
            >
              Reset
            </button>
          )}

          <button
            onClick={() => setShowRuleInfo(!showRuleInfo)}
            className="p-1 rounded-lg text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition cursor-pointer"
            title="Pigeon Racing Dead Time Rule Info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sunrise & Sunset Display */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sunrise */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sunrise className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Sunrise
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatTime12h(sunrise)}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">Clock Starts / Resumes</div>
          </div>
        </div>

        {/* Sunset */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sunset className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              Sunset
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatTime12h(sunset)}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">Clock Pauses (Dead Time)</div>
          </div>
        </div>
      </div>

      {/* Dead Time Status Strip */}
      <div className="mt-2.5 pt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {isDeadTimeActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Dead Time Active (Night Pause)
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Daylight Flight Window Active
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => setShowCustomConfig(!showCustomConfig)}
          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 flex items-center gap-1 cursor-pointer"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>{customOverride ? 'Custom Hours Set' : 'Rules Config'}</span>
        </button>
      </div>

      {/* Custom Rules Override Drawer */}
      {showCustomConfig && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Race Club Official Hours Override
            </span>
            {customOverride && (
              <button
                onClick={() => onUpdateOverride?.(undefined)}
                className="text-[10px] text-rose-500 hover:underline"
              >
                Reset to Astronomical
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Some racing clubs use fixed dead time boundaries (e.g. 5:30 AM sunrise, 6:00 PM sunset) instead of solar calculation.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] font-medium text-slate-500">Official Sunrise (Hour 24h)</label>
              <input
                type="number"
                step="0.25"
                min="4"
                max="8"
                defaultValue={customOverride?.sunriseHour ?? 5.75}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    onUpdateOverride?.({ ...customOverride, sunriseHour: val });
                  }
                }}
                className="w-full mt-0.5 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
              <span className="text-[9px] text-slate-400">e.g. 5.75 = 5:45 AM</span>
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500">Official Sunset (Hour 24h)</label>
              <input
                type="number"
                step="0.25"
                min="16"
                max="20"
                defaultValue={customOverride?.sunsetHour ?? 18.0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    onUpdateOverride?.({ ...customOverride, sunsetHour: val });
                  }
                }}
                className="w-full mt-0.5 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
              <span className="text-[9px] text-slate-400">e.g. 18.0 = 6:00 PM</span>
            </div>
          </div>
        </div>
      )}

      {/* Dead Time Rule Explainer Box */}
      {showRuleInfo && (
        <div className="mt-3 p-3 rounded-xl bg-sky-50 dark:bg-slate-800/90 border border-sky-100 dark:border-slate-700 text-xs space-y-1.5 text-slate-700 dark:text-slate-300 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-sky-800 dark:text-sky-400 text-xs">
            <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Pigeon Racing Dead Time Rule Explained</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            In long distance pigeon races (especially when flights drop below 600 mpm or span overnight), homing pigeons naturally roost at dusk.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <li><strong>Clock Pauses at Sunset:</strong> Flight time accumulation freezes at the official sunset.</li>
            <li><strong>Clock Resumes at Sunrise:</strong> Flight time counting continues at next morning's official sunrise.</li>
            <li><strong>Night Hours Deducted:</strong> The dead time hours in between are deducted from total elapsed time so fanciers are judged on genuine daytime wing speed.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
