"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalKelas: 0,
    siswaAktif: 0,
    ratePenyelesaian: 0,
    waktuBelajar: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: Kelas } = await supabase.from("Kelas").select("id_kelas");
      const { data: Siswa } = await supabase.from("Siswa").select("id_siswa");

      setStats({
        totalKelas: Kelas?.length || 0,
        siswaAktif: Siswa?.length || 0,
        ratePenyelesaian: 87,
        waktuBelajar: 4.2,
      });
    };

    fetchStats();
  }, []);

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
        <p className="text-sm font-medium text-gray-500">Rate Penyelesaian</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.ratePenyelesaian}%</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Rata-Rata Waktu Belajar</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.waktuBelajar}h</p>
      </div>
    </div>
  );
}
