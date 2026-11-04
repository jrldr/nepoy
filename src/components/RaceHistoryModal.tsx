import React from 'react';
import { X, Trash2, ArrowUpRight, Calendar, Route, Award, BookmarkCheck } from 'lucide-react';

export interface SavedRace {
  id: string;
  timestamp: number;
  title: string;
  distanceKm: number;
  pointAName?: string;
  pointBName?: string;
  releaseDateStr: string;
  releaseTimeStr: string;
  arrivalDateStr?: string;
  arrivalTimeStr?: string;
  mpm?: number;
  netFlyingTime?: string;
}

interface RaceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedRaces: SavedRace[];
  onLoadRace: (race: SavedRace) => void;
  onDeleteRace: (id: string) => void;
  onClearAll: () => void;
}

export const RaceHistoryModal: React.FC<RaceHistoryModalProps> = ({
  isOpen,
  onClose,
  savedRaces,
  onLoadRace,
  onDeleteRace,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Saved Race Calculations
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {savedRaces.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of saved races */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedRaces.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <BookmarkCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No saved calculations yet</p>
              <p className="text-[11px] mt-1 text-slate-400">
                Clock an arrival and tap "Save" to keep records here
              </p>
            </div>
          ) : (
            savedRaces.map((race) => (
              <div
                key={race.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-sky-700 transition space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {race.title || `${race.distanceKm} KM Race`}
                    </h3>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(race.timestamp).toLocaleDateString()}</span>
                      {race.pointAName && race.pointBName && (
                        <span>• {race.pointAName} → {race.pointBName}</span>
                      )}
                    </div>
                  </div>

                  {race.mpm && (
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {race.mpm.toFixed(2)}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">MPM</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{race.distanceKm} km</span>
                    {race.netFlyingTime && (
                      <span>• Flight: {race.netFlyingTime}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onLoadRace(race);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 hover:bg-sky-100 font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteRace(race.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Delete saved race"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedRaces.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
            <button
              onClick={onClearAll}
              className="text-[11px] text-rose-500 hover:underline cursor-pointer"
            >
              Clear All Saved
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
