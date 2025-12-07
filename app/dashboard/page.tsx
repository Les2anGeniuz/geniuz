"use client";

import Sidebar from "../components/dashboardLayout/sidebar";
import Topbar from "../components/dashboardLayout/topbar";
import Overview from "../components/dashboardLayout/overview";
import SearchBar from "../components/dashboardLayout/searchbar";
import Activities from "../components/dashboardLayout/activity"; 
import StatisticsChart from "../components/dashboardLayout/statisticChart"; 
import Achievements from "../components/dashboardLayout/achievement"; // 1. Import komponen baru

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <div className="ml-64 pt-24 px-8 pb-10 w-full">
        
        {/* Search Bar di kanan atas */}
        <div className="flex justify-end mb-6">
          <SearchBar />
        </div>

        {/* GRID LAYOUT 
           Kita gunakan flex-col untuk mobile, dan flex-row untuk desktop.
           items-start penting agar tinggi kolom independen.
        */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* === KOLOM KIRI (Overview + Statistics) === */}
          <div className="flex flex-col gap-6 w-full xl:w-[600px] flex-shrink-0">
            <Overview />
            <StatisticsChart />
          </div>

          {/* === KOLOM KANAN (Activities + Achievements) === */}
          {/* Tambahkan flex-col gap-6 agar ada jarak antar card */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-6"> 
            <Activities />
            
            {/* 2. Pasang Achievements di sini (di bawah Activities) */}
            <Achievements />
          </div>

        </div>
      </div>
    </div>
  );
}