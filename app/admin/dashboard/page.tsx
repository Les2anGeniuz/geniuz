import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";
import DashboardStats from "../../components/dashboards/stats";
import DashboardActivities from "../../components/dashboards/activities";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      {/* Sidebar kiri */}
      <SidebarAdmin />

      {/* Konten utama kanan */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar di atas */}
        <div className="sticky top-0 z-50 bg-white shadow-sm h-16 flex items-center">
          <Navbar />
        </div>

        {/* Isi halaman */}
        <main className="flex-1 px-8 pt-4 pb-6 space-y-6">
          {/* Judul Halaman */}
          <h1 className="text-3xl font-bold text-[#002D5B] mb-4">Dashboard</h1>

          {/* Bagian Statistik */}
          <section>
            <DashboardStats />
          </section>

          {/* Bagian Kelas
          <section className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-[#002D5B] mb-3">
              Kelas Terbaru
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              5 kelas terbaru yang tersedia
            </p>

            <DashboardClasses />
          </section> */}

          {/* Bagian Aktivitas */}
          <section>
            <DashboardActivities />
          </section>
        </main>
      </div>
    </div>
  );
}
