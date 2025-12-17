"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

const Overview: React.FC = () => {
  // State untuk data user
  const [userData, setUserData] = useState<any>(null);
  
  // State untuk statistik
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    completedTasks: 0,
    progress: 0,
  });

  // State pendukung
  const [faculty, setFaculty] = useState<string>("-"); 
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Cek User yang sedang login (Auth)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.warn("User belum login.");
          setLoading(false);
          return;
        }

        const userEmail = session.user.email;
        const token = session.access_token;

        // 2. Coba ambil data dari API (/api/me)
        let profileFound = null;
        let statsFound = null;

        try {
          const res = await fetch(`/api/me`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const json = await res.json();
            profileFound = json.profile;
            statsFound = json.stats;
          } else {
            console.warn("API Error (Mungkin beda nama kolom), mencoba Fallback ke Client...");
          }
        } catch (apiErr) {
          console.error("Gagal fetch API, lanjut ke Fallback...", apiErr);
        }

        // 3. LOGIKA FALLBACK (Penting jika API masih error)
        // Jika API gagal atau tidak mengembalikan profile, kita ambil langsung dari tabel 'User'
        if (!profileFound && userEmail) {
          const { data: directProfile, error: directErr } = await supabase
            .from("User") // Pastikan nama tabel sesuai Case Sensitive
            .select("nama_lengkap, id_User") // Kita ambil kolom yang PASTI ADA di screenshot kamu
            .eq("email", userEmail)
            .maybeSingle();

          if (directErr) {
            console.error("Fallback error:", directErr);
          } else {
            profileFound = directProfile;
          }
        }

        // 4. Update State Profile
        if (profileFound) {
          setUserData(profileFound);
          
          // Cek fakultas (jika ada kolom id_Fakultas nanti)
          // Menggunakan optional chaining (?.) agar tidak error jika kolom tidak ada
          const idFakultas = profileFound.id_Fakultas || profileFound.faculty_id;
          if (idFakultas) {
            fetchFacultyName(String(idFakultas));
          }
        }

        // 5. Update State Statistics (Ambil dari API atau default 0)
        if (statsFound) {
          setStatistics({
            totalClasses: statsFound.total_classes || 0,
            completedTasks: statsFound.completed_tasks || 0,
            progress: statsFound.progress || 0,
          });
        }

      } catch (error) {
        console.error("Critical Error di Overview:", error);
      } finally {
        setLoading(false);
      }
    };

    // Helper: Ambil nama fakultas
    const fetchFacultyName = async (facultyId: string) => {
      try {
        const res = await fetch(`/api/fakultas`);
        if (!res.ok) return;
        const json = await res.json();
        const list: any[] = json?.data ?? [];
        const found = list.find((f) => String(f.id_Fakultas) === String(facultyId));
        setFaculty(found?.nama_fakultas || "-");
      } catch (e) { 
        /* Silent error */ 
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Sedang memuat data...</div>;

  // Data Tampilan
  const displayName = userData?.nama_lengkap || "Mahasiswa";
  // Gunakan gambar default karena di tabel User kamu belum ada kolom 'profile_picture'
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
            Semangat Belajar, <br className="hidden md:block"/>
            {displayName}!
          </h2>
          <p className="text-blue-500 font-bold text-base cursor-pointer hover:underline">
            {faculty}
          </p>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="flex justify-between w-[600px] gap-6 mx-auto">
        
        {/* Total Kelas */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Total Kelas</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.totalClasses}</span>
          </div>
        </div>

        {/* Tugas Selesai */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Tugas Selesai</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.completedTasks}</span>
          </div>
        </div>

        {/* Progres Belajar */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Progres</span>
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