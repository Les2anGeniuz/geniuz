"use client";

import React from 'react';
import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";


import DashboardStats from "../../components/dashboards/stats";
import DashboardClasses from "../../components/dashboards/classes";
import DashboardActivities from "../../components/dashboards/activities";


import { useEffect, useState } from "react";

const Calendar = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysArray = [];
  let week = [];
  let dayOfWeek = (firstDay + 6) % 7; // convert to 0=Mon
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

// Revenue & Finance Section
const RevenueFinance: React.FC = () => {
  const [data, setData] = useState({
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
        const res = await fetch(`${backendUrl}/api/admin/analytics`, {
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
              {data.paymentIssues.map((p: any) => (
                <li key={p.id_Pembayaran || p.tanggal_bayar}>
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

// KPI Cards Section
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

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
        // Fetch siswa, mentor, fakultas from their own APIs and count array length if countOnly is not supported
        const [siswaRes, mentorRes, fakultasRes] = await Promise.all([
          fetch(`${backendUrl}/api/admin/siswa`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/api/admin/mentor`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/api/admin/fakultas`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [siswa, mentor, fakultas] = await Promise.all([
          siswaRes.json(),
          mentorRes.json(),
          fakultasRes.json(),
        ]);
        // The rest can still use analytics for now
        const res = await fetch(`${backendUrl}/api/admin/analytics`, {
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Kelas</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : kpi.totalKelas}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Siswa Aktif</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : kpi.siswaAktif}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Mentor</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : kpi.totalMentor}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Fakultas</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : kpi.totalFakultas}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Materi</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : kpi.totalMateri}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Tugas</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : kpi.totalTugas}</p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      {/* Sidebar kiri */}
      <SidebarAdmin />

      {/* Konten utama kanan */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar di atas */}
        <div className="sticky top-0 z-50 bg-white shadow-sm h-16 flex items-center">
          <Navbar />
        </div>

        {/* Isi halaman */}
        <main className="flex-1 px-8 pt-6 pb-8 space-y-6">
          {/* KPI Cards */}
          <KPICards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Kelas Terbaru */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-[#002D5B] mb-4">Kelas Terbaru</h2>
                <DashboardClasses />
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Calendar */}
              <Calendar />
              {/* Activities di bawah Calendar */}
              <DashboardActivities />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}