"use client";

import React, { useEffect, useState } from "react";

interface Activity {
  id: number;
  title: string;
  type: string; // feedback, materi, reminder, completed
  created_at: string;
}

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Mengambil data aktivitas dengan fetch ke API yang sesuai
        const response = await fetch("/api/me/activities");
        const data = await response.json();

        if (response.ok) {
          setActivities(data.data);
        } else {
          console.error("Error fetching activities:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <div className="text-gray-400">Sedang memuat...</div>;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-semibold text-black mb-4">Aktivitas Terbaru</h2>

      <div className="w-full">
        {activities.length === 0 ? (
          // Empty state jika tidak ada aktivitas
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center min-h-[325px] flex flex-col items-center justify-center w-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Belum ada aktivitas terbaru</p>
            <p className="text-gray-400 text-sm mt-1">Aktivitas belajar kamu akan muncul di sini</p>
          </div>
        ) : (
          // Tampilan jika ada data aktivitas
          <div className="flex flex-col gap-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon berdasarkan tipe aktivitas */}
                <div
                  className={`w-12 h-12 flex-shrink-0 flex justify-center items-center rounded-full ${
                    activity.type === "feedback"
                      ? "bg-blue-100 text-blue-600"
                      : activity.type === "materi"
                      ? "bg-yellow-100 text-yellow-600"
                      : activity.type === "reminder"
                      ? "bg-red-100 text-red-600"
                      : activity.type === "completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {/* Menampilkan icon sesuai tipe */}
                  {activity.type === "feedback" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  )}

                  {activity.type === "materi" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  )}

                  {activity.type === "reminder" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  )}

                  {activity.type === "completed" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold truncate text-gray-800">
                    {activity.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {/* Format tanggal sederhana */}
                    {new Date(activity.created_at)
                      .toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
