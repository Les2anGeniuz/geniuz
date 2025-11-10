import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";
import DashboardStats from "../../components/dashboards/stats";
import DashboardClasses from "../../components/dashboards/classes";
import DashboardActivities from "../../components/dashboards/activities";

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
        </div>

        {/* Isi halaman */}
        <main className="flex-1 px-8 py-6 space-y-8">
          {/* Judul Halaman */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>

          {/* Bagian Statistik */}
          <section>
            <DashboardStats />
          </section>

          {/* Bagian Kelas */}
          <section>
            <DashboardClasses />
          </section>

          {/* Bagian Aktivitas */}
          <section>
            <DashboardActivities />
          </section>
        </main>
      </div>
    </div>
  );
}
