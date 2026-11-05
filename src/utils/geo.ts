/**
 * Robust Geolocation & Reverse Geocoding Helper
 * Provides resilient GPS positioning with fallback options and reverse geocoding timeout handling.
 */

export interface GpsLocationResult {
  lat: number;
  lng: number;
  placeName: string;
}

/**
 * High-reliability GPS fetcher with fallbacks
 */
export function getCurrentGpsLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    // First attempt: High accuracy with 8s timeout
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        // Second attempt: Low accuracy / fast network location with cached position
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err2) => reject(err2 || err),
          {
            enableHighAccuracy: false,
            timeout: 12000,
            maximumAge: 300000, // accept up to 5 min cached position
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Reverse geocode lat/lng to a readable city/town place name with 4s fetch timeout and offline fallback
 */
export async function reverseGeocodeName(lat: number, lng: number, fallbackPrefix = 'Location'): Promise<string> {
  const fallback = `${fallbackPrefix} (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return fallback;

    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const cityOrTown =
        addr.city ||
        addr.town ||
        addr.suburb ||
        addr.municipality ||
        addr.village ||
        addr.county ||
        addr.state;

      if (cityOrTown) {
        return cityOrTown;
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}
