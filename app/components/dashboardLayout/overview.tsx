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
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: userRow, error: userErr } = await supabase
          .from("User")
          .select("nama_lengkap, university, faculty_id, class_id")
          .eq("email", user.email)
          .single();

        if (userErr) console.error("Error fetching user row:", userErr);
        if (userRow) {
          setUserData(userRow);
          if (userRow.faculty_id) await fetchFacultyName(String(userRow.faculty_id));
          else setFaculty("-");
        }

        const { data: stats, error: statsErr } = await supabase
          .from("statistics")
          .select("total_classes, completed_tasks, progress")
          .eq("user_id", user.id)
          .maybeSingle();

        if (statsErr) console.error("Error fetching stats:", statsErr);
        if (stats) {
          setStatistics({
            totalClasses: stats.total_classes || 0,
            completedTasks: stats.completed_tasks || 0,
            progress: stats.progress || 0,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    // The backend route is app/api/fakultas; fetch all and find the matching id.
    const fetchFacultyName = async (facultyId: string) => {
      try {
        const res = await fetch(`/api/fakultas`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: any[] = json?.data ?? [];
        const found = list.find((f) => String(f.id_Fakultas) === String(facultyId));
        setFaculty(found?.nama_fakultas || "-");
      } catch (e) {
        console.error("Error fetching fakultas:", e);
        setFaculty("-");
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-gray-400">Sedang memuat data...</div>;

  const name = userData?.nama_lengkap || "-";
  const university = userData?.university || "-"; 
  const profilePicture = "/default-profile.png"; 

  return (
    // PENTING: Container luar tanpa padding, tapi isinya tetap w-[600px]
    <div className="w-full"> 
      <h1 className="text-3xl font-semibold text-black mb-3">Overview</h1>

      {/* Bagian Profil TETAP w-[600px] */}
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
            {name}!
          </h2>
          <p className="text-gray-600 text-lg mb-1 font-medium">{university}</p>
          <p className="text-blue-500 font-bold text-base cursor-pointer hover:underline">
            {faculty}
          </p>
        </div>
      </div>

      {/* Grid Statistik TETAP w-[600px] dan Flex layout */}
      <div className="flex justify-between w-[600px] gap-6 mx-auto">

        {/* Kartu Total Kelas */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Total Kelas</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-[#09090b]">{statistics.totalClasses}</span>
          </div>
        </div>

        {/* Kartu Tugas Selesai */}
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

        {/* Kartu Progres Belajar */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center h-32">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Progres Belajar</span>
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