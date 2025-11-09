"use client";

import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

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
