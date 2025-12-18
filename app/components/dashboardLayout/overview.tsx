"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

const Overview: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    completedTasks: 0,
    progress: 0,
  });
  const [faculty, setFaculty] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Ambil Session User dari Supabase Auth
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        
        if (sessionErr) throw sessionErr;
        const user = session?.user;

        if (!user) {
          console.log("Log: Tidak ada session user ditemukan.");
          setLoading(false);
          return;
        }

        console.log("Log: Email user dari Auth:", user.email);

        // 2. Ambil Profil User dari Tabel Database
        // Pastikan nama tabel 'User' sudah benar (Case Sensitive)
        const { data: userProfile, error: userErr } = await supabase
          .from("User")
          .select("id_User, nama_lengkap, email, id_Fakultas")
          .eq("email", user.email)
          .maybeSingle();

        if (userErr) {
          console.error("Log Error: Gagal ambil profil user:", userErr.message);
        } else if (!userProfile) {
          console.log("Log: User Auth ada, tapi data di tabel 'User' tidak ditemukan untuk email ini.");
        } else {
          console.log("Log: Data profil ditemukan:", userProfile);
          setUserData(userProfile);

          // 3. Ambil Data Fakultas jika ada id_Fakultas
          if (userProfile.id_Fakultas) {
            const { data: fakData } = await supabase
              .from("Fakultas")
              .select("nama_fakultas")
              .eq("id_Fakultas", userProfile.id_Fakultas)
              .maybeSingle();
            
            if (fakData) {
              setFaculty(fakData.nama_fakultas);
            }
          }

          // 4. Ambil Statistik dari Tabel Progress
          const { data: progressData, error: progErr } = await supabase
            .from("Progress")
            .select("Prsentase_Progress, id_Kelas")
            .eq("id_User", userProfile.id_User);

          if (progErr) {
            console.error("Log Error: Gagal ambil data progress:", progErr.message);
          } else if (progressData) {
            const totalClasses = progressData.length;
            const totalProgress = progressData.reduce((acc, curr) => acc + (curr.Prsentase_Progress || 0), 0);
            const completedTasks = progressData.filter(p => (p.Prsentase_Progress || 0) >= 100).length;
            
            setStatistics({
              totalClasses,
              completedTasks,
              progress: totalClasses > 0 ? Math.round(totalProgress / totalClasses) : 0,
            });
          }
        }

      } catch (error) {
        console.error("Log Error: Terjadi kesalahan sistem:", error);
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

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-black mb-3">Overview</h1>

      {/* Bagian Profil */}
      <div className="w-[600px] bg-white border border-gray-200 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
             {/* Inisial sebagai fallback jika gambar tidak ada */}
             <span className="text-4xl font-bold text-gray-400">
                {userData?.nama_lengkap ? userData.nama_lengkap.charAt(0).toUpperCase() : "S"}
             </span>
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#09090b] mb-1 leading-tight">
            Semangat Belajar, <br className="hidden md:block" />
            {userData?.nama_lengkap || "Siswa"}!
          </h2>
          <p className="text-blue-500 font-bold text-base">
            {faculty || "Fakultas Belum Terdaftar"}
          </p>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="flex justify-between w-[600px] gap-6">
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-gray-500 font-medium text-sm">Kelas Diikuti</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.totalClasses}</span>
          </div>
        </div>

        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-gray-500 font-medium text-sm">Kelas Selesai</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.completedTasks}</span>
          </div>
        </div>

        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-gray-500 font-medium text-sm">Avg. Progres</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;