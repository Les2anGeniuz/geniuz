"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MessageSquare, Plus, Flag, CheckCircle2 } from "lucide-react";

interface Activity {
  type: "materi" | "deadline" | "submit";
  title: string;
  timestamp: string;
}

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  useEffect(() => {
    const fetchActivities = async () => {
      const token = getToken();
      if (!token) return;

      try {
        // Mengambil data dari endpoint /dashboard/activity
        const response = await fetch(`${API_BASE}/dashboard/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          // Menampilkan log untuk memastikan 10 data sudah masuk
          console.log("10 Aktivitas Terbaru:", data.activity);
          setActivities(data.activity || []);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [API_BASE]);

  const renderActivityIcon = (activity: Activity) => {
    if (activity.type === "submit" && activity.title.toLowerCase().includes("feedback")) {
      return (
        <div className="w-9 h-9 rounded-full bg-[#00CCFF] flex items-center justify-center text-white shrink-0">
          <MessageSquare size={16} fill="white" />
        </div>
      );
    }

    switch (activity.type) {
      case "materi":
        return (
          <div className="w-9 h-9 rounded-full bg-[#FFFF00] flex items-center justify-center text-white shrink-0">
            <Plus size={20} strokeWidth={3} color="white" />
          </div>
        );
      case "deadline":
        return (
          <div className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center text-white shrink-0">
            <Flag size={16} fill="white" />
          </div>
        );
      case "submit":
        return (
          <div className="w-9 h-9 rounded-full bg-[#00FF00] flex items-center justify-center text-white shrink-0">
            <CheckCircle2 size={16} color="white" strokeWidth={3} />
          </div>
        );
      default:
        return <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="w-[600px] h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-black mb-3">Aktivitas Terbaru</h1>

      {/* Kontainer tetap h-[330px] & w-[600px] sesuai permintaan sebelumnya */}
      <div className="w-[600px] bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-[330px] flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
          {activities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <p className="text-gray-400 text-xs">Belum ada aktivitas terbaru</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                {renderActivityIcon(activity)}

                <div className="flex flex-col overflow-hidden">
                  <h3 className="text-sm font-bold text-[#09090b] leading-tight truncate">
                    {activity.title}
                  </h3>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {new Date(activity.timestamp).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).replace(',', ' -')} WIB
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;