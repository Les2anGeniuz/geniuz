"use client";
import { useEffect, useState } from "react";


export default function DashboardStats() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const [stats, setStats] = useState({
    totalKelas: 0,
    siswaAktif: 0,
    totalMentor: 0,
    totalFakultas: 0,
    totalMateri: 0,
    totalTugas: 0,
    waktuBelajar: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
        if (!token) {
          setError("Admin token not found. Please login again.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${backendUrl}/api/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Gagal mengambil data statistik dashboard");
        }
        const data = await res.json();
        setStats({
          totalKelas: data.kpis?.totalKelas ?? 0,
          siswaAktif: data.kpis?.siswaAktif ?? 0,
          totalMentor: data.kpis?.totalMentor ?? 0,
          totalFakultas: data.kpis?.totalFakultas ?? 0,
          totalMateri: data.kpis?.totalMateri ?? 0,
          totalTugas: data.kpis?.totalTugas ?? 0,
          waktuBelajar: data.kpis?.avgStudyHoursPerDay ?? 0,
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="mb-6">Loading statistik...</div>;
  }
  if (error) {
    return <div className="mb-6 text-red-500">{error}</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Kelas</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalKelas}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Siswa Aktif</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.siswaAktif}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Mentor</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMentor}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Fakultas</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFakultas}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Materi</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMateri}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Total Tugas</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTugas}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Rata-Rata Waktu Belajar</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.waktuBelajar} jam</p>
      </div>
    </div>
  );
}
