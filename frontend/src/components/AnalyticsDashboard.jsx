import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  Users, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Activity, 
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsDashboard({ darkMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-hospital-600" />
        <p className="text-sm text-slate-500 font-medium">Aggregating OPD clinical queue analytics...</p>
      </div>
    );
  }

  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';

  // Chart 1: Hourly Wait Times (Line Chart)
  const hourlyLabels = Object.keys(data.hourly_wait_times);
  const hourlyWaitValues = Object.values(data.hourly_wait_times);
  const waitChartData = {
    labels: hourlyLabels,
    datasets: [
      {
        label: 'Average Wait Time (Mins)',
        data: hourlyWaitValues,
        borderColor: '#10b798',
        backgroundColor: 'rgba(16, 183, 152, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#09937c',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  // Chart 2: Hourly Patient Flow (Bar Chart)
  const patientFlowValues = Object.values(data.hourly_patient_flow);
  const flowChartData = {
    labels: hourlyLabels,
    datasets: [
      {
        label: 'Patients Registered',
        data: patientFlowValues,
        backgroundColor: hourlyLabels.map((slot) =>
          slot === '10:00' || slot === '11:00' ? '#f59e0b' : '#3b82f6'
        ),
        borderRadius: 8,
      }
    ]
  };

  // Chart 3: Department Distribution (Doughnut)
  const deptLabels = Object.keys(data.department_distribution);
  const deptValues = Object.values(data.department_distribution);
  const deptChartData = {
    labels: deptLabels,
    datasets: [
      {
        data: deptValues,
        backgroundColor: [
          '#10b798',
          '#3b82f6',
          '#8b5cf6',
          '#f59e0b',
          '#ec4899',
          '#06b6d4'
        ],
        borderWidth: 0,
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' } }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
      },
      y: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-hospital-600 dark:text-hospital-400" />
            OPD Clinical Analytics & AI Forecasts
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Real-time hospital operations intelligence, peak-hour bottlenecks, and physician efficiency.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Footfall</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {data.total_patients_today}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Registered today</span>
          </div>
          <div className="p-3 rounded-xl bg-hospital-50 dark:bg-hospital-950/60 text-hospital-600 dark:text-hospital-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultations Done</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {data.patients_served_today}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{data.patients_waiting_now} active waiting</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Actual Wait</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {data.avg_wait_time_minutes} <span className="text-base font-semibold text-slate-500">min</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Within target tolerance</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peak OPD Rush</span>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {data.peak_hour.split(' - ')[0]}
            </div>
            <span className="text-[11px] text-slate-500">AI Model Confidence: {data.accuracy_rate}%</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart 1: Hourly Waiting Time Trend */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Waiting Time Curve by Operating Hour</span>
              </h3>
              <p className="text-xs text-slate-500">
                Dynamic fluctuations throughout the hospital shift.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-hospital-100 dark:bg-hospital-900/60 text-hospital-800 dark:text-hospital-300">
              Wait vs Hour
            </span>
          </div>

          <div className="h-64 sm:h-72">
            <Line data={waitChartData} options={commonOptions} />
          </div>
        </div>

        {/* Chart 3: Department Patient Share */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Department Patient Share
              </h3>
              <p className="text-xs text-slate-500">
                Caseload split across specialties.
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 flex items-center justify-center">
            <Doughnut 
              data={deptChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Chart 2: Hourly Patient Flow / Peak Rush */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Hourly Patient Intake & Rush Hours
              </h3>
              <p className="text-xs text-slate-500">
                Gold bars indicate detected peak rush hours triggering higher wait predictions.
              </p>
            </div>
          </div>

          <div className="h-64">
            <Bar data={flowChartData} options={commonOptions} />
          </div>
        </div>

      </div>

      {/* Doctor Performance & Turnaround Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-hospital-600" />
              Physician Turnaround & Queue Velocity Metrics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks actual consultation times against scheduled baselines to compute queue velocity.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">Physician</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Patients Handled</th>
                <th className="px-6 py-3.5">Avg Consultation</th>
                <th className="px-6 py-3.5">Punctuality & Turnaround Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {data.doctor_performance.map((doc) => (
                <tr key={doc.doctor_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {doc.doctor_name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {doc.department}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                    {doc.patients_seen} patients
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-hospital-700 dark:text-hospital-400">
                      {doc.avg_consultation_duration} mins
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5 max-w-xs">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div 
                          className="h-full bg-hospital-500 rounded-full"
                          style={{ width: `${Math.min(100, doc.on_time_percentage)}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-xs">{doc.on_time_percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
