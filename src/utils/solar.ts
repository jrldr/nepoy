/**
 * Solar Calculation Utility (NOAA Solar Calculations)
 * Provides accurate sunrise, sunset, and solar position offline for any location and date.
 */

export interface SolarTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dayLengthMinutes: number;
}

export interface LocationCoordinates {
  name: string;
  lat: number;
  lng: number;
  timezoneOffset?: number; // hours from UTC, e.g. +8 for Manila
}

export const DEFAULT_COORDINATES: LocationCoordinates = {
  name: 'Local Loft Area',
  lat: 14.5995,
  lng: 120.9842,
  timezoneOffset: 8,
};

export const MANILA_COORDINATES = DEFAULT_COORDINATES;

export function getLocalTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  } catch {
    return 'Local';
  }
}

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Convert radians to degrees
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculates sunrise and sunset for a given date, latitude, and longitude.
 * Standard atmospheric refraction of 0.833 degrees (zenith 90.833) is used.
 */
export function calculateSolarTimes(
  date: Date,
  lat: number = MANILA_COORDINATES.lat,
  lng: number = MANILA_COORDINATES.lng
): SolarTimes {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Day of year calculation
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const currentDate = new Date(Date.UTC(year, month, day));
  const dayOfYear = Math.floor((currentDate.getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  // Equation of time in minutes
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination angle in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Zenith angle for sunrise/sunset (90.8333 degrees includes atmospheric refraction)
  const zenithRad = toRad(90.8333);
  const latRad = toRad(lat);

  // Hour angle calculation: cos(ha) = (cos(zenith) - sin(lat)*sin(decl)) / (cos(lat)*cos(decl))
  const cosHa = (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));

  let haRad = 0;
  if (cosHa > 1) {
    // Polar night (sun never rises)
    haRad = 0;
  } else if (cosHa < -1) {
    // Midnight sun (sun never sets)
    haRad = Math.PI;
  } else {
    haRad = Math.acos(cosHa);
  }

  const haDeg = toDeg(haRad);

  // Solar noon in UTC minutes from midnight
  const solarNoonUtcMinutes = 720 - 4 * lng - eqtime;
  // Sunrise and Sunset in UTC minutes
  const sunriseUtcMinutes = solarNoonUtcMinutes - haDeg * 4;
  const sunsetUtcMinutes = solarNoonUtcMinutes + haDeg * 4;

  const sunrise = new Date(Date.UTC(year, month, day, 0, 0, 0));
  sunrise.setUTCMinutes(Math.round(sunriseUtcMinutes));

  const sunset = new Date(Date.UTC(year, month, day, 0, 0, 0));
  sunset.setUTCMinutes(Math.round(sunsetUtcMinutes));

  const solarNoon = new Date(Date.UTC(year, month, day, 0, 0, 0));
  solarNoon.setUTCMinutes(Math.round(solarNoonUtcMinutes));

  const dayLengthMinutes = Math.max(0, Math.round((sunsetUtcMinutes - sunriseUtcMinutes)));

  return {
    sunrise,
    sunset,
    solarNoon,
    dayLengthMinutes,
  };
}

/**
 * Format time to 12-hour format e.g. "05:42 AM"
 */
export function formatTime12h(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time to 12-hour format with seconds e.g. "05:42:15 PM"
 */
export function formatTimeWithSeconds(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Format Date to standard localized string "Nov 4, 2026"
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
