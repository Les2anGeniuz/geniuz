import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      {/* Sidebar kiri */}
      <SidebarAdmin />

      {/* Konten utama kanan */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar di atas */}
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <Navbar />

        {/* Isi halaman */}
        <main className="flex-1 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
            {/* nanti contentnya di isinya di sini */}
        </main>
        </div>
      </div>
    </div>
  );
}
