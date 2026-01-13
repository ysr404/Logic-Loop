
export type CapacityStatus = 'AVAILABLE' | 'STANDING' | 'FULL' | 'OVERLOADED';
export type TrafficStatus = 'SMOOTH' | 'HEAVY' | 'BLOCK';

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Bus {
  id: string;
  routeNumber: string;
  destination: string;
  lastUpdated: number;
  lat: number;
  lng: number;
  capacity: CapacityStatus;
  seatsRemaining: number;
  maxSeats: number;
  isCrowdsourced: boolean;
  prediction?: string;
  etaMins?: number;
  traffic: TrafficStatus;
}

export interface PredictionResult {
  prediction: string;
  hindiPrediction: string;
  etaMins: number;
  timestamp: number;
}

export interface OfflineUpdate {
  id: string;
  busId: string;
  updates: Partial<Bus>;
  timestamp: number;
}

export type Language = 'en' | 'hi';

export interface TranslationStrings {
  appName: string;
  rolePassenger: string;
  roleConductor: string;
  seatsRemaining: string;
  standingOnly: string;
  full: string;
  overloaded: string;
  nextBusPredict: string;
  fairTicket: string;
  updateLocation: string;
  startTracking: string;
  stopTracking: string;
  searchBus: string;
  offlineMode: string;
  syncing: string;
  pendingSync: string;
  cachedData: string;
  seatStatus: string;
  updateSeats: string;
  updateETA: string;
  etaLabel: string;
  trafficSmooth: string;
  trafficHeavy: string;
  trafficBlock: string;
  villageName: string;
}

export const LANGUAGES: Record<Language, TranslationStrings> = {
  en: {
    appName: "GraminBus Shahpura",
    rolePassenger: "Find a Bus",
    roleConductor: "Conductor Panel",
    seatsRemaining: "Seats Left",
    standingOnly: "Standing Only",
    full: "Bus Full",
    overloaded: "Overloaded",
    nextBusPredict: "Check ETA",
    fairTicket: "Estimated Ticket",
    updateLocation: "Update Live Location",
    startTracking: "Start Sharing",
    stopTracking: "Stop Sharing",
    searchBus: "Search route to Jaipur/Delhi",
    offlineMode: "Offline Mode",
    syncing: "Syncing...",
    pendingSync: "Updates pending",
    cachedData: "Using cached data",
    seatStatus: "Seat Availability",
    updateSeats: "Update Seats",
    updateETA: "Set Arrival Time",
    etaLabel: "Arriving in",
    trafficSmooth: "Clear Road",
    trafficHeavy: "Traffic",
    trafficBlock: "Road Block",
    villageName: "Shahpura (शाहपुरा)"
  },
  hi: {
    appName: "शाहपुरा ग्रामीण बस",
    rolePassenger: "बस ढूँढें",
    roleConductor: "कंडक्टर पैनल",
    seatsRemaining: "सीटें खाली",
    standingOnly: "केवल खड़े",
    full: "बस भरी है",
    overloaded: "ओवरलोड",
    nextBusPredict: "समय जानें",
    fairTicket: "सही किराया",
    updateLocation: "लोकेशन साझा करें",
    startTracking: "ट्रैकिंग शुरू",
    stopTracking: "ट्रैकिंग बंद",
    searchBus: "जयपुर/दिल्ली रूट खोजें",
    offlineMode: "ऑफलाइन मोड",
    syncing: "सिंक हो रहा है...",
    pendingSync: "अपडेट बाकी है",
    cachedData: "कैश डेटा",
    seatStatus: "सीट स्थिति",
    updateSeats: "सीट अपडेट करें",
    updateETA: "आगमन समय सेट करें",
    etaLabel: "पहुँच रही है",
    trafficSmooth: "रास्ता साफ़",
    trafficHeavy: "भीड़/ट्रैफिक",
    trafficBlock: "रास्ता बंद",
    villageName: "शाहपुरा"
  }
};
