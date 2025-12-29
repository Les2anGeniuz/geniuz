"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Star, Rocket } from "lucide-react";

interface Achievement {
  target: number;
  label: string;
  progress: number;
}

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  useEffect(() => {
    const fetchAchievements = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/dashboard/achievement`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          // Data dari backend: achievements: [build(50), build(25), build(10)]
          setAchievements(data.achievements || []);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [API_BASE, router]);

  const getAchievementIcon = (target: number) => {
    switch (target) {
      case 50:
        return <Trophy className="text-yellow-400" size={32} fill="currentColor" fillOpacity={0.2} />;
      case 25:
        return <Star className="text-cyan-400" size={32} fill="currentColor" fillOpacity={0.2} />;
      case 10:
        return <Rocket className="text-red-500" size={32} fill="currentColor" fillOpacity={0.2} />;
      default:
        return <Trophy className="text-gray-400" size={32} />;
    }
  };

  if (loading) {
    return (
      <div className="w-[600px] h-[390px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064479]" />
      </div>
    );
  }

  return (
    <div className="w-[600px] h-[390px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
      {/* Header */}
      <h2 className="text-[28px] font-extrabold text-[#0f172a] mb-6 flex-shrink-0">
        Pencapaian
      </h2>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
        {achievements.length > 0 ? (
          achievements.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-[#f8fafc] p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              {/* Box Ikon Putih */}
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-50 shrink-0">
                {getAchievementIcon(item.target)}
              </div>

              {/* Konten Label & Progress Bar */}
              <div className="flex-1 flex items-center justify-between gap-6">
                <span className="text-lg font-bold text-[#0f172a] leading-tight">
                  {item.label}
                </span>

                {/* Progress Bar Container */}
                <div className="w-44 bg-white border border-gray-200 h-3.5 rounded-full overflow-hidden relative">
                  <div
                    className="bg-[#064479] h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400 font-medium italic">Belum ada pencapaian tugas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;