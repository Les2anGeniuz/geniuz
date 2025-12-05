"use client";

import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
<<<<<<< HEAD

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 pt-20"> {/* Adjusted padding-top for navbar */}
        <Topbar />
        
          {/* Other content */}
        </div>
      </div>
  );
};

export default Dashboard;
=======
import Overview from "../components/overview";  // Komponen Overview yang sudah dibuat
import SearchBar from "../components/searchbar"; // Komponen SearchBar yang sudah dibuat

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      {/* Sidebar */}
      <Sidebar />

      {/* Topbar */}
      <Topbar />

      {/* Search Bar */}
      <div className="fixed w-full top-0 left-0 z-50">
        <SearchBar />
      </div>

      {/* Konten Dashboard */}
      <div className="ml-64 mt-24 p-6 w-full overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview and other sections */}
          <Overview />
        </div>
      </div>
    </div>
  );
}
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
