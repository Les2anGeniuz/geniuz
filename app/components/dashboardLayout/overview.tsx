"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

const Overview: React.FC = () => {
  // State untuk data user
  const [userData, setUserData] = useState<any>(null);
  
  // State untuk statistik
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    completedTasks: 0, // Dalam skema baru, ini bisa dihitung dari progres 100%
    progress: 0,
  });
  const [faculty, setFaculty] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // 1. Cek User yang sedang login (Auth)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.warn("User belum login.");
          setLoading(false);
          return;
        }

        // 1. Ambil Profil User
        const { data: userProfile, error: userErr } = await supabase
          .from("User")
          .select("id_User, nama_lengkap, email, id_Fakultas")
          .eq("email", user.email)
          .single();

        if (userErr) throw userErr;
        setUserData(userProfile);

        // 2. Ambil Data Fakultas (Jika ada id_Fakultas)
        if (userProfile?.id_Fakultas) {
          const { data: fakData } = await supabase
            .from("Fakultas")
            .select("nama_fakultas")
            .eq("id_Fakultas", userProfile.id_Fakultas)
            .single();
          setFaculty(fakData?.nama_fakultas || "-");
        }

        // 3. Ambil Statistik dari Tabel Progress (Sesuai skema baru API Anda)
        // Kita menghitung rata-rata progress dan jumlah kelas yang diikuti
        const { data: progressData, error: progErr } = await supabase
          .from("Progress")
          .select("Prsentase_Progress, id_Kelas")
          .eq("id_User", userProfile.id_User);

        if (!progErr && progressData) {
          const totalClasses = progressData.length;
          const totalProgress = progressData.reduce((acc, curr) => acc + (curr.Prsentase_Progress || 0), 0);
          const completedTasks = progressData.filter(p => (p.Prsentase_Progress || 0) >= 100).length;
          
          setStatistics({
            totalClasses: totalClasses,
            completedTasks: completedTasks, // Kelas yang sudah 100%
            progress: totalClasses > 0 ? Math.round(totalProgress / totalClasses) : 0,
          });
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-500">Memuat data belajar...</span>
      </div>
    );
  }

  const profilePicture = "/default-profile.png";

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-black mb-3">Overview</h1>

      {/* Bagian Profil */}
      <div className="w-[600px] bg-white border border-gray-200 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="flex-shrink-0">
          <img
            src={profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-50"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
          />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#09090b] mb-1 leading-tight">
            Semangat Belajar, <br className="hidden md:block" />
            {userData?.nama_lengkap || "Siswa"}!
          </h2>
          <p className="text-blue-500 font-bold text-base">
            {faculty || "-"}
          </p>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="flex justify-between w-[600px] gap-6">
        
        {/* Kartu Total Kelas */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Kelas Diikuti</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.totalClasses}</span>
          </div>
        </div>

        {/* Kartu Kelas Selesai */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Kelas Selesai</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.completedTasks}</span>
          </div>
        </div>

        {/* Kartu Rata-rata Progres */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Avg. Progres</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{Math.round(statistics.progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;