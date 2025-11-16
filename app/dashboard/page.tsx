"use client";

import Sidebar from "../components/sidebar";

export default function DashboardPage() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Konten dashboard */}
      <div className="ml-64 p-6 w-full">
        <h1 className="text-3xl font-bold text-[#064479]">Dashboard</h1>
        <p>Ini halaman dashboard kamu.</p>
      </div>
    </div>
  );
}
