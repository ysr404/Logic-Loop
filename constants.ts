
import { Bus, BusStop } from './types';

// Shahpura, Rajasthan coordinates approx 27.3872, 75.9554
export const MOCK_STOPS: BusStop[] = [
  { id: '1', name: 'Shahpura Main Stand', lat: 27.3872, lng: 75.9554 },
  { id: '2', name: 'Amarpura Mod', lat: 27.3500, lng: 75.9400 },
  { id: '3', name: 'Manoharpur Stand', lat: 27.3000, lng: 75.9300 },
  { id: '4', name: 'Chandwaji (NH-48)', lat: 27.2185, lng: 75.9535 },
];

export const MOCK_BUSES: Bus[] = [
  {
    id: 'SH-01',
    routeNumber: 'Jaipur Exp',
    destination: 'Jaipur Sindhi Camp',
    lastUpdated: Date.now(),
    lat: 27.3600,
    lng: 75.9500,
    capacity: 'AVAILABLE',
    seatsRemaining: 15,
    maxSeats: 45,
    isCrowdsourced: true,
    etaMins: 12,
    traffic: 'SMOOTH'
  },
  {
    id: 'SH-02',
    routeNumber: 'Kotputli Local',
    destination: 'Kotputli',
    lastUpdated: Date.now() - 600000,
    lat: 27.4200,
    lng: 75.9600,
    capacity: 'FULL',
    seatsRemaining: 0,
    maxSeats: 40,
    isCrowdsourced: false,
    etaMins: 25,
    traffic: 'HEAVY'
  }
];
