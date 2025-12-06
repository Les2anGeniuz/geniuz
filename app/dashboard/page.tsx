"use client";

import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import Overview from "../components/overview";   // Komponen Overview
import SearchBar from "../components/searchbar"; // Komponen SearchBar

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Posisi Fixed di kiri */}
      <Sidebar />

      {/* Topbar - Posisi Fixed di atas */}
      <Topbar />

      {/* Search Bar */}
      {/* Catatan: Pastikan CSS di SearchBar tidak menimpa Topbar sepenuhnya jika tidak diinginkan */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
        <SearchBar />
      </div>

      {/* Main Content Area */}
      {/* ml-64 memberi ruang untuk Sidebar, pt-24 memberi ruang untuk Topbar */}
      <div className="ml-64 pt-24 p-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menampilkan Overview */}
          <Overview />
        </div>
      </div>
    </div>
  );
}