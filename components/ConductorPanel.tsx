
import React, { useState } from 'react';
import { Bus, Language, LANGUAGES, CapacityStatus, TrafficStatus } from '../types';
import { MapPin, Activity, ChevronRight, Share2, Database, Plus, Minus, Users, Car, AlertTriangle, Clock } from 'lucide-react';

interface ConductorPanelProps {
  buses: Bus[];
  lang: Language;
  onUpdate: (id: string, updates: Partial<Bus>) => void;
  offlineCount: number;
}

const ConductorPanel: React.FC<ConductorPanelProps> = ({ buses, lang, onUpdate, offlineCount }) => {
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const t = LANGUAGES[lang];

  const activeBus = buses.find(b => b.id === trackingId);

  const toggleTracking = (busId: string) => {
    if (trackingId === busId) {
      setTrackingId(null);
    } else {
      setTrackingId(busId);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          onUpdate(busId, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
      }
    }
  };

  const updateCapacityStatus = (busId: string, status: CapacityStatus) => {
    let seats = activeBus?.seatsRemaining ?? 0;
    if (status !== 'AVAILABLE') seats = 0;
    else if (seats === 0) seats = 5; 
    onUpdate(busId, { capacity: status, seatsRemaining: seats });
  };

  const adjustSeats = (delta: number) => {
    if (!trackingId || !activeBus) return;
    const newCount = Math.max(0, Math.min(activeBus.maxSeats, activeBus.seatsRemaining + delta));
    const newStatus: CapacityStatus = newCount > 0 ? 'AVAILABLE' : 'FULL';
    onUpdate(trackingId, { seatsRemaining: newCount, capacity: newStatus });
  };

  const adjustETA = (delta: number) => {
    if (!trackingId || !activeBus) return;
    const currentETA = activeBus.etaMins ?? 10;
    const newETA = Math.max(0, currentETA + delta);
    onUpdate(trackingId, { etaMins: newETA });
  };

  const setTraffic = (status: TrafficStatus) => {
    if (!trackingId) return;
    onUpdate(trackingId, { traffic: status });
  };

  return (
    <div className="p-4 space-y-6">
      {offlineCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <Database className="text-emerald-600 w-5 h-5" />
          <p className="text-emerald-800 text-xs font-bold leading-tight">
            {offlineCount} updates pending. They'll sync when internet returns near NH-48.
          </p>
        </div>
      )}

      <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl border-4 border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black tracking-tight">{t.roleConductor}</h2>
        </div>
        
        <div className="space-y-3">
          {buses.map(bus => (
            <div key={bus.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition hover:bg-white/10">
              <div className="flex-1">
                <p className="text-white font-black text-lg">{bus.routeNumber}</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{bus.destination}</p>
              </div>
              <button 
                onClick={() => toggleTracking(bus.id)}
                className={`px-5 py-2.5 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest shadow-lg ${
                  trackingId === bus.id 
                  ? 'bg-red-500 text-white shadow-red-500/40 ring-2 ring-white/20' 
                  : 'bg-indigo-500 text-white shadow-indigo-500/40 hover:scale-105'
                }`}
              >
                {trackingId === bus.id ? t.stopTracking : t.startTracking}
              </button>
            </div>
          ))}
        </div>
      </div>

      {trackingId && activeBus && (
        <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6 duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
             <Users className="w-40 h-40" />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping" />
               <h3 className="font-black text-slate-800 text-2xl uppercase">{activeBus.routeNumber}</h3>
            </div>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 tracking-wider">BUS ID: {activeBus.id}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Seat Counter */}
            <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 shadow-sm">
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">{t.updateSeats}</p>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => adjustSeats(-1)}
                  className="bg-white text-slate-800 w-12 h-12 rounded-xl shadow-md border border-slate-200 flex items-center justify-center active:scale-90 transition hover:bg-slate-50"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <div className="text-center min-w-[70px]">
                  <span className="text-4xl font-black text-indigo-700 block drop-shadow-sm">{activeBus.seatsRemaining}</span>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.seatsRemaining}</span>
                </div>

                <button 
                  onClick={() => adjustSeats(1)}
                  className="bg-white text-slate-800 w-12 h-12 rounded-xl shadow-md border border-slate-200 flex items-center justify-center active:scale-90 transition hover:bg-slate-50"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* ETA Counter */}
            <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100 shadow-sm">
              <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">{t.updateETA}</p>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => adjustETA(-1)}
                  className="bg-white text-slate-800 w-12 h-12 rounded-xl shadow-md border border-slate-200 flex items-center justify-center active:scale-90 transition hover:bg-slate-50"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <div className="text-center min-w-[70px]">
                  <span className="text-4xl font-black text-amber-600 block drop-shadow-sm">{activeBus.etaMins ?? '--'}</span>
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">MINS</span>
                </div>

                <button 
                  onClick={() => adjustETA(1)}
                  className="bg-white text-slate-800 w-12 h-12 rounded-xl shadow-md border border-slate-200 flex items-center justify-center active:scale-90 transition hover:bg-slate-50"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traffic Control */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">Report Traffic</p>
               <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => setTraffic('SMOOTH')}
                    className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${activeBus.traffic === 'SMOOTH' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                     <Car className="w-5 h-5" />
                     <span className="text-[7px] font-black uppercase">{t.trafficSmooth}</span>
                  </button>
                  <button 
                    onClick={() => setTraffic('HEAVY')}
                    className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${activeBus.traffic === 'HEAVY' ? 'bg-amber-500 border-amber-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                     <AlertTriangle className="w-5 h-5" />
                     <span className="text-[7px] font-black uppercase">{t.trafficHeavy}</span>
                  </button>
                  <button 
                    onClick={() => setTraffic('BLOCK')}
                    className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${activeBus.traffic === 'BLOCK' ? 'bg-red-600 border-red-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                     <Users className="w-5 h-5" />
                     <span className="text-[7px] font-black uppercase">{t.trafficBlock}</span>
                  </button>
               </div>
            </div>

            {/* Quick Status Override */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">{t.seatStatus}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'AVAILABLE', label: t.seatsRemaining, color: 'emerald' },
                  { id: 'FULL', label: t.full, color: 'red' },
                ].map(cap => (
                  <button 
                    key={cap.id}
                    onClick={() => updateCapacityStatus(trackingId, cap.id as CapacityStatus)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                        activeBus.capacity === cap.id 
                        ? `border-${cap.color}-500 bg-${cap.color}-500 text-white shadow-md` 
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase text-center leading-tight">{cap.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
             <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Last Update: {new Date(activeBus.lastUpdated).toLocaleTimeString()}</span>
             </div>
          </div>
        </div>
      )}

      <div className="bg-indigo-600 text-white rounded-2xl p-5 flex items-center justify-between group cursor-pointer active:scale-95 transition shadow-xl shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <MapPin className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-base block leading-none">Shahpura Main Bus Stand</span>
            <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest">Village Connectivity Hub</span>
          </div>
        </div>
        <ChevronRight className="text-white w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

export default ConductorPanel;
