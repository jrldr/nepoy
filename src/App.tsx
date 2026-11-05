/**
 * Pigeon Speed Calculator & Tracker
 * Professional pigeon racing speed calculator with live MPM tracking, dead time rule,
 * astronomical sunrise/sunset calculations, crow flight map, and target arrival times.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SunTimesCard } from './components/SunTimesCard';
import { DistanceCard } from './components/DistanceCard';
import { MapPinModal } from './components/MapPinModal';
import { ReleaseCard } from './components/ReleaseCard';
import { ArrivalCard } from './components/ArrivalCard';
import { LiveSpeedCard } from './components/LiveSpeedCard';
import { SpeedResultCard } from './components/SpeedResultCard';
import { TargetArrivalTable } from './components/TargetArrivalTable';
import { RaceHistoryModal, SavedRace } from './components/RaceHistoryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  DEFAULT_COORDINATES,
  calculateSolarTimes,
  LocationCoordinates,
} from './utils/solar';
import { safeStorage } from './utils/storage';
import { getCurrentGpsLocation, reverseGeocodeName } from './utils/geo';
import {
  calculatePigeonSpeed,
  generateTargetArrivals,
  calculateHaversineDistanceKm,
  SpeedResult,
  TargetArrivalItem,
} from './utils/pigeonCalc';

// Helper to format Date to YYYY-MM-DD
function toDateInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format Date to HH:mm:ss
function toTimeInputValue(d: Date, withSeconds = false): string {
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  if (withSeconds) {
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${hours}:${minutes}`;
}

// Parse date string and time string into local Date object
function parseDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  const partsDate = dateStr.split('-');
  if (partsDate.length !== 3) return null;
  const partsTime = timeStr.split(':');
  if (partsTime.length < 2) return null;

  const year = parseInt(partsDate[0], 10);
  const month = parseInt(partsDate[1], 10) - 1;
  const day = parseInt(partsDate[2], 10);
  const hour = parseInt(partsTime[0], 10);
  const minute = parseInt(partsTime[1], 10);
  const second = partsTime.length >= 3 ? parseInt(partsTime[2], 10) : 0;

  const d = new Date(year, month, day, hour, minute, second);
  return isNaN(d.getTime()) ? null : d;
}

interface SavedActiveState {
  distanceKm: number;
  pointAName: string;
  pointBName: string;
  pointACoords: { lat: number; lng: number } | null;
  pointBCoords: { lat: number; lng: number } | null;
  location: LocationCoordinates;
  isAutoLocal: boolean;
  isPointBUserLocation: boolean;
  releaseDateStr: string;
  releaseTimeStr: string;
  arrivalDateStr: string;
  arrivalTimeStr: string;
  customOverride?: { sunriseHour?: number; sunsetHour?: number };
}

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = safeStorage.getItem('pigeon_theme');
      if (saved) return saved === 'dark';
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        safeStorage.setItem('pigeon_theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        safeStorage.setItem('pigeon_theme', 'light');
      }
    } catch {
      // safe ignore
    }
  }, [darkMode]);

  // Read saved active state from local storage on load
  const initialActiveState: SavedActiveState | null = useMemo(() => {
    try {
      const raw = safeStorage.getItem('pigeon_active_state');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const today = useMemo(() => new Date(), []);

  // Location & Sun Times State
  const [location, setLocation] = useState<LocationCoordinates>(
    initialActiveState?.location || DEFAULT_COORDINATES
  );
  const [isAutoLocal, setIsAutoLocal] = useState<boolean>(
    initialActiveState?.isAutoLocal ?? false
  );
  const [isLoadingLocal, setIsLoadingLocal] = useState<boolean>(false);
  const [customOverride, setCustomOverride] = useState<{ sunriseHour?: number; sunsetHour?: number } | undefined>(
    initialActiveState?.customOverride
  );

  // Race Parameters & Coordinates State
  const [distanceKm, setDistanceKm] = useState<number>(
    initialActiveState?.distanceKm ?? 350
  );
  const [pointAName, setPointAName] = useState<string>(
    initialActiveState?.pointAName || 'Release Station (Point A)'
  );
  const [pointBName, setPointBName] = useState<string>(
    initialActiveState?.pointBName || 'My Loft (Point B)'
  );
  const [pointACoords, setPointACoords] = useState<{ lat: number; lng: number } | null>(
    initialActiveState?.pointACoords || { lat: 16.9248, lng: 121.7738 }
  );
  const [pointBCoords, setPointBCoords] = useState<{ lat: number; lng: number } | null>(
    initialActiveState?.pointBCoords || { lat: 14.5995, lng: 120.9842 }
  );

  // GPS Loft Location State
  const [isLocatingPointB, setIsLocatingPointB] = useState<boolean>(false);
  const [isPointBUserLocation, setIsPointBUserLocation] = useState<boolean>(
    initialActiveState?.isPointBUserLocation ?? false
  );

  // Date and Time inputs
  const [releaseDateStr, setReleaseDateStr] = useState<string>(
    initialActiveState?.releaseDateStr || toDateInputValue(today)
  );
  const [releaseTimeStr, setReleaseTimeStr] = useState<string>(
    initialActiveState?.releaseTimeStr || '06:00'
  );

  const [arrivalDateStr, setArrivalDateStr] = useState<string>(
    initialActiveState?.arrivalDateStr || ''
  );
  const [arrivalTimeStr, setArrivalTimeStr] = useState<string>(
    initialActiveState?.arrivalTimeStr || ''
  );

  // Modals
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Saved Races History
  const [savedRaces, setSavedRaces] = useState<SavedRace[]>(() => {
    try {
      const stored = safeStorage.getItem('pigeon_saved_races');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Automatically save current user data/state to localStorage whenever inputs change
  useEffect(() => {
    try {
      const stateToSave: SavedActiveState = {
        distanceKm,
        pointAName,
        pointBName,
        pointACoords,
        pointBCoords,
        location,
        isAutoLocal,
        isPointBUserLocation,
        releaseDateStr,
        releaseTimeStr,
        arrivalDateStr,
        arrivalTimeStr,
        customOverride,
      };
      safeStorage.setItem('pigeon_active_state', JSON.stringify(stateToSave));
    } catch {
      // safe ignore
    }
  }, [
    distanceKm,
    pointAName,
    pointBName,
    pointACoords,
    pointBCoords,
    location,
    isAutoLocal,
    isPointBUserLocation,
    releaseDateStr,
    releaseTimeStr,
    arrivalDateStr,
    arrivalTimeStr,
    customOverride,
  ]);

  // Calculate Sun Times for the selected release date (or today)
  const solarTimes = useMemo(() => {
    const targetDate = releaseDateStr ? new Date(releaseDateStr) : new Date();
    const computed = calculateSolarTimes(targetDate, location.lat, location.lng);

    if (customOverride?.sunriseHour !== undefined) {
      const sr = new Date(computed.sunrise);
      const h = Math.floor(customOverride.sunriseHour);
      const m = Math.round((customOverride.sunriseHour - h) * 60);
      sr.setHours(h, m, 0, 0);
      computed.sunrise = sr;
    }

    if (customOverride?.sunsetHour !== undefined) {
      const ss = new Date(computed.sunset);
      const h = Math.floor(customOverride.sunsetHour);
      const m = Math.round((customOverride.sunsetHour - h) * 60);
      ss.setHours(h, m, 0, 0);
      computed.sunset = ss;
    }

    return computed;
  }, [releaseDateStr, location, customOverride]);

  // Check if currently dead time (night pause)
  const isDeadTimeNow = useMemo(() => {
    const now = new Date();
    const todaySolar = calculateSolarTimes(now, location.lat, location.lng);
    return now.getTime() >= todaySolar.sunset.getTime() || now.getTime() < todaySolar.sunrise.getTime();
  }, [location]);

  // Parse release and arrival Date objects
  const releaseDateObj = useMemo(
    () => parseDateTime(releaseDateStr, releaseTimeStr),
    [releaseDateStr, releaseTimeStr]
  );

  const hasArrivalData = Boolean(arrivalDateStr && arrivalTimeStr);

  const arrivalDateObj = useMemo(
    () => (hasArrivalData ? parseDateTime(arrivalDateStr, arrivalTimeStr) : null),
    [hasArrivalData, arrivalDateStr, arrivalTimeStr]
  );

  // Official Speed Result (when arrival date & time are entered)
  const officialSpeedResult: SpeedResult | null = useMemo(() => {
    if (!releaseDateObj || !arrivalDateObj || distanceKm <= 0) return null;
    return calculatePigeonSpeed(
      distanceKm,
      releaseDateObj,
      arrivalDateObj,
      location.lat,
      location.lng,
      customOverride
    );
  }, [distanceKm, releaseDateObj, arrivalDateObj, location, customOverride]);

  // Target Arrival Table (1400 down to 600 mpm in 100 mpm steps)
  const targetArrivals: TargetArrivalItem[] = useMemo(() => {
    if (!releaseDateObj || distanceKm <= 0) return [];
    return generateTargetArrivals(
      distanceKm,
      releaseDateObj,
      location.lat,
      location.lng,
      customOverride
    );
  }, [distanceKm, releaseDateObj, location, customOverride]);

  // Get User's Current Location as Point B (Loft) with robust fallbacks
  const handleGetLocationAsPointB = async () => {
    setIsLocatingPointB(true);
    try {
      const { lat, lng } = await getCurrentGpsLocation();
      const place = await reverseGeocodeName(lat, lng, 'Loft');
      const loftName = `${place} Loft`;

      setPointBCoords({ lat, lng });
      setPointBName(loftName);
      setIsPointBUserLocation(true);

      // Update solar times location to user's exact loft position
      setLocation({
        name: `${loftName} (Sun)`,
        lat,
        lng,
      });
      setIsAutoLocal(true);

      // Recalculate crow flight distance if Point A exists
      if (pointACoords) {
        const res = calculateHaversineDistanceKm(
          pointACoords.lat,
          pointACoords.lng,
          lat,
          lng
        );
        setDistanceKm(res.distanceKm);
      }
    } catch (err) {
      alert('Could not retrieve GPS coordinates. Please check location permissions.');
    } finally {
      setIsLocatingPointB(false);
    }
  };

  // Auto-Local Geolocation for general sun times with robust fallbacks
  const handleAutoLocal = async () => {
    setIsLoadingLocal(true);
    try {
      const { lat, lng } = await getCurrentGpsLocation();
      const placeName = await reverseGeocodeName(lat, lng, 'Local');
      setLocation({
        name: placeName,
        lat,
        lng,
      });
      setIsAutoLocal(true);
    } catch {
      alert('Could not retrieve GPS coordinates. Please check location permissions.');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleResetLocation = () => {
    setLocation(DEFAULT_COORDINATES);
    setIsAutoLocal(false);
  };

  // Reset all calculator inputs & clear saved active state
  const handleResetAll = () => {
    const now = new Date();
    setDistanceKm(350);
    setPointAName('Release Station (Point A)');
    setPointBName('My Loft (Point B)');
    setIsPointBUserLocation(false);
    setPointACoords({ lat: 16.9248, lng: 121.7738 });
    setPointBCoords({ lat: 14.5995, lng: 120.9842 });
    setReleaseDateStr(toDateInputValue(now));
    setReleaseTimeStr('06:00');
    setArrivalDateStr('');
    setArrivalTimeStr('');
    setLocation(DEFAULT_COORDINATES);
    setIsAutoLocal(false);
    setCustomOverride(undefined);
    safeStorage.removeItem('pigeon_active_state');
  };

  // Quick action: Set release to right now
  const handleSetReleaseNow = () => {
    const now = new Date();
    setReleaseDateStr(toDateInputValue(now));
    setReleaseTimeStr(toTimeInputValue(now, true));
  };

  // Quick action: Clock arrival right now
  const handleClockArrivalNow = () => {
    const now = new Date();
    setArrivalDateStr(toDateInputValue(now));
    setArrivalTimeStr(toTimeInputValue(now, true));
  };

  // Clear arrival
  const handleClearArrival = () => {
    setArrivalDateStr('');
    setArrivalTimeStr('');
  };

  // Save current race result to saved history
  const handleSaveRace = () => {
    if (!officialSpeedResult || !releaseDateObj || !arrivalDateObj) return;

    const newRace: SavedRace = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      title: `${distanceKm} KM Race (${pointAName || 'Station'} to ${pointBName || 'Loft'})`,
      distanceKm,
      pointAName,
      pointBName,
      releaseDateStr,
      releaseTimeStr,
      arrivalDateStr,
      arrivalTimeStr,
      mpm: officialSpeedResult.mpm,
      netFlyingTime: officialSpeedResult.breakdown.formattedFlyingTime,
    };

    const updated = [newRace, ...savedRaces];
    setSavedRaces(updated);
    safeStorage.setItem('pigeon_saved_races', JSON.stringify(updated));
  };

  const handleDeleteRace = (id: string) => {
    const updated = savedRaces.filter((r) => r.id !== id);
    setSavedRaces(updated);
    safeStorage.setItem('pigeon_saved_races', JSON.stringify(updated));
  };

  const handleClearAllSaved = () => {
    if (confirm('Clear all saved race calculations?')) {
      setSavedRaces([]);
      safeStorage.removeItem('pigeon_saved_races');
    }
  };

  const handleLoadRace = (race: SavedRace) => {
    setDistanceKm(race.distanceKm);
    if (race.pointAName) setPointAName(race.pointAName);
    if (race.pointBName) setPointBName(race.pointBName);
    setReleaseDateStr(race.releaseDateStr);
    setReleaseTimeStr(race.releaseTimeStr);
    if (race.arrivalDateStr) setArrivalDateStr(race.arrivalDateStr);
    if (race.arrivalTimeStr) setArrivalTimeStr(race.arrivalTimeStr);
  };

  // Apply distance from map modal
  const handleApplyMapDistance = (
    km: number,
    aName?: string,
    bName?: string,
    aCoords?: { lat: number; lng: number },
    bCoords?: { lat: number; lng: number }
  ) => {
    setDistanceKm(km);
    if (aName) setPointAName(aName);
    if (bName) setPointBName(bName);
    if (aCoords) setPointACoords(aCoords);
    if (bCoords) {
      setPointBCoords(bCoords);
      // Also sync solar calculation to loft if Point B was set on map
      setLocation((prev) => ({
        name: bName || prev.name,
        lat: bCoords.lat,
        lng: bCoords.lng,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-12 selection:bg-sky-500 selection:text-white">
      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Header with big current time, theme toggle, and PWA install */}
      <Header
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        locationName={location.name}
        onReset={handleResetAll}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedRaces.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Sunrise & Sunset Card */}
        <SunTimesCard
          location={location}
          sunrise={solarTimes.sunrise}
          sunset={solarTimes.sunset}
          isAutoLocal={isAutoLocal}
          isLoadingLocal={isLoadingLocal}
          onAutoLocalClick={handleAutoLocal}
          onResetLocation={handleResetLocation}
          isDeadTimeActive={isDeadTimeNow}
          customOverride={customOverride}
          onUpdateOverride={setCustomOverride}
        />

        {/* Distance Card with Pin Map and Direct Get My Location for Point B */}
        <DistanceCard
          distanceKm={distanceKm}
          onChangeDistanceKm={setDistanceKm}
          onOpenMap={() => setIsMapOpen(true)}
          pointAName={pointAName}
          pointBName={pointBName}
          onGetLocationAsPointB={handleGetLocationAsPointB}
          isLocatingPointB={isLocatingPointB}
          isPointBUserLocation={isPointBUserLocation}
        />

        {/* Liberation / Release Date & Time Card */}
        <ReleaseCard
          releaseDateStr={releaseDateStr}
          releaseTimeStr={releaseTimeStr}
          onChangeDate={setReleaseDateStr}
          onChangeTime={setReleaseTimeStr}
          onSetNow={handleSetReleaseNow}
        />

        {/* Arrival / Clocking Date & Time Card (Optional) */}
        <ArrivalCard
          arrivalDateStr={arrivalDateStr}
          arrivalTimeStr={arrivalTimeStr}
          onChangeDate={setArrivalDateStr}
          onChangeTime={setArrivalTimeStr}
          onSetNow={handleClockArrivalNow}
          onClear={handleClearArrival}
          hasArrivalData={hasArrivalData}
        />

        {/* Dynamic Display: Official Speed Result OR Live Speed Tracker */}
        {hasArrivalData && officialSpeedResult ? (
          <SpeedResultCard
            result={officialSpeedResult}
            releaseDate={releaseDateObj!}
            arrivalDate={arrivalDateObj!}
            pointAName={pointAName}
            pointBName={pointBName}
            onSaveRace={handleSaveRace}
            isSaved={savedRaces.some(
              (r) =>
                r.distanceKm === distanceKm &&
                r.releaseDateStr === releaseDateStr &&
                r.releaseTimeStr === releaseTimeStr &&
                r.arrivalDateStr === arrivalDateStr &&
                r.arrivalTimeStr === arrivalTimeStr
            )}
          />
        ) : (
          <LiveSpeedCard
            distanceKm={distanceKm}
            releaseDate={releaseDateObj}
            lat={location.lat}
            lng={location.lng}
            customOverride={customOverride}
            sunrise={solarTimes.sunrise}
            sunset={solarTimes.sunset}
          />
        )}

        {/* Target Arrival Table (1400 - 600 mpm with Dead Time rule) */}
        <TargetArrivalTable
          targets={targetArrivals}
          achievedMpm={officialSpeedResult ? officialSpeedResult.mpm : undefined}
        />
      </main>

      {/* Map Pin Modal (Leaflet interactive crow flight calculation) */}
      <MapPinModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onApplyDistance={handleApplyMapDistance}
        initialDistanceKm={distanceKm}
        initialPointA={
          pointACoords
            ? { name: pointAName, lat: pointACoords.lat, lng: pointACoords.lng }
            : undefined
        }
        initialPointB={
          pointBCoords
            ? { name: pointBName, lat: pointBCoords.lat, lng: pointBCoords.lng }
            : undefined
        }
      />

      {/* Race History Modal */}
      <RaceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedRaces={savedRaces}
        onLoadRace={handleLoadRace}
        onDeleteRace={handleDeleteRace}
        onClearAll={handleClearAllSaved}
      />
    </div>
  );
}
