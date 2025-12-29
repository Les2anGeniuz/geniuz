"use client";

import React, { useEffect, useState } from 'react';
import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";
import DashboardStats from "../../components/dashboards/stats";
import DashboardClasses from "../../components/dashboards/classes";
import DashboardActivities from "../../components/dashboards/activities";
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);
const SiswaPerFakultasPieChart = () => {
  const [chartData, setChartData] = useState<{ labels: string[]; counts: number[] }>({ labels: [], counts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) return setLoading(false);
        const fakultasRes = await fetch(`${API}/api/admin/fakultas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fakultasJson = await fakultasRes.json();
        const fakultasList: any[] = Array.isArray(fakultasJson.fakultas) ? fakultasJson.fakultas : (fakultasJson.data || []);
        const siswaRes = await fetch(`${API}/api/admin/siswa`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const siswaJson = await siswaRes.json();
        const siswaList: any[] = Array.isArray(siswaJson.siswa) ? siswaJson.siswa : (siswaJson.data || []);
        const countMap: Record<string, number> = {};
        siswaList.forEach((s: any) => {
          const namaFakultas = s.fakultas;
          if (namaFakultas) countMap[namaFakultas] = (countMap[namaFakultas] || 0) + 1;
        });
        const labels: string[] = fakultasList.map((f: any) => f.nama_fakultas);
        const counts: number[] = labels.map((nama: string) => countMap[nama] || 0);
        setChartData({ labels, counts });
      } catch {
        setChartData({ labels: [], counts: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const colors = [
    '#2563eb', '#0ea5e9', '#1e293b', '#facc15', '#e0e7ef', '#f8fafc', '#60a5fa', '#dbeafe', '#fef9c3', '#fff'
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col items-center justify-center w-full h-full">
      <h2 className="text-lg font-semibold text-[#002D5B] mb-4">Distribusi Siswa per Fakultas</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="w-full" style={{ aspectRatio: '1 / 1', minHeight: 0 }}>
          <Pie
            data={{
              labels: chartData.labels,
              datasets: [{
                data: chartData.counts,
                backgroundColor: colors.slice(0, chartData.labels.length),
              }]
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
              maintainAspectRatio: false,
              responsive: true,
            }}
          />
        </div>
      )}
    </div>
  );
};

const NewStudentsBarChart = ({ horizontal = false }: { horizontal?: boolean }) => {
  const [chartData, setChartData] = useState<{ months: string[]; counts: number[] }>({ months: [], counts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) return setLoading(false);
        const res = await fetch(`${API}/api/admin/new-students-monthly`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setChartData({
          months: json.months ?? [],
          counts: json.counts ?? [],
        });
      } catch {
        setChartData({ months: [], counts: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 h-[350px] w-full">
      <h2 className="text-lg font-semibold text-[#002D5B] mb-4">Siswa Baru per Bulan</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="w-full h-[260px]">
          <Bar
            data={{
              labels: chartData.months,
              datasets: [{
                label: 'Siswa Baru',
                data: chartData.counts,
                backgroundColor: '#2563eb',
                borderRadius: 6,
                maxBarThickness: 32,
              }]
            }}
            options={{
              indexAxis: horizontal ? 'y' : 'x',
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: horizontal
                ? { x: { beginAtZero: true } }
                : {
                    y: { beginAtZero: true },
                    x: {
                      ticks: {
                        font: { size: 11 },
                        maxRotation: 40,
                        minRotation: 20,
                        color: '#334155',
                        autoSkip: false,
                      },
                    },
                  }
            }}
          />
        </div>
      )}
    </div>
  );
};

const RevenueLineChart = () => {
  const [chartData, setChartData] = useState<{ months: string[]; revenues: number[] }>({ months: [], revenues: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) return setLoading(false);
        const res = await fetch(`${API}/api/admin/revenue-monthly`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
          'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];
        const months = monthNames.map(m => `${m} ${year}`);
        const revenueMap: Record<string, number> = {};
        (json.months || []).forEach((m: string, i: number) => { revenueMap[m] = json.revenues[i]; });
        const revenues: number[] = months.map((m: string) => revenueMap[m] || 0);
        setChartData({ months, revenues });
      } catch {
        setChartData({ months: [], revenues: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  const chartRef = React.useRef<any>(null);
  const getAuroraGradient = (ctx: CanvasRenderingContext2D, area: any) => {
    const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    gradient.addColorStop(0, 'rgba(37,99,235,0.35)');
    gradient.addColorStop(0.3, 'rgba(139,92,246,0.18)');
    gradient.addColorStop(0.7, 'rgba(16,185,129,0.13)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.05)');
    return gradient;
  };


  const data = {
    labels: chartData.months,
    datasets: [
      {
        label: 'Revenue',
        data: chartData.revenues,
        borderColor: '#2563eb',
        borderWidth: 3,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return 'rgba(37,99,235,0.1)';
          return getAuroraGradient(ctx, chartArea);
        },
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#2563eb',
      }
    ]
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold text-[#002D5B] mb-4">Revenue Bulanan</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Line
          ref={chartRef}
          data={data}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }}
        />
      )}
    </div>
  );
};

const Calendar = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysArray = [];
  let week = [];
  let dayOfWeek = (firstDay + 6) % 7;
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      daysArray.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    daysArray.push(week);
  }
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="text-lg font-semibold text-[#002D5B] mb-4">{monthName} {year}</div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500 mb-2">{day}</div>
        ))}
        {daysArray.flat().map((day, idx) => (
          <div
            key={idx}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors ${
              day === today.getDate()
                ? 'bg-[#002D5B] text-white font-semibold'
                : !day
                ? 'text-gray-300'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

const RevenueFinance: React.FC = () => {
  const [data, setData] = useState<{
    totalRevenue: number;
    paymentIssues: any[];
    subscriptionStatus: { aktif: number; expired: number; akanExpired: number };
    loading: boolean;
  }>({
    totalRevenue: 0,
    paymentIssues: [],
    subscriptionStatus: { aktif: 0, expired: 0, akanExpired: 0 },
    loading: true,
  });
  useEffect(() => {
    const fetchData = async () => {
      setData((d) => ({ ...d, loading: true }));
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) return setData((d) => ({ ...d, loading: false }));
        const res = await fetch(`${API}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData({
          totalRevenue: json.kpis?.totalRevenue ?? 0,
          paymentIssues: json.kpis?.paymentIssues ?? [],
          subscriptionStatus: json.kpis?.subscriptionStatus ?? { aktif: 0, expired: 0, akanExpired: 0 },
          loading: false,
        });
      } catch {
        setData((d) => ({ ...d, loading: false }));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold text-[#002D5B] mb-4">💰 Revenue & Finance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-lg border bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">Monthly Revenue</div>
          <div className="text-2xl font-bold text-gray-900">{data.loading ? '-' : `Rp${data.totalRevenue.toLocaleString('id-ID')}`}</div>
        </div>
        <div className="p-4 rounded-lg border bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">Payment Issues</div>
          {data.loading ? (
            <div>-</div>
          ) : data.paymentIssues.length === 0 ? (
            <div className="text-green-600 text-sm">Tidak ada masalah pembayaran</div>
          ) : (
            <ul className="text-xs text-red-600 space-y-1 max-h-20 overflow-y-auto">
              {data.paymentIssues.map((p: any, idx: number) => (
                <li key={p.id_Pembayaran || p.tanggal_bayar || idx}>
                  {p.status_pembayaran} - Rp{Number(p.jumlah_bayar).toLocaleString('id-ID')} ({new Date(p.tanggal_bayar).toLocaleDateString('id-ID')})
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 rounded-lg border bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">Subscription Status</div>
          {data.loading ? (
            <div>-</div>
          ) : (
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-green-700">Aktif: {data.subscriptionStatus.aktif}</span>
              <span className="text-yellow-700">Akan Expired: {data.subscriptionStatus.akanExpired}</span>
              <span className="text-red-700">Expired: {data.subscriptionStatus.expired}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const KPICards: React.FC = () => {
  const [kpi, setKpi] = useState({
    totalKelas: 0,
    siswaAktif: 0,
    totalMentor: 0,
    totalFakultas: 0,
    totalMateri: 0,
    totalTugas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPI = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) {
          setKpi({
            totalKelas: 0,
            siswaAktif: 0,
            totalMentor: 0,
            totalFakultas: 0,
            totalMateri: 0,
            totalTugas: 0,
          });
          setLoading(false);
          return;
        }
        const [siswaRes, mentorRes, fakultasRes] = await Promise.all([
          fetch(`${API}/api/admin/siswa`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/admin/mentor`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/admin/fakultas`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [siswa, mentor, fakultas] = await Promise.all([
          siswaRes.json(),
          mentorRes.json(),
          fakultasRes.json(),
        ]);
        const res = await fetch(`${API}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setKpi({
          totalKelas: data.kpis?.totalKelas ?? 0,
          siswaAktif: Array.isArray(siswa.data) ? siswa.data.length : (Array.isArray(siswa.siswa) ? siswa.siswa.length : 0),
          totalMentor: Array.isArray(mentor.mentor) ? mentor.mentor.length : 0,
          totalFakultas: Array.isArray(fakultas.fakultas) ? fakultas.fakultas.length : 0,
          totalMateri: data.kpis?.totalMateri ?? 0,
          totalTugas: data.kpis?.totalTugas ?? 0,
        });
      } catch (e) {
        setKpi({
          totalKelas: 0,
          siswaAktif: 0,
          totalMentor: 0,
          totalFakultas: 0,
          totalMateri: 0,
          totalTugas: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchKPI();
  }, []);

  const icons = [
    <svg key="kelas" className="w-7 h-7 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M4 10h16"/></svg>,
    <svg key="siswa" className="w-7 h-7 text-[#1e293b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>,
    <svg key="mentor" className="w-7 h-7 text-[#facc15]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M2 20v-2a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2"/></svg>,
    <svg key="fakultas" className="w-7 h-7 text-[#0ea5e9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>,
    <svg key="materi" className="w-7 h-7 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 2v4M16 2v4"/></svg>,
    <svg key="tugas" className="w-7 h-7 text-[#facc15]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12h6"/></svg>,
  ];

  const cardData = [
    { label: 'Total Kelas', value: loading ? '-' : kpi.totalKelas, icon: icons[0] },
    { label: 'Siswa Aktif', value: loading ? '-' : kpi.siswaAktif, icon: icons[1] },
    { label: 'Total Mentor', value: loading ? '-' : kpi.totalMentor, icon: icons[2] },
    { label: 'Total Fakultas', value: loading ? '-' : kpi.totalFakultas, icon: icons[3] },
    { label: 'Total Materi', value: loading ? '-' : kpi.totalMateri, icon: icons[4] },
    { label: 'Total Tugas', value: loading ? '-' : kpi.totalTugas, icon: icons[5] },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cardData.map((card, i) => (
        <div
          key={card.label}
          className="relative group bg-[#f7f7f8] border border-[#d1d5db] hover:border-[#2563eb] rounded-xl p-5 transition-all duration-200 hover:bg-[#e8f0fa] min-h-[120px] flex flex-col justify-between cursor-pointer shadow-none"
        >
          {/* Judul*/}
          <div className="flex justify-between items-start">
            <span className="font-semibold text-base md:text-lg text-[#002D5B] group-hover:text-[#2563eb] leading-tight">{card.label}</span>
          </div>
          {/* Angka pojok kiri bawah dan icon pojok kanan bawah */}
          <div className="flex items-end justify-between mt-8">
            <span className="font-bold text-2xl md:text-3xl text-[#1e293b] group-hover:text-[#2563eb]">{card.value}</span>
            <span className="self-end ml-2 mb-1 opacity-90 text-[#2563eb]">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [subscriptionStatus, setSubscriptionStatus] = useState({ aktif: 0, expired: 0, akanExpired: 0 });
  useEffect(() => {
    const fetchStatus = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      if (!token) return;
      const res = await fetch(`${API}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setSubscriptionStatus(json.kpis?.subscriptionStatus ?? { aktif: 0, expired: 0, akanExpired: 0 });
    };
    fetchStatus();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar tetap */}
      <SidebarAdmin />

      <div className="flex-1 flex flex-col ml-64 transition-all duration-300 pt-16">
        {/* Use only the fixed Navbar, remove sticky wrapper */}
        <Navbar />

        <main className="relative flex-1 p-8 overflow-y-auto">
            <div className="mb-6 mt-8">
            <h1 className="text-3xl font-bold text-[#002D5B]">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening.</p>
            </div>
          {/* 1. Top KPI Cards */}
          <div className="relative z-10 mt-4">
            <KPICards />
          </div>

          {/* 2. Main Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left: Revenue Chart (Takes 2 columns) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <RevenueLineChart />
              <NewStudentsBarChart />
            </div>

            {/* Right: Calendar + Pie Chart (Takes 1 column) */}
            <div className="flex flex-col gap-6">
                <Calendar />
                <SiswaPerFakultasPieChart />
            </div>
          </div>

          {/* 3. Bottom Section: Recent Activity & Classes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-slate-800">Recent Classes</h4>
                        <a href="/admin/kelas" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
                    </div>
                    <div className="overflow-hidden">
                        <DashboardClasses />
                    </div>
                </div>
            </div>
            <DashboardActivities />
          </div>

        </main>
      </div>
    </div>
  );
}