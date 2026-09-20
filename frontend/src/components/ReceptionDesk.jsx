import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Stethoscope, 
  Clock, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Printer, 
  Filter, 
  ArrowRight,
  ShieldAlert,
  Search,
  Sparkles,
  Play,
  Square
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

export default function ReceptionDesk({ selectedHospitalId, onSelectToken }) {
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
  const [actionLoading, setActionLoading] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);
  const [error, setError] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const loadDoctorsAndQueue = async () => {
    try {
      const docs = await api.getDoctors(selectedHospitalId);
      setDoctors(docs);
      if (docs.length > 0 && !formData.doctor_id) {
        setFormData(prev => ({
          ...prev,
          doctor_id: docs[0].id,
          department: docs[0].department
        }));
      }

      const q = await api.getQueueStatus(selectedHospitalId);
      setQueueData(q);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDoctorsAndQueue();
    const interval = setInterval(loadDoctorsAndQueue, 5000);
    return () => clearInterval(interval);
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
      setCreatedToken(result.token);
      setFormData(prev => ({
        ...prev,
        name: '',
        phone: '',
        age: '',
        priority: 'NORMAL'
      }));
      loadDoctorsAndQueue();
    } catch (err) {
      setError(err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async (doctorId, tokenId = null) => {
    setActionLoading(true);
    try {
      await api.doctorStart(doctorId, tokenId);
      await loadDoctorsAndQueue();
    } catch (err) {
      alert(err.message || 'Failed to call patient');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndConsultation = async (doctorId) => {
    setActionLoading(true);
    try {
      await api.doctorEnd(doctorId);
      await loadDoctorsAndQueue();
    } catch (err) {
      alert(err.message || 'Failed to complete consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const departments = ['ALL', ...new Set(doctors.map(d => d.department))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-hospital-600 dark:text-hospital-400" />
          OPD Reception Desk
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Register walk-in patients, auto-generate sequential tokens, assign priority tiers, and manage the live queue.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Intake Registration Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>New Patient Check-In</span>
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-hospital-100 text-hospital-800 dark:bg-hospital-900/60 dark:text-hospital-300">
              Live Intake
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            
            {/* Full Name */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                Patient Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500"
                />
              </div>
            </div>

            {/* Phone & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                  Mobile Number *
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

            {/* Gender */}
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
                    className={`py-2 rounded-lg border text-center transition-all ${
                      formData.gender === g
                        ? 'bg-hospital-600 text-white border-hospital-600 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                Assign Doctor & Specialization *
              </label>
              <select
                value={formData.doctor_id}
                onChange={handleDoctorChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-hospital-500 font-medium"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.department}) - {d.room_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                Queue Priority Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: 'NORMAL' })}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
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
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
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
                  className={`py-2 px-2 rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
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
              className="w-full py-3 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-md shadow-hospital-600/25 flex items-center justify-center gap-2 mt-4 text-sm"
            >
              {loading ? 'Issuing Token...' : 'Generate OPD Token & Predict Wait'}
            </button>
          </form>

          {/* Generated Token Slip Dialog */}
          {createdToken && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-hospital-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border-2 border-hospital-400 dark:border-hospital-600 space-y-3">
              <div className="flex items-center justify-between border-b border-hospital-200 dark:border-slate-700 pb-2">
                <span className="font-mono font-extrabold text-2xl text-hospital-800 dark:text-hospital-300">
                  {createdToken.token_number}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-hospital-600 text-white">
                  Token Issued
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient Name</span>
                  <strong>{createdToken.patient_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Doctor & Room</span>
                  <strong>{createdToken.doctor_name}</strong>
                  <div className="text-[11px] text-hospital-600">{createdToken.room_number}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Patients Ahead</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {createdToken.patients_ahead}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AI Est. Wait Time</span>
                  <span className="text-base font-bold text-hospital-700 dark:text-hospital-400">
                    ~{Math.round(createdToken.estimated_wait_minutes)} mins
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <QRCodeSVG 
                    value={window.location.origin + '?token=' + createdToken.token_number}
                    size={64}
                    level="M"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      if (onSelectToken) onSelectToken(createdToken.token_number);
                    }}
                    className="w-full py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    Track in Patient View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Token Slip
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Active Queue Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Active OPD Queue Directory
              </h2>
              <p className="text-xs text-slate-500">
                Live consultations and waiting queues across departments.
              </p>
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedDeptFilter === dept
                      ? 'bg-hospital-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Queue Cards */}
          <div className="space-y-4">
            {queueData
              .filter(d => selectedDeptFilter === 'ALL' || d.department === selectedDeptFilter)
              .map(doc => (
                <div 
                  key={doc.doctor_id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-hospital-100 dark:bg-hospital-900/60 text-hospital-700 dark:text-hospital-300 flex items-center justify-center font-bold text-xs">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {doc.doctor_name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {doc.department} • <span className="font-medium text-slate-700 dark:text-slate-300">{doc.room_number}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {doc.waiting_count} waiting
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        doc.doctor_status === 'CONSULTING'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {doc.doctor_status}
                      </span>
                      {/* Call Next Button on Doctor Card */}
                      {doc.waiting_count > 0 && (
                        <button
                          onClick={() => handleCallNext(doc.doctor_id)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 bg-hospital-600 hover:bg-hospital-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                          title="Call next waiting patient"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Call Next
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Currently Consulting */}
                  {doc.current_token ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-300">
                          {doc.current_token.token_number}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          {doc.current_token.patient_name} (Age {doc.current_token.patient_age})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hidden sm:inline">
                          Now Inside
                        </span>
                        <button
                          onClick={() => handleEndConsultation(doc.doctor_id)}
                          disabled={actionLoading}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <Square className="w-2.5 h-2.5" />
                          Complete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic py-1">
                      No active consultation in progress.
                    </div>
                  )}

                  {/* Upcoming Tokens List */}
                  {doc.waiting_list.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Waiting Line ({doc.waiting_list.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {doc.waiting_list.map((tok) => (
                          <div 
                            key={tok.id}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-hospital-400 dark:hover:border-hospital-600 bg-slate-50/70 dark:bg-slate-800/40 transition-all flex items-center justify-between text-xs"
                          >
                            <div 
                              onClick={() => onSelectToken && onSelectToken(tok.token_number)}
                              className="cursor-pointer flex-1"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {tok.token_number}
                                </span>
                                {tok.priority === 'EMERGENCY' && (
                                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded text-[9px] font-bold">
                                    EMERGENCY
                                  </span>
                                )}
                                {tok.priority === 'SENIOR' && (
                                  <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[9px] font-bold">
                                    SR
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-500 text-[11px]">{tok.patient_name}</span>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div>
                                <span className="font-semibold text-hospital-700 dark:text-hospital-400">
                                  ~{Math.round(tok.estimated_wait_minutes)}m
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {tok.patients_ahead} ahead
                                </span>
                              </div>
                              <button
                                onClick={() => handleCallNext(doc.doctor_id, tok.id)}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg bg-hospital-50 hover:bg-hospital-100 dark:bg-hospital-900/40 text-hospital-700 dark:text-hospital-300 font-bold text-[10px] border border-hospital-200 dark:border-hospital-800"
                                title="Call this specific patient into room"
                              >
                                Call
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

        </div>

      </div>

    </div>
  );
}
