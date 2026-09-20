import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Ticket, 
  Stethoscope, 
  Sun, 
  Moon, 
  Building2, 
  Sparkles,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  hospitals, 
  selectedHospitalId, 
  setSelectedHospitalId,
  onRefresh
}) {
  const [time, setTime] = useState(new Date());
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.seedDemo();
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const navItems = [
    { id: 'track', label: 'Track My Token', icon: Search },
    { id: 'checkin', label: 'Self Check-In', icon: Ticket },
    { id: 'doctors', label: 'Doctors & Queues', icon: Stethoscope },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo - QureAI Patient Portal */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('track')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-hospital-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-hospital-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Qure<span className="text-hospital-600 dark:text-hospital-400">AI</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-hospital-100 text-hospital-800 dark:bg-hospital-900/60 dark:text-hospital-300 uppercase tracking-wider">
                  Patient Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-none">
                Live Outpatient Queue & Wait Time Predictor
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation (Patient Only) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-hospital-700 dark:text-hospital-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-hospital-600 dark:text-hospital-400' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            
            {/* Hospital Selector */}
            <div className="relative hidden lg:flex items-center">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedHospitalId || ''}
                onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
                className="pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-hospital-500"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-hospital-600 dark:text-hospital-400" />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Quick Demo Seed */}
            <button
              onClick={handleSeed}
              disabled={seeding}
              title="Populate sample queue to test patient tracking"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 rounded-xl transition-colors shadow-sm"
            >
              <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{seeding ? 'Loading...' : 'Demo Queue'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

          </div>
        </div>

        {/* Mobile Submenu Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 dark:border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                  isActive
                    ? 'bg-hospital-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
