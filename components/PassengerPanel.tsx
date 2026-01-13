
import React, { useState } from 'react';
import { Bus, Language, LANGUAGES } from '../types';
import { predictNextBus, speak } from '../services/geminiService';
import { Info, Volume2, AlertCircle, TrendingUp, Search, Clock, Navigation } from 'lucide-react';

interface PassengerPanelProps {
  buses: Bus[];
  lang: Language;
  isOffline: boolean;
}

const PassengerPanel: React.FC<PassengerPanelProps> = ({ buses, lang, isOffline }) => {
  const [loadingPredId, setLoadingPredId] = useState<string | null>(null);
  const t = LANGUAGES[lang];

  const getCapacityColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'STANDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'FULL': return 'bg-red-100 text-red-700 border-red-200';
      case 'OVERLOADED': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTrafficLabel = (traffic: string) => {
    switch (traffic) {
      case 'SMOOTH': return t.trafficSmooth;
      case 'HEAVY': return t.trafficHeavy;
      case 'BLOCK': return t.trafficBlock;
      default: return '';
    }
  };

  const handlePredict = async (bus: Bus) => {
    setLoadingPredId(bus.id);
    const result = await predictNextBus(bus.routeNumber, bus.capacity, bus.traffic);
    const msg = lang === 'en' ? result.prediction : result.hindiPrediction;
    
    // Auto-update local state with AI ETA if not already precise
    bus.etaMins = result.etaMins;
    bus.prediction = msg;
    
    speak(msg, lang === 'en' ? 'en-US' : 'hi-IN');
    setLoadingPredId(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Navigation className="text-indigo-600 w-5 h-5" />
        <span className="text-slate-700 font-bold">{t.villageName} Bus Service</span>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder={t.searchBus} 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
        <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
      </div>

      <div className="space-y-4">
        {buses.map(bus => {
          const occupancyPercent = Math.min(100, Math.max(0, 100 - (bus.seatsRemaining / bus.maxSeats) * 100));
          
          return (
            <div key={bus.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
              {bus.etaMins !== undefined && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-tighter z-10">
                  {t.etaLabel} {bus.etaMins}m
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="max-w-[60%]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-800 leading-none">{bus.routeNumber}</span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium truncate mt-1">To: {bus.destination}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${getCapacityColor(bus.capacity)}`}>
                  {bus.capacity === 'AVAILABLE' ? `${bus.seatsRemaining} ${t.seatsRemaining}` : 
                   bus.capacity === 'STANDING' ? t.standingOnly : 
                   bus.capacity === 'FULL' ? t.full : t.overloaded}
                </div>
              </div>

              {/* Progress bar and traffic info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                   <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTrafficLabel(bus.traffic)}
                   </div>
                   <span>{occupancyPercent.toFixed(0)}% Full</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 bg-indigo-500`}
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handlePredict(bus)}
                  disabled={!!loadingPredId}
                  className={`flex-1 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 transition shadow-md shadow-indigo-200 ${
                    loadingPredId === bus.id ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 active:scale-95'
                  }`}
                >
                  {loadingPredId === bus.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {t.nextBusPredict}
                </button>
                <button 
                  onClick={() => speak(`${t.appName}. ${bus.routeNumber} is arriving in ${bus.etaMins || 10} minutes with ${bus.seatsRemaining} seats available.`, lang === 'hi' ? 'hi-IN' : 'en-US')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-2 rounded-xl transition border border-slate-100 active:scale-90"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {bus.prediction && (
                <div className="mt-3 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 flex items-start gap-2 animate-in fade-in zoom-in-95">
                  <Info className="w-3 h-3 text-indigo-500 mt-0.5" />
                  <p className="text-[10px] font-bold text-indigo-700 italic">{bus.prediction}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
         <div className="bg-amber-200 p-3 rounded-xl text-amber-700">
            <AlertCircle className="w-6 h-6" />
         </div>
         <div className="flex-1">
            <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.1em]">{t.fairTicket} (Shahpura-Jaipur)</h4>
            <div className="flex justify-between items-baseline">
              <p className="text-amber-900 font-black text-lg">₹ 45</p>
              <span className="text-[9px] text-amber-600 font-bold">Standard Roadways Fare</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PassengerPanel;
