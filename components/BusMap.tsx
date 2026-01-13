
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus } from '../types';

interface BusMapProps {
  buses: Bus[];
}

const BusMap: React.FC<BusMapProps> = ({ buses }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      // Shahpura centered
      mapRef.current = L.map(containerRef.current).setView([27.3872, 75.9554], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    buses.forEach(bus => {
      const color = bus.capacity === 'AVAILABLE' ? '#10b981' : '#ef4444';
      const icon = L.divIcon({
        className: 'custom-bus-icon',
        html: `
          <div class="relative group">
             <div class="bg-indigo-700 text-white px-2 py-1 rounded shadow-lg font-bold text-[10px] border border-white whitespace-nowrap">
                ${bus.routeNumber}
             </div>
             <div class="w-2.5 h-2.5 bg-indigo-700 rounded-full mx-auto -mt-1 border border-white shadow-sm"></div>
          </div>
        `,
        iconSize: [45, 30],
        iconAnchor: [22, 15]
      });

      if (markersRef.current[bus.id]) {
        markersRef.current[bus.id].setLatLng([bus.lat, bus.lng]);
      } else {
        const marker = L.marker([bus.lat, bus.lng], { icon }).addTo(mapRef.current!);
        markersRef.current[bus.id] = marker;
      }
    });

    return () => {};
  }, [buses]);

  return <div ref={containerRef} className="w-full h-full shadow-inner overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100" />;
};

export default BusMap;
