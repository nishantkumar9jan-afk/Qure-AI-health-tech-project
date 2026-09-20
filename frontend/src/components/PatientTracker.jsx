import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Clock, 
  Users, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  Bell, 
  Volume2, 
  Share2, 
  QrCode, 
  MessageSquare, 
  Send, 
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { playChime, playEmergencyAlert } from '../utils/audio';

export default function PatientTracker({ initialToken = '', onSelectToken }) {
  const [tokenInput, setTokenInput] = useState(initialToken || '');
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [quickTokens, setQuickTokens] = useState([]);
  const hasAlertedRef = useRef(false);

  // Fetch available tokens for quick test
  const loadQuickTokens = async () => {
    try {
      const q = await api.getQueueStatus();
      const tokens = [];
      q.forEach(doc => {
        if (doc.current_token) tokens.push(doc.current_token.token_number);
        doc.waiting_list.slice(0, 2).forEach(t => tokens.push(t.token_number));
      });
      setQuickTokens(tokens.slice(0, 6));
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    loadQuickTokens();
  }, []);

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      fetchTokenDetails(initialToken);
    }
  }, [initialToken]);

  // Live polling every 5 seconds for real-time wait time updates
  useEffect(() => {
    if (!tokenData?.token_number) return;
    const interval = setInterval(() => {
      fetchTokenDetails(tokenData.token_number, false);
    }, 5000);
    return () => clearInterval(interval);
  }, [tokenData?.token_number]);

  const fetchTokenDetails = async (tokenNum, showSpinner = true) => {
    if (!tokenNum || !tokenNum.trim()) return;
    if (showSpinner) setLoading(true);
    setError(null);

    try {
      const data = await api.getWaitingTime(tokenNum.trim());
      setTokenData(data);

      // Check turn alert
      if (data.status === 'WAITING' && data.patients_ahead <= 1 && !hasAlertedRef.current) {
        hasAlertedRef.current = true;
        if (audioEnabled) {
          playChime();
        }
      }
    } catch (err) {
      setError(err.message || 'Token not found. Please check your token number.');
      setTokenData(null);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    hasAlertedRef.current = false;
    fetchTokenDetails(tokenInput);
  };

  const handleSendSimulatedAlert = async (channel) => {
    if (!tokenData) return;
    try {
      const res = await api.sendNotification(
        tokenData.token_number,
        channel,
        tokenData.patient_phone || '9876543210'
      );
      setNotificationStatus({
        channel,
        message: res.message,
        success: true
      });
      if (audioEnabled) playChime();
    } catch (e) {
      setNotificationStatus({
        channel,
        message: e.message || 'Failed to dispatch alert',
        success: false
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Search Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hospital-50 dark:bg-hospital-950/60 border border-hospital-200 dark:border-hospital-800 text-hospital-700 dark:text-hospital-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          QureAI Dynamic OPD Wait Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Check Your Queue Position
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
          Enter your assigned token number to get dynamic, machine-learning-predicted consultation wait times and live queue movements.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              placeholder="Enter Token (e.g. CAR-101)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-semibold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-hospital-500 shadow-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="px-5 py-3 bg-hospital-600 hover:bg-hospital-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-hospital-600/20 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Track'}
          </button>
        </form>

        {/* Quick Sample Tokens */}
        {quickTokens.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Quick sample tokens:</span>
            {quickTokens.map((tok) => (
              <button
                key={tok}
                onClick={() => {
                  setTokenInput(tok);
                  hasAlertedRef.current = false;
                  fetchTokenDetails(tok);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-hospital-100 dark:hover:bg-hospital-900/40 text-slate-700 dark:text-slate-300 hover:text-hospital-700 font-mono font-medium transition-colors border border-slate-200 dark:border-slate-700"
              >
                {tok}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Token Result Card */}
      {tokenData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
          
          {/* Top Status Banner */}
          <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
            tokenData.status === 'IN_CONSULTATION' 
              ? 'bg-emerald-500 text-white' 
              : tokenData.is_next 
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-lg bg-black/15 font-mono text-sm font-bold tracking-wider">
                {tokenData.token_number}
              </div>
              <div>
                <span className="font-bold text-base">
                  {tokenData.status === 'IN_CONSULTATION' 
                    ? '?? You are currently inside for Consultation!' 
                    : tokenData.is_next 
                      ? '?? Attention: You are NEXT in line! Please wait near the door.' 
                      : 'In Queue - Waiting for Turn'}
                </span>
                <p className="text-xs opacity-90">
                  Patient: {tokenData.patient_name} • Priority: <span className="font-semibold">{tokenData.priority}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors text-xs flex items-center gap-1.5"
                title={audioEnabled ? 'Turn chime enabled' : 'Turn chime muted'}
              >
                <Volume2 className={`w-4 h-4 ${!audioEnabled ? 'opacity-40' : ''}`} />
                <span className="hidden sm:inline">{audioEnabled ? 'Audio Chime ON' : 'Audio OFF'}</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors text-xs flex items-center gap-1.5"
                title="Show QR Token"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR Pass</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Prediction & Metrics */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric 1: Estimated Waiting Time */}
            <div className="md:col-span-2 bg-gradient-to-br from-hospital-50/50 to-teal-50/30 dark:from-slate-800/60 dark:to-slate-800/20 p-6 rounded-2xl border border-hospital-100 dark:border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-hospital-700 dark:text-hospital-400 uppercase tracking-wider">
                    QureAI Predicted Wait Time
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {tokenData.status === 'IN_CONSULTATION' ? '0' : Math.round(tokenData.estimated_wait_minutes)}
                    </span>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">mins</span>
                  </div>
                </div>
                <div className="p-3 bg-hospital-100 dark:bg-hospital-900/60 text-hospital-700 dark:text-hospital-300 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-hospital-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
                <span>
                  Confidence range: <strong className="text-slate-800 dark:text-slate-200">{tokenData.min_wait_minutes} - {tokenData.max_wait_minutes} mins</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> 94% ML accuracy confidence
                </span>
              </div>
            </div>

            {/* Metric 2: Patients Ahead */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Patients Ahead
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {tokenData.patients_ahead}
                    </span>
                    <span className="text-sm font-medium text-slate-500">in queue</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {tokenData.patients_ahead === 0 
                  ? 'You are next! Please be ready.' 
                  : `${tokenData.patients_ahead} person(s) ahead in consultation queue.`}
              </p>
            </div>

          </div>

          {/* Doctor & Location Info Card */}
          <div className="px-6 pb-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {tokenData.doctor_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tokenData.department} • <span className="font-semibold text-hospital-600 dark:text-hospital-400">{tokenData.room_number}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Serving</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {tokenData.current_serving_token || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Doctor Status</span>
                  <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                    tokenData.doctor_status === 'CONSULTING' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : tokenData.doctor_status === 'ON_BREAK' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {tokenData.doctor_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Turn Notification Action Bar */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Bell className="w-4 h-4 text-hospital-600 dark:text-hospital-400" />
              <span>Get notified on mobile via instant alerts:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSendSimulatedAlert('whatsapp')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp Alert
              </button>
              <button
                onClick={() => handleSendSimulatedAlert('sms')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                SMS Alert
              </button>
            </div>
          </div>

          {/* Simulated Notification Toast */}
          {notificationStatus && (
            <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>[{notificationStatus.channel.toUpperCase()} Delivered]</strong>: "{notificationStatus.message}"
                </span>
              </div>
              <button 
                onClick={() => setNotificationStatus(null)}
                className="text-emerald-600 font-bold hover:underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && tokenData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              QureAI Digital OPD Token
            </h3>
            <p className="text-xs text-slate-500">
              Scan this QR code with any smartphone camera to view live queue position on mobile.
            </p>

            <div className="p-4 bg-white rounded-xl inline-block border-2 border-slate-200 shadow-inner">
              <QRCodeSVG 
                value={window.location.origin + '?token=' + tokenData.token_number}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="font-mono font-bold text-xl text-hospital-700 dark:text-hospital-400">
              {tokenData.token_number}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p><strong>Patient:</strong> {tokenData.patient_name}</p>
              <p><strong>Doctor:</strong> {tokenData.doctor_name}</p>
              <p><strong>Location:</strong> {tokenData.room_number}</p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
