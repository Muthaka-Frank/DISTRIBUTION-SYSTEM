'use client';

import { useState, useEffect } from 'react';
import { MapPin, Thermometer, Truck, Navigation, CheckCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/constants';

// Mock active shipment ID (would come from login/context in real app)
const ACTIVE_SHIPMENT_ID = 'shipment-123';

export default function Home() {
  const [location, setLocation] = useState({ lat: -1.2921, lng: 36.8219 });
  const [temp, setTemp] = useState(4.5);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'DRIVER') {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  // 1. Simulate GPS Movement
  const updateLocation = async () => {
    setIsUpdating(true);
    // Simulate moving slightly
    const newLat = location.lat + (Math.random() - 0.5) * 0.01;
    const newLng = location.lng + (Math.random() - 0.5) * 0.01;

    const token = localStorage.getItem('auth_token');

    try {
      await fetch(`${API_URL}/tms/shipments/${ACTIVE_SHIPMENT_ID}/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lat: newLat, lng: newLng }),
      });
      setLocation({ lat: newLat, lng: newLng });
      setLastUpdate('Location updated');
    } catch (e) {
      setLastUpdate('GPS Error - Offline?');
    }
    setIsUpdating(false);
  };

  // 2. Report Temperature (IoT Simulation)
  const reportTemp = async () => {
    setIsUpdating(true);
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(`${API_URL}/tms/shipments/${ACTIVE_SHIPMENT_ID}/temperature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ temperature: Number(temp), sensorId: 'SENSOR-MOBILE-01' }),
      });
      setLastUpdate(temp > 8 ? '⚠️ High Temp Alert Sent!' : 'Temperature Logged');
    } catch (e) {
      setLastUpdate('Sensor Error');
    }
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Mobile Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-full">
            <Truck className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg hidden md:block">Driver Mate</h1>
            <h1 className="font-bold text-lg md:hidden">T-App</h1>
            <p className="text-xs text-slate-400 hidden md:block">Vehicle: KBA 123X</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-emerald-400 hidden md:block">
            ONLINE
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto">

        {/* Active Task Card */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Current Job</h2>
              <div className="text-xl font-bold mt-1">Order #8821</div>
              <div className="text-sm text-slate-300">Dest: City General Hospital</div>
            </div>
            <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
              In Transit
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={updateLocation}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              Ping GPS
            </button>
          </div>

          <div className="mt-4 text-xs font-mono text-slate-500 text-center">
            Lat: {location.lat.toFixed(4)} | Lng: {location.lng.toFixed(4)}
          </div>
        </div>

        {/* Cold Chain Monitor */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className={`w-5 h-5 ${temp > 8 ? 'text-red-500' : 'text-emerald-500'}`} />
            <h2 className="font-semibold">Cargo Temperature</h2>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-4xl font-bold font-mono">{temp.toFixed(1)}°C</span>
            <div className={`text-xs px-2 py-1 rounded ${temp > 8 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {temp > 8 ? 'WARNING' : 'Optimal'}
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="12"
            step="0.1"
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mb-6 accent-blue-500"
          />

          <button
            onClick={reportTemp}
            disabled={isUpdating}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${temp > 8
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20 animate-pulse'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:shadow-slate-900/50'
              }`}
          >
            {temp > 8 ? 'REPORT BREACH ⚠️' : 'Log Temperature'}
          </button>
        </div>

        {/* Status Toast */}
        {lastUpdate && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm animate-in slide-in-from-bottom-2 fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {lastUpdate}
          </div>
        )}

      </main>
    </div>
  );
}
