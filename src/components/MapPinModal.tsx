import React, { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Navigation, Check, ArrowRight, Compass, Building2, Flame } from 'lucide-react';
import L from 'leaflet';
import { POPULAR_STATIONS, PigeonStation } from '../utils/stations';
import { calculateHaversineDistanceKm } from '../utils/pigeonCalc';

interface MapPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDistance: (
    distanceKm: number,
    pointAName?: string,
    pointBName?: string,
    pointACoords?: { lat: number; lng: number },
    pointBCoords?: { lat: number; lng: number }
  ) => void;
  initialDistanceKm?: number;
  initialPointA?: MapPoint;
  initialPointB?: MapPoint;
}

export interface MapPoint {
  name: string;
  lat: number;
  lng: number;
}

export const MapPinModal: React.FC<MapPinModalProps> = ({
  isOpen,
  onClose,
  onApplyDistance,
  initialPointA,
  initialPointB,
}) => {
  // Point A = Liberation / Release Site
  const [pointA, setPointA] = useState<MapPoint>(
    initialPointA || {
      name: 'Release Station (Point A)',
      lat: 16.9248,
      lng: 121.7738,
    }
  );

  // Point B = Loft / Home Base
  const [pointB, setPointB] = useState<MapPoint>(
    initialPointB || {
      name: 'My Loft (Point B)',
      lat: 14.5995,
      lng: 120.9842,
    }
  );

  useEffect(() => {
    if (isOpen) {
      if (initialPointA) setPointA(initialPointA);
      if (initialPointB) setPointB(initialPointB);
    }
  }, [isOpen, initialPointA, initialPointB]);

  const [activePinTarget, setActivePinTarget] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isLocatingLoft, setIsLocatingLoft] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerARef = useRef<L.Marker | null>(null);
  const markerBRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Calculate distance
  const distanceInfo = calculateHaversineDistanceKm(pointA.lat, pointA.lng, pointB.lat, pointB.lng);

  // Initialize or re-render map
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow modal DOM layout to settle
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
        }).setView([(pointA.lat + pointB.lat) / 2, (pointA.lng + pointB.lng) / 2], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Click on map to place active pin
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (activePinTarget === 'A') {
            setPointA({
              name: `Pinned Site (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              lat,
              lng,
            });
            setActivePinTarget('B'); // auto advance to B
          } else {
            setPointB({
              name: `Pinned Loft (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              lat,
              lng,
            });
          }
        });

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.invalidateSize();
      }

      updateMapLayers();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Update map markers and line when points change
  const updateMapLayers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Custom icons
    const iconA = L.divIcon({
      className: 'custom-pin-a',
      html: `
        <div style="background-color: #0284c7; color: white; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
          <span style="transform: rotate(45deg); font-weight: 800; font-size: 13px;">A</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const iconB = L.divIcon({
      className: 'custom-pin-b',
      html: `
        <div style="background-color: #10b981; color: white; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
          <span style="transform: rotate(45deg); font-weight: 800; font-size: 13px;">B</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Marker A
    if (markerARef.current) {
      markerARef.current.setLatLng([pointA.lat, pointA.lng]);
    } else {
      markerARef.current = L.marker([pointA.lat, pointA.lng], {
        icon: iconA,
        draggable: true,
      })
        .addTo(map)
        .bindPopup(`<b>Point A: Release Site</b><br>${pointA.name}`);

      markerARef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setPointA({
          name: `Custom Release (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`,
          lat: pos.lat,
          lng: pos.lng,
        });
      });
    }

    // Marker B
    if (markerBRef.current) {
      markerBRef.current.setLatLng([pointB.lat, pointB.lng]);
    } else {
      markerBRef.current = L.marker([pointB.lat, pointB.lng], {
        icon: iconB,
        draggable: true,
      })
        .addTo(map)
        .bindPopup(`<b>Point B: Loft</b><br>${pointB.name}`);

      markerBRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setPointB({
          name: `Custom Loft (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`,
          lat: pos.lat,
          lng: pos.lng,
        });
      });
    }

    // Flight Path Polyline (dashed crow flight line)
    const latlngs: [number, number][] = [
      [pointA.lat, pointA.lng],
      [pointB.lat, pointB.lng],
    ];

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latlngs);
    } else {
      polylineRef.current = L.polyline(latlngs, {
        color: '#0284c7',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.9,
      }).addTo(map);
    }

    // Fit bounds smoothly
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapLayers();
    }
  }, [pointA, pointB]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Search places via Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=4`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch {
      // Offline fallback: filter stations
      const filtered = POPULAR_STATIONS.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((s) => ({
        display_name: s.name,
        lat: s.lat.toString(),
        lon: s.lng.toString(),
      }));
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const shortName = item.display_name.split(',')[0];

    if (activePinTarget === 'A') {
      setPointA({ name: shortName, lat, lng });
      setActivePinTarget('B');
    } else {
      setPointB({ name: shortName, lat, lng });
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  // Auto-detect Loft (Point B) using GPS
  const handleLocateLoft = () => {
    if (!navigator.geolocation) return;
    setIsLocatingLoft(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingLoft(false);
        setPointB({
          name: 'My Current Loft (GPS)',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setIsLocatingLoft(false);
      },
      { timeout: 10000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-lg h-[92vh] max-h-[820px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-500" />
              Pin Distance (Crow Flight)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pin Release Point A & Loft Point B on the map
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pin Target Selector & Search */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
          {/* Target Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActivePinTarget('A')}
              className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                activePinTarget === 'A'
                  ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  A
                </span>
                <span className="truncate">Release: {pointA.name}</span>
              </div>
              {activePinTarget === 'A' && <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Active</span>}
            </button>

            <button
              onClick={() => setActivePinTarget('B')}
              className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                activePinTarget === 'B'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  B
                </span>
                <span className="truncate">Loft: {pointB.name}</span>
              </div>
              {activePinTarget === 'B' && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active</span>}
            </button>
          </div>

          {/* Search bar & GPS Loft shortcut */}
          <div className="flex gap-1.5">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                placeholder={`Search city or place for Point ${activePinTarget}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <button
              type="button"
              onClick={handleLocateLoft}
              disabled={isLocatingLoft}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 shrink-0 transition cursor-pointer"
              title="Pin my current GPS location as Loft (Point B)"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocatingLoft ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">GPS Loft</span>
            </button>
          </div>

          {/* Search results dropdown if any */}
          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg divide-y divide-slate-100 dark:divide-slate-800 max-h-36 overflow-y-auto z-20">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between"
                >
                  <span className="truncate text-slate-800 dark:text-slate-200">
                    {item.display_name}
                  </span>
                  <span className="text-[10px] text-sky-500 font-semibold shrink-0 ml-2">
                    Set as {activePinTarget}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Racing Stations Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-slate-400 dark:text-slate-500 shrink-0 text-[10px] uppercase font-bold flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-amber-500" /> Presets:
            </span>
            {POPULAR_STATIONS.slice(0, 6).map((st) => (
              <button
                key={st.name}
                onClick={() => {
                  if (activePinTarget === 'A') {
                    setPointA({ name: st.name, lat: st.lat, lng: st.lng });
                    setActivePinTarget('B');
                  } else {
                    setPointB({ name: st.name, lat: st.lat, lng: st.lng });
                  }
                }}
                className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-300 shrink-0 text-[11px] cursor-pointer"
              >
                {st.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[220px]">
          <div ref={mapContainerRef} className="w-full h-full" />
          <div className="absolute top-2 left-2 z-[400] bg-black/70 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-xs pointer-events-none">
            Tap map to place Pin {activePinTarget}
          </div>
        </div>

        {/* Calculated Crow Flight Distance Summary & Apply Button */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-sky-500" />
                Crow Flight Distance
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {distanceInfo.distanceKm.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                </span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">KM</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({distanceInfo.distanceMeters.toLocaleString()} m)
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500">Flight Bearing</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {distanceInfo.bearingDeg}° {distanceInfo.bearingText}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyDistance(
                  distanceInfo.distanceKm,
                  pointA.name,
                  pointB.name,
                  { lat: pointA.lat, lng: pointA.lng },
                  { lat: pointB.lat, lng: pointB.lng }
                );
                onClose();
              }}
              className="w-2/3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply {distanceInfo.distanceKm.toFixed(3)} KM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
