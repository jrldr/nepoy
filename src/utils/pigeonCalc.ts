/**
 * Pigeon Speed Calculation and Dead Time Rule Engine
 */

import { calculateSolarTimes } from './solar';

export interface DeadTimeInterval {
  sunset: Date;
  sunrise: Date;
  durationMinutes: number;
}

export interface FlightTimeBreakdown {
  totalElapsedMs: number;
  deadTimeMs: number;
  netFlyingMs: number;
  netFlyingMinutes: number;
  formattedFlyingTime: string;
  formattedDeadTime: string;
  deadTimeIntervals: DeadTimeInterval[];
  isCurrentlyDeadTime: boolean;
  daysSpan: number;
}

export interface SpeedResult {
  mpm: number;               // Meter per minute
  kmh: number;               // Kilometer per hour
  mph: number;               // Miles per hour
  distanceMeters: number;
  distanceKm: number;
  breakdown: FlightTimeBreakdown;
  performanceRating: 'Super Fast' | 'Fast' | 'Normal' | 'Moderate' | 'Strenuous / Tough' | 'Slow';
  ratingColor: string;
}

export interface TargetArrivalItem {
  mpm: number;
  requiredFlyingMinutes: number;
  requiredFlyingTimeFormatted: string;
  targetArrivalDate: Date;
  targetArrivalFormatted: string;
  dayLabel: string;
  isOvernight: boolean;
  isPassed: boolean;
}

/**
 * Calculates net flying time taking into account the Dead Time Rule.
 * Between sunset and next day's sunrise, the flight clock is stopped.
 * 
 * @param releaseDate - When pigeon was liberated
 * @param targetDate - Arrival time or current time
 * @param lat - Latitude for sunset/sunrise
 * @param lng - Longitude for sunset/sunrise
 * @param customSunsetHour - Optional manual override hour (e.g. 18.0)
 * @param customSunriseHour - Optional manual override hour (e.g. 6.0)
 */
