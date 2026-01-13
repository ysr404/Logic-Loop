
import React, { useState, useEffect } from 'react';
import { Bus, Language, LANGUAGES, CapacityStatus, OfflineUpdate } from './types';
import { MOCK_BUSES } from './constants';
import BusMap from './components/BusMap';
import PassengerPanel from './components/PassengerPanel';
import ConductorPanel from './components/ConductorPanel';
import { MapPin, Users, Settings, WifiOff, Globe, Bus as BusIcon, RefreshCw, CloudSync } from 'lucide-react';

const STORAGE_KEY = 'graminbus_data';
const QUEUE_KEY = 'graminbus_offline_queue';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'passenger' | 'conductor'>('passenger');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('graminbus_lang') as Language) || 'en');
  const [buses, setBuses] = useState<Bus[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_BUSES;
  });
  const [offlineQueue, setOfflineQueue] = useState<OfflineUpdate[]>(() => {
    const saved = localStorage.getItem(QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const t = LANGUAGES[lang];

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buses));
  }, [buses]);

  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    localStorage.setItem('graminbus_lang', lang);
  }, [lang]);

  // Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      processSyncQueue();
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  const processSyncQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    console.log("Syncing offline updates...");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you'd send offlineQueue to server here
    setOfflineQueue([]);
    setIsSyncing(false);
  };

  const handleUpdateBus = (busId: string, updates: Partial<Bus>) => {
    const timestamp = Date.now();
    
    // Update local state immediately
    setBuses(prev => prev.map(b => b.id === busId ? { ...b, ...updates, lastUpdated: timestamp } : b));

    if (isOffline) {
      // Add to offline queue
      const newUpdate: OfflineUpdate = {
        id: Math.random().toString(36).substr(2, 9),
        busId,
        updates,
        timestamp
      };
      setOfflineQueue(prev => [...prev, newUpdate]);
    } else {
      // Immediate sync simulation
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white shadow-2xl relative">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <BusIcon className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">{t.appName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isOffline && <WifiOff className="text-orange-300 w-5 h-5 animate-pulse" />}
          {isSyncing && <RefreshCw className="w-5 h-5 animate-spin text-indigo-200" />}
          {!isOffline && offlineQueue.length > 0 && <CloudSync className="w-5 h-5 text-emerald-400" onClick={processSyncQueue} />}
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 transition"
          >
            <Globe className="w-4 h-4" />
            {lang === 'en' ? 'हिन्दी' : 'EN'}
          </button>
        </div>
      </header>

      {/* Connection Alert */}
      {isOffline && (
        <div className="bg-orange-100 text-orange-800 px-4 py-1.5 text-center text-xs font-bold border-b border-orange-200">
          {t.offlineMode} - {offlineQueue.length > 0 ? `${offlineQueue.length} ${t.pendingSync}` : t.cachedData}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="h-64 sm:h-80 w-full p-2">
           <BusMap buses={buses} />
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 rounded-t-3xl shadow-inner border-t border-slate-200">
           {activeTab === 'passenger' ? (
             <PassengerPanel buses={buses} lang={lang} isOffline={isOffline} />
           ) : (
             <ConductorPanel buses={buses} lang={lang} onUpdate={handleUpdateBus} offlineCount={offlineQueue.length} />
           )}
        </div>
      </main>

      {/* Navigation Footer */}
      <nav className="bg-white border-t border-slate-200 p-2 flex justify-around items-center sticky bottom-0 z-30 pb-safe">
        <button 
          onClick={() => setActiveTab('passenger')}
          className={`flex flex-col items-center flex-1 p-2 rounded-xl transition ${activeTab === 'passenger' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500'}`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-bold mt-1">{t.rolePassenger}</span>
        </button>
        <button 
          onClick={() => setActiveTab('conductor')}
          className={`flex flex-col items-center flex-1 p-2 rounded-xl transition ${activeTab === 'conductor' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500'}`}
        >
          <div className="relative">
            <Users className="w-6 h-6" />
            {offlineQueue.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">{offlineQueue.length}</span>
            )}
          </div>
          <span className="text-xs font-bold mt-1 uppercase tracking-tighter">{t.roleConductor}</span>
        </button>
        <button className="flex flex-col items-center flex-1 p-2 text-slate-400">
          <Settings className="w-6 h-6" />
          <span className="text-xs font-bold mt-1 italic">Setup</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
