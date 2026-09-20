import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, Users, Ticket, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function DoctorQueueView({ selectedHospitalId, onSelectDoctor }) {
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const q = await api.getQueueStatus(selectedHospitalId);
      setQueueData(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [selectedHospitalId]);

  if (loading && queueData.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-hospital-600" />
        <p className="text-xs text-slate-500 font-medium">Fetching doctor schedules & queue lengths...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Live Doctor Queues & Availability
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Check current wait loads before taking a token or proceeding to the clinic.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {queueData.map((doc) => (
          <div
            key={doc.doctor_id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-hospital-100 dark:bg-hospital-900/60 text-hospital-700 dark:text-hospital-300 flex items-center justify-center font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {doc.doctor_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {doc.department} • <span className="font-semibold text-hospital-600 dark:text-hospital-400">{doc.room_number}</span>
                  </p>
                </div>
              </div>

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                doc.doctor_status === 'CONSULTING'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : doc.doctor_status === 'ON_BREAK'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
              }`}>
                {doc.doctor_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Currently Inside</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-base">
                  {doc.current_token ? doc.current_token.token_number : 'None'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Waiting in Queue</span>
                <span className="font-bold text-hospital-700 dark:text-hospital-400 text-base">
                  {doc.waiting_count} patient(s)
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectDoctor && onSelectDoctor(doc.doctor_id, doc.department)}
              className="w-full py-2.5 bg-slate-100 hover:bg-hospital-50 dark:bg-slate-800 dark:hover:bg-hospital-950/40 text-hospital-700 dark:text-hospital-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Ticket className="w-4 h-4" />
              Get Token for {doc.doctor_name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
