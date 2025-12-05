import SidebarAdmin from "../../components/layouts/sidebarAdmin";
import Navbar from "../../components/layouts/navbarAdmin";
import DashboardStats from "../../components/dashboards/stats";
import DashboardClasses from "../../components/dashboards/classes";
import DashboardActivities from "../../components/dashboards/activities";

<<<<<<< HEAD
=======

>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      {/* Sidebar kiri */}
      <SidebarAdmin />

      {/* Konten utama kanan */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Navbar di atas */}
<<<<<<< HEAD
        <div className="sticky top-0 z-50 bg-white shadow-sm">
=======
        <div className="sticky top-0 z-50 bg-white shadow-sm h-16 flex items-center">
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
          <Navbar />
        </div>

        {/* Isi halaman */}
<<<<<<< HEAD
        <main className="flex-1 px-8 py-6 space-y-8">
          {/* Judul Halaman */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
=======
        <main className="flex-1 px-8 pt-4 pb-6 space-y-6">
          {/* Judul Halaman */}
          <h1 className="text-3xl font-bold text-[#002D5B] mb-4">Dashboard</h1>
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd

          {/* Bagian Statistik */}
          <section>
            <DashboardStats />
          </section>

<<<<<<< HEAD
          {/* Bagian Kelas */}
          <section>
            <DashboardClasses />
          </section>
=======
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
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd

          {/* Bagian Aktivitas */}
          <section>
            <DashboardActivities />
          </section>
        </main>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
