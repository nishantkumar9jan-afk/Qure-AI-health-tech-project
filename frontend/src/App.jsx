import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PatientTracker from './components/PatientTracker';
import SelfCheckIn from './components/SelfCheckIn';
import DoctorQueueView from './components/DoctorQueueView';
import { api } from './services/api';
import { HeartPulse, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('track'); // 'track' | 'checkin' | 'doctors'
  const [darkMode, setDarkMode] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [trackedTokenNumber, setTrackedTokenNumber] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadHospitals = async () => {
    try {
      const data = await api.getHospitals();
      setHospitals(data);
      if (data.length > 0 && !selectedHospitalId) {
        setSelectedHospitalId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHospitals();

    // Check URL parameters for direct token lookup: ?token=CAR-101
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setTrackedTokenNumber(tokenParam.toUpperCase());
      setActiveTab('track');
    }
  }, []);

  const handleTokenCreated = (tokenNumber) => {
    setTrackedTokenNumber(tokenNumber);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoctorForBooking = (docId, dept) => {
    setActiveTab('checkin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        hospitals={hospitals}
        selectedHospitalId={selectedHospitalId}
        setSelectedHospitalId={setSelectedHospitalId}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'track' && (
          <PatientTracker
            key={`track-${refreshKey}`}
            initialToken={trackedTokenNumber}
            onSelectToken={(tok) => setTrackedTokenNumber(tok)}
          />
        )}

        {activeTab === 'checkin' && (
          <SelfCheckIn
            key={`checkin-${refreshKey}-${selectedHospitalId}`}
            selectedHospitalId={selectedHospitalId}
            onTokenCreated={handleTokenCreated}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorQueueView
            key={`doctors-${refreshKey}-${selectedHospitalId}`}
            selectedHospitalId={selectedHospitalId}
            onSelectDoctor={handleSelectDoctorForBooking}
          />
        )}
      </main>

      {/* Patient Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-hospital-600" />
            <span className="font-bold text-slate-700 dark:text-slate-300">QureAI</span>
            <span>— Patient Outpatient Queue Predictor</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> HIPAA & Clinical Privacy Compliant
            </span>
            <span>AI Dynamic Forecasting</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
