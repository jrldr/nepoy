import React, { useState, useEffect } from 'react';
import { Map, Route, Navigation, Check } from 'lucide-react';

interface DistanceCardProps {
  distanceKm: number;
  onChangeDistanceKm: (val: number) => void;
  onOpenMap: () => void;
  pointAName?: string;
  pointBName?: string;
  onGetLocationAsPointB: () => void;
  isLocatingPointB: boolean;
  isPointBUserLocation?: boolean;
}

export const DistanceCard: React.FC<DistanceCardProps> = ({
  distanceKm,
  onChangeDistanceKm,
  onOpenMap,
  pointAName,
  pointBName,
  onGetLocationAsPointB,
  isLocatingPointB,
  isPointBUserLocation,
}) => {
  const [unit, setUnit] = useState<'km' | 'm'>('km');
  const [rawInput, setRawInput] = useState<string>(distanceKm > 0 ? distanceKm.toString() : '');

  // Keep raw input synced when distanceKm changes externally (e.g. from Map, GPS, or Reset)
  useEffect(() => {
    if (distanceKm > 0) {
      setRawInput(unit === 'km' ? distanceKm.toString() : (distanceKm * 1000).toString());
    } else {
      setRawInput('');
    }
  }, [distanceKm, unit]);

  const handleInputChange = (valStr: string) => {
    setRawInput(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num >= 0) {
      if (unit === 'km') {
        onChangeDistanceKm(num);
      } else {
        onChangeDistanceKm(num / 1000);
      }
    } else if (valStr === '') {
      onChangeDistanceKm(0);
    }
  };

  const toggleUnit = (newUnit: 'km' | 'm') => {
    if (newUnit === unit) return;
    setUnit(newUnit);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Route className="w-4 h-4 text-sky-500" />
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Race Distance
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
          <button
            onClick={() => toggleUnit('km')}
            className={`px-2 py-0.5 rounded cursor-pointer transition ${
              unit === 'km'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            KM
          </button>
          <button
            onClick={() => toggleUnit('m')}
            className={`px-2 py-0.5 rounded cursor-pointer transition ${
              unit === 'm'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Meters
          </button>
        </div>
      </div>

      {/* Input row + Map Pin Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder={unit === 'km' ? 'e.g. 350.250' : 'e.g. 350250'}
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-lg font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase pointer-events-none">
            {unit}
          </div>
        </div>

        <button
          onClick={onOpenMap}
          className="px-4 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/80 flex items-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
          title="Open interactive map to pin Point A & Point B"
        >
          <Map className="w-4 h-4 text-sky-500" />
          <span>Pin Map</span>
        </button>
      </div>

      {/* Point B Loft Location Control Bar */}
      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            B
          </span>
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block leading-tight">Loft / Home:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {pointBName || 'My Loft'}
            </span>
          </div>
        </div>

        <button
          onClick={onGetLocationAsPointB}
          disabled={isLocatingPointB}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0 shadow-xs ${
            isPointBUserLocation
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
          title="Detect and set my current GPS coordinates as Point B Loft"
        >
          {isPointBUserLocation ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Loft Set via GPS</span>
            </>
          ) : (
            <>
              <Navigation className={`w-3.5 h-3.5 ${isLocatingPointB ? 'animate-spin' : ''}`} />
              <span>{isLocatingPointB ? 'Getting GPS...' : 'Get My Location (Point B)'}</span>
            </>
          )}
        </button>
      </div>

      {/* Station route details if pinned */}
      {pointAName && (
        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-700 dark:text-sky-300 flex items-center justify-between">
          <span className="truncate">
            <strong>Route:</strong> {pointAName} → {pointBName || 'Loft'}
          </span>
          <span className="text-[10px] font-mono shrink-0 ml-1 font-bold">Crow Flight</span>
        </div>
      )}
    </div>
  );
};
