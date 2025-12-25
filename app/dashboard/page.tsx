"use client";

import Sidebar from "../components/dashboardLayout/sidebar";
import Topbar from "../components/dashboardLayout/topbar";
import Overview from "../components/dashboardLayout/overview";
import SearchBar from "../components/dashboardLayout/searchbar";
import Activities from "../components/dashboardLayout/activity";  // Card Tugas Aktif
import StatisticsChart from "../components/dashboardLayout/statisticChart"; 
import Achievements from "../components/dashboardLayout/achievement"; 
import MyClasses from "../components/dashboardLayout/myClasses";  // Kelas Saya tetap ada di sebelah kiri
import ActiveTasks from "../components/dashboardLayout/activeTasks";  // Card Tugas Aktif Baru

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar tetap di kiri */}
      <Sidebar />
      
      {/* Topbar tetap di atas */}
      <Topbar />

      <div className="ml-64 pt-24 px-8 pb-10 w-full">
        
        {/* Search Bar di kanan atas */}
        <div className="flex justify-end mb-6">
          <SearchBar />
        </div>

        {/* GRID UTAMA 
          xl:flex-row akan membuat dua kolom pada layar besar.
          items-start agar tinggi box kiri dan kanan tidak saling memaksa.
        */}
        <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
          
          {/* === KOLOM KIRI (Lebar Tetap 600px sesuai desain Overview) === */}
          <div className="flex flex-col gap-6 w-full xl:w-[600px] flex-shrink-0">
            {/* Kartu Profil & Stat Angka */}
            <Overview />
            
            {/* Kartu Grafik Pie */}
            <StatisticsChart />
            
            {/* Kartu List Kelas (Di bawah statistik) */}
            <MyClasses />
          </div>

          {/* === KOLOM KANAN (Tugas Aktif + Pencapaian) === */}
          <div className="flex-1 w-full min-w-[400px] flex flex-col gap-6">
            {/* Kartu Tugas Aktif (Sesuai Gambar) */}
            <Activities />
            
            {/* Kartu Achievement / Sertifikat */}
            <Achievements />
            
            {/* Kartu Tugas Aktif Baru */}
            <ActiveTasks />  {/* Card Tugas Aktif ditambahkan di bawah Pencapaian */}
          </div>

        </div>
      </div>
    </div>
  );
}
