"use client"

import SidebarAdmin from "../../components/layouts/sidebarAdmin"
import Navbar from "../../components/layouts/navbarAdmin"
import AnalyticsStats from "../../components/adminAnalytics/stats"

export default function AdminAnalytics() {
  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col ml-64">
        <div className="sticky top-0 z-50 bg-white shadow-sm h-16 flex items-center">
          <Navbar />
        </div>

        <main className="flex-1 px-8 pt-4 pb-6 space-y-6">
          <h1 className="text-3xl font-bold text-[#002D5B] mb-4">
            Analytics
          </h1>

          <section>
            <AnalyticsStats />
          </section>
        </main>
      </div>
    </div>
  )
}