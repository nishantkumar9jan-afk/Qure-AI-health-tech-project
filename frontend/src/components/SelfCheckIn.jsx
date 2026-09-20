import React, { useState, useEffect } from 'react';
import { UserPlus, Phone, User, Calendar, ShieldAlert, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function SelfCheckIn({ selectedHospitalId, onTokenCreated }) {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    doctor_id: '',
    department: '',
    priority: 'NORMAL',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await api.getDoctors(selectedHospitalId);
        setDoctors(data);
        if (data.length > 0 && !formData.doctor_id) {
          setFormData(prev => ({
            ...prev,
            doctor_id: data[0].id,
            department: data[0].department
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDocs();
  }, [selectedHospitalId]);

  const handleDoctorChange = (e) => {
    const docId = Number(e.target.value);
    const doc = doctors.find(d => d.id === docId);
    setFormData(prev => ({
      ...prev,
      doctor_id: docId,
      department: doc ? doc.department : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        doctor_id: parseInt(formData.doctor_id, 10),
        department: formData.department,
        priority: formData.priority
      };

      const result = await api.registerPatient(payload);
      if (onTokenCreated) {
        onTokenCreated(result.token.token_number);
      }
    } catch (err) {
      setError(err.message || 'Self check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hospital-50 dark:bg-hospital-950/60 text-hospital-700 dark:text-hospital-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-hospital-600" />
            Instant Digital Check-In
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Patient Self Check-In
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill in your details below to generate your OPD token and start tracking your position live.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                Mobile Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                Age (Years) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => {
                  const a = e.target.value;
                  let p = formData.priority;
                  if (Number(a) >= 65 && p === 'NORMAL') p = 'SENIOR';
                  setFormData({ ...formData, age: a, priority: p });
                }}
                placeholder="Age"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Male', 'Female', 'Other'].map(g => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    formData.gender === g
                      ? 'bg-hospital-600 text-white border-hospital-600 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Select Physician & Specialization *
            </label>
            <select
              value={formData.doctor_id}
              onChange={handleDoctorChange}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500 font-medium"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.department}) — {d.room_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Priority Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priority: 'NORMAL' })}
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
                  formData.priority === 'NORMAL'
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priority: 'SENIOR' })}
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
                  formData.priority === 'SENIOR'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Senior (60+)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priority: 'EMERGENCY' })}
                className={`py-2 px-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1 ${
                  formData.priority === 'EMERGENCY'
                    ? 'bg-rose-600 text-white border-rose-600 font-bold animate-pulse'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Emergency
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.name || !formData.phone || !formData.age}
            className="w-full py-3.5 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md shadow-hospital-600/25 flex items-center justify-center gap-2 mt-4 text-sm"
          >
            {loading ? 'Issuing Token...' : 'Get My OPD Token & Start Tracking'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
