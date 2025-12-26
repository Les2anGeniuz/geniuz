"use client";

import Sidebar from "../components/dashboardLayout/sidebar";
import Topbar from "../components/dashboardLayout/topbar";
import Overview from "../components/dashboardLayout/overview";
import Activities from "../components/dashboardLayout/activity";
import StatisticsChart from "../components/dashboardLayout/statisticChart";
import Achievements from "../components/dashboardLayout/achievement";
import MyClasses from "../components/dashboardLayout/myClasses";
import ActiveTasks from "../components/dashboardLayout/activeTasks";
import ClassCards from "../components/dashboardLayout/ClassCards";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />

        <div className="pt-24 px-8 pb-10 w-full">
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            <div className="flex flex-col gap-6 w-full xl:w-[600px] flex-shrink-0">
              <Overview />
              <StatisticsChart />
              <MyClasses />
            </div>

            <div className="flex-1 w-full min-w-[400px] flex flex-col gap-6">
              <Activities />
              <Achievements />
              <ActiveTasks />
            </div>
          </div>

          <ClassCards />
        </div>
      </div>
    </div>
  );
}