export function calculateFlightBreakdown(
  releaseDate: Date,
  targetDate: Date,
  lat: number = 14.5995,
  lng: number = 120.9842,
  customOverride?: { sunriseHour?: number; sunsetHour?: number }
): FlightTimeBreakdown {
  const releaseMs = releaseDate.getTime();
  const targetMs = targetDate.getTime();

  if (targetMs <= releaseMs) {
    return {
      totalElapsedMs: 0,
      deadTimeMs: 0,
      netFlyingMs: 0,
      netFlyingMinutes: 0,
      formattedFlyingTime: '0h 00m 00s',
      formattedDeadTime: '0h 00m',
      deadTimeIntervals: [],
      isCurrentlyDeadTime: false,
      daysSpan: 1,
    };
  }

  const totalElapsedMs = targetMs - releaseMs;
  let deadTimeMs = 0;
  const deadTimeIntervals: DeadTimeInterval[] = [];

  // Helper to get solar times for a specific calendar day
  const getDaySolars = (d: Date) => {
    const calculated = calculateSolarTimes(d, lat, lng);
    if (customOverride?.sunriseHour !== undefined) {
      const sr = new Date(d);
      const h = Math.floor(customOverride.sunriseHour);
      const m = Math.round((customOverride.sunriseHour - h) * 60);
      sr.setHours(h, m, 0, 0);
      calculated.sunrise = sr;
    }
    if (customOverride?.sunsetHour !== undefined) {
      const ss = new Date(d);
      const h = Math.floor(customOverride.sunsetHour);
      const m = Math.round((customOverride.sunsetHour - h) * 60);
      ss.setHours(h, m, 0, 0);
      calculated.sunset = ss;
    }
    return calculated;
  };

  // We iterate through each day from the start of releaseDate to the day of targetDate (+1 for next sunrise)
  const cursorDay = new Date(releaseDate);
  cursorDay.setHours(0, 0, 0, 0);

  const endDay = new Date(targetDate);
  endDay.setHours(23, 59, 59, 999);

  let isCurrentlyDeadTime = false;

  while (cursorDay.getTime() <= endDay.getTime()) {
    const todaySolars = getDaySolars(cursorDay);
    const sunset = todaySolars.sunset;

    // Next day for sunrise
    const nextDay = new Date(cursorDay);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDaySolars = getDaySolars(nextDay);
    const nextSunrise = nextDaySolars.sunrise;

    const deadStartMs = sunset.getTime();
    const deadEndMs = nextSunrise.getTime();

    // Check if current target time falls inside this dead time
    if (targetMs >= deadStartMs && targetMs < deadEndMs) {
      isCurrentlyDeadTime = true;
    }

    // Overlap between [releaseMs, targetMs] and [deadStartMs, deadEndMs]
    const overlapStart = Math.max(releaseMs, deadStartMs);
    const overlapEnd = Math.min(targetMs, deadEndMs);

    if (overlapEnd > overlapStart) {
      const intervalMs = overlapEnd - overlapStart;
      deadTimeMs += intervalMs;
      deadTimeIntervals.push({
        sunset: new Date(overlapStart),
        sunrise: new Date(overlapEnd),
        durationMinutes: Math.round(intervalMs / 60000),
      });
    }

    // Advance to next day
    cursorDay.setDate(cursorDay.getDate() + 1);
  }

  // Also check if release was made BEFORE sunrise on Day 1
  const releaseDaySolars = getDaySolars(releaseDate);
  if (releaseMs < releaseDaySolars.sunrise.getTime()) {
    const preDawnOverlapEnd = Math.min(targetMs, releaseDaySolars.sunrise.getTime());
    if (preDawnOverlapEnd > releaseMs) {
      const preDawnMs = preDawnOverlapEnd - releaseMs;
      deadTimeMs += preDawnMs;
    }
  }

  const netFlyingMs = Math.max(0, totalElapsedMs - deadTimeMs);
  const netFlyingMinutes = netFlyingMs / 60000;

  const daysSpan = Math.max(
    1,
    Math.floor((targetDate.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return {
    totalElapsedMs,
    deadTimeMs,
    netFlyingMs,
    netFlyingMinutes,
    formattedFlyingTime: formatDuration(netFlyingMs),
    formattedDeadTime: formatDuration(deadTimeMs),
    deadTimeIntervals,
    isCurrentlyDeadTime,
    daysSpan,
  };
}

/**
 * Format milliseconds into HH:MM:SS or "Xh Ym Zs"
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0h 00m 00s';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
}

/**
 * Format minutes into "Xh Ym Zs"
 */
export function formatMinutes(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${hours}h ${pad(mins)}m ${pad(secs)}s`;
}

/**
 * Calculate speed given distance and dates
 */
export function calculatePigeonSpeed(
  distanceKm: number,
  releaseDate: Date,
  arrivalDate: Date,
  lat: number = 14.5995,
  lng: number = 120.9842,
  customOverride?: { sunriseHour?: number; sunsetHour?: number }
): SpeedResult | null {
  if (distanceKm <= 0 || !releaseDate || !arrivalDate) return null;
  if (arrivalDate.getTime() <= releaseDate.getTime()) return null;

  const breakdown = calculateFlightBreakdown(releaseDate, arrivalDate, lat, lng, customOverride);
  if (breakdown.netFlyingMinutes <= 0) return null;

  const distanceMeters = distanceKm * 1000;
  const mpm = distanceMeters / breakdown.netFlyingMinutes;
  const kmh = (mpm * 60) / 1000;
  const mph = kmh * 0.621371;

  let performanceRating: SpeedResult['performanceRating'] = 'Normal';
  let ratingColor = 'text-emerald-500 dark:text-emerald-400';

  if (mpm >= 1300) {
    performanceRating = 'Super Fast';
    ratingColor = 'text-amber-500 dark:text-amber-400';
  } else if (mpm >= 1100) {
    performanceRating = 'Fast';
    ratingColor = 'text-sky-500 dark:text-sky-400';
  } else if (mpm >= 900) {
    performanceRating = 'Normal';
    ratingColor = 'text-emerald-500 dark:text-emerald-400';
  } else if (mpm >= 750) {
    performanceRating = 'Moderate';
    ratingColor = 'text-yellow-600 dark:text-yellow-400';
  } else if (mpm >= 600) {
    performanceRating = 'Strenuous / Tough';
    ratingColor = 'text-orange-500 dark:text-orange-400';
  } else {
    performanceRating = 'Slow';
    ratingColor = 'text-rose-500 dark:text-rose-400';
  }

  return {
    mpm,
    kmh,
    mph,
    distanceMeters,
    distanceKm,
    breakdown,
    performanceRating,
    ratingColor,
  };
}

/**
 * Given a required net flying duration in minutes, determine when the pigeon arrives,
 * carrying over daylight hours across sunset to next sunrise (Dead Time).
 */
export function calculateArrivalDateForFlyingMinutes(
  releaseDate: Date,
  requiredFlyingMinutes: number,
  lat: number = 14.5995,
  lng: number = 120.9842,
  customOverride?: { sunriseHour?: number; sunsetHour?: number }
): { arrivalDate: Date; dayOffset: number } {
  let remainingMinutes = requiredFlyingMinutes;
  let currentMoment = new Date(releaseDate);
  let dayOffset = 1;

  const getDaySolars = (d: Date) => {
    const s = calculateSolarTimes(d, lat, lng);
    if (customOverride?.sunriseHour !== undefined) {
      const sr = new Date(d);
      const h = Math.floor(customOverride.sunriseHour);
      const m = Math.round((customOverride.sunriseHour - h) * 60);
      sr.setHours(h, m, 0, 0);
      s.sunrise = sr;
    }
    if (customOverride?.sunsetHour !== undefined) {
      const ss = new Date(d);
      const h = Math.floor(customOverride.sunsetHour);
      const m = Math.round((customOverride.sunsetHour - h) * 60);
      ss.setHours(h, m, 0, 0);
      s.sunset = ss;
    }
    return s;
  };

  // Check if released before sunrise on Day 1
  const firstDaySolars = getDaySolars(currentMoment);
  if (currentMoment.getTime() < firstDaySolars.sunrise.getTime()) {
    currentMoment = new Date(firstDaySolars.sunrise);
  }

  // Loop through days until all required flying minutes are consumed
  for (let safety = 0; safety < 30; safety++) {
    const solars = getDaySolars(currentMoment);
    const sunset = solars.sunset;

    // Available flying minutes today between currentMoment and sunset
    if (currentMoment.getTime() < sunset.getTime()) {
      const availableTodayMinutes = (sunset.getTime() - currentMoment.getTime()) / 60000;

      if (remainingMinutes <= availableTodayMinutes) {
        // Arrives today before or at sunset!
        const arrivalMs = currentMoment.getTime() + remainingMinutes * 60000;
        return {
          arrivalDate: new Date(arrivalMs),
          dayOffset,
        };
      } else {
        // Needs to fly through night dead time
        remainingMinutes -= availableTodayMinutes;
      }
    }

    // Advance to next day's sunrise
    dayOffset += 1;
    const nextDay = new Date(currentMoment);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextSolars = getDaySolars(nextDay);
    currentMoment = new Date(nextSolars.sunrise);
  }

  return { arrivalDate: currentMoment, dayOffset };
}

/**
 * Generate Target Arrival Table from 1400 mpm down to 600 mpm in 100 mpm increments.
 */
export function generateTargetArrivals(
  distanceKm: number,
  releaseDate: Date,
  lat: number = 14.5995,
  lng: number = 120.9842,
  customOverride?: { sunriseHour?: number; sunsetHour?: number }
): TargetArrivalItem[] {
  if (distanceKm <= 0 || !releaseDate) return [];

  const distanceMeters = distanceKm * 1000;
  const speeds = [1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600];
  const now = new Date();

  return speeds.map((speed) => {
    const requiredFlyingMinutes = distanceMeters / speed;
    const { arrivalDate, dayOffset } = calculateArrivalDateForFlyingMinutes(
      releaseDate,
      requiredFlyingMinutes,
      lat,
      lng,
      customOverride
    );

    const isOvernight = dayOffset > 1;
    const dayLabel = dayOffset === 1 ? 'Day 1' : `Day ${dayOffset}`;

    const formattedTime = arrivalDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const formattedDate = arrivalDate.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      mpm: speed,
      requiredFlyingMinutes,
      requiredFlyingTimeFormatted: formatMinutes(requiredFlyingMinutes),
      targetArrivalDate: arrivalDate,
      targetArrivalFormatted: `${dayLabel} • ${formattedDate} ${formattedTime}`,
      dayLabel,
      isOvernight,
      isPassed: now.getTime() > arrivalDate.getTime(),
    };
  });
}

/**
 * Haversine Great Circle Distance formula (Straight-line / Crow flight distance)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { distanceKm: number; distanceMeters: number; bearingDeg: number; bearingText: string } {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMeters = Math.round(distanceKm * 1000);

  // Bearing / Direction
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const compassPoints = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const bearingIndex = Math.round(brng / 22.5) % 16;

  return {
    distanceKm: parseFloat(distanceKm.toFixed(3)),
    distanceMeters,
    bearingDeg: Math.round(brng),
    bearingText: compassPoints[bearingIndex],
  };
}
