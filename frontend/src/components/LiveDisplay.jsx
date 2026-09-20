import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Volume2, 
  Maximize2, 
  Stethoscope, 
  Clock, 
  Sparkles, 
  Activity, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { playChime } from '../utils/audio';

export default function LiveDisplay({ selectedHospitalId, hospitals }) {
  const [queueData, setQueueData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);

  const fetchDisplayQueue = async () => {
    try {
      const q = await api.getQueueStatus(selectedHospitalId);
      setQueueData(q);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDisplayQueue();
    const interval = setInterval(fetchDisplayQueue, 4000);
    return () => clearInterval(interval);
  }, [selectedHospitalId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentHospital = hospitals.find(h => h.id === selectedHospitalId);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between space-y-6">
      
      {/* Top Header Lounge Display Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-hospital-500 to-teal-300 flex items-center justify-center text-slate-950 shadow-lg shadow-hospital-500/30">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {currentHospital ? currentHospital.name : 'Hospital OPD'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                QureAI Live Board
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Outpatient Department Waiting Lounge Screen • Powered by QureAI
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs font-mono text-slate-400 hidden sm:block">
            Auto-refreshed: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) playChime();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            title="Audio announcement chimes"
          >
            <Volume2 className={`w-4 h-4 ${!audioEnabled ? 'opacity-30' : 'text-hospital-400'}`} />
            <span className="hidden sm:inline">{audioEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            title="Fullscreen Mode"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Grid of Doctors & Room Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {queueData.map((doc) => {
          return (
            <div
              key={doc.doctor_id}
              className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              {/* Room Top Bar */}
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-hospital-400 uppercase tracking-wider block">
                    {doc.room_number}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5 tracking-tight">
                    {doc.doctor_name}
                  </h3>
                  <span className="text-xs text-slate-400">{doc.department}</span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  doc.doctor_status === 'CONSULTING'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : doc.doctor_status === 'ON_BREAK'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {doc.doctor_status}
                </span>
              </div>

              {/* Center: Large NOW SERVING Token */}
              <div className="py-6 text-center space-y-2 my-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                  NOW CONSULTING
                </span>

                {doc.current_token ? (
                  <div className="space-y-1">
                    <div className="font-mono font-black text-5xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-hospital-300 via-teal-200 to-emerald-400 tracking-wider animate-pulse">
                      {doc.current_token.token_number}
                    </div>
                    <div className="text-base font-bold text-slate-200">
                      {doc.current_token.patient_name}
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <span className="font-mono text-2xl font-bold text-slate-600 tracking-wider">
                      STANDBY
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Calling next patient shortly</p>
                  </div>
                )}
              </div>

              {/* Bottom: Next in Line tokens */}
              <div className="border-t border-slate-800/80 pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">NEXT IN LINE</span>
                  <span className="text-[11px]">{doc.waiting_count} waiting</span>
                </div>

                {doc.waiting_list.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {doc.waiting_list.slice(0, 3).map((tok) => (
                      <div
                        key={tok.id}
                        className="bg-slate-800/60 rounded-xl p-2 text-center border border-slate-700/60"
                      >
                        <div className="font-mono font-bold text-xs text-slate-200 flex items-center justify-center gap-1">
                          {tok.token_number}
                          {tok.priority === 'EMERGENCY' && <span className="text-rose-400 font-bold text-[9px]">!</span>}
                        </div>
                        <div className="text-[10px] text-hospital-400 font-semibold">
                          ~{Math.round(tok.estimated_wait_minutes)}m
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 text-center py-1 italic">
                    No further patients in waiting line
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Hospital Ticker Footer */}
      <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-hospital-400" />
          <span>Please keep your token slip ready. When your token displays, proceed directly to the designated room.</span>
        </div>
        <div className="font-mono text-slate-300">
          QureAI Clinical Queue System Active
        </div>
      </div>

    </div>
  );
}
