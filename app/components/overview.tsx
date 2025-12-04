"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Mengimpor client Supabase

const Overview: React.FC = () => {
  // State untuk menyimpan data pengguna dan statistik
  const [userData, setUserData] = useState<any>(null);
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    completedTasks: 0,
    progress: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser(); // Mendapatkan user yang sedang login
      if (user) {
        try {
          // Ambil data pengguna dari tabel `users`
          const { data, error } = await supabase
            .from("users")
            .select("nama_lengkap, profile_picture, university")
            .eq("id_User", user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error.message);
            setLoading(false);
          } else {
            setUserData(data); // Set data pengguna ke state
          }

          // Fetch statistics for total classes, completed tasks, and progress
          const { data: statisticsData, error: statsError } = await supabase
            .from("statistics") // Replace with the correct table for statistics
            .select("total_classes, completed_tasks, progress")
            .eq("user_id", user.id)
            .single();

          if (statsError) {
            console.error("Error fetching statistics data:", statsError.message);
            setLoading(false);
          } else {
            setStatistics({
              totalClasses: statisticsData.total_classes,
              completedTasks: statisticsData.completed_tasks,
              progress: statisticsData.progress,
            });
          }

        } catch (error) {
          console.error("Error:", error);
          setLoading(false);
        }
      } else {
        console.log("No user logged in.");
        setLoading(false);
      }
    };

    fetchData(); // Call the fetch function when the component mounts
  }, []);

  // If still loading, display loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user data is not available, show default values
  const name = userData?.nama_lengkap || "Althafino!";
  const university = userData?.university || "Universitas Sebelas Maret (UNS)";
  const profilePicture = userData?.profile_picture || "/default-profile.png"; // Use the default image if no profile picture is set

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      {/* Overview Title */}
      <h2 className="text-3xl font-semibold text-[#064479] mb-4">Overview</h2>

      {/* Profile Card with Border */}
      <div className="p-6 border border-gray-300 rounded-lg mb-4">
        <div className="flex items-center">
          <img
            src={profilePicture}
            alt="Profile Picture"
            className="w-20 h-20 rounded-full mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold text-[#064479]">
              Semangat Belajar, {name}
            </h2>
            <p className="text-sm text-gray-500">{university}</p>
          </div>
        </div>
      </div>

      {/* Statistics Card - Now all statistics are in one row */}
      <div className="flex justify-between gap-4 mb-4">
        <div className="p-4 border border-gray-300 rounded-lg text-center w-full">
          <p className="text-xs text-gray-600">Total Kelas</p>
          <h4 className="text-sm font-semibold text-[#064479]">{statistics.totalClasses} Kelas</h4>
        </div>
        <div className="p-4 border border-gray-300 rounded-lg text-center w-full">
          <p className="text-xs text-gray-600">Tugas Selesai</p>
          <h4 className="text-sm font-semibold text-[#064479]">{statistics.completedTasks} Tugas</h4>
        </div>
        <div className="p-4 border border-gray-300 rounded-lg text-center w-full">
          <p className="text-xs text-gray-600">Progress Belajar</p>
          <h4 className="text-sm font-semibold text-[#064479]">{statistics.progress}%</h4>
        </div>
      </div>
    </div>
  );
};

export default Overview;
