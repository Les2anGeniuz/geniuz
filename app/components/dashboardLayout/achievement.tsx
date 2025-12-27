"use client";

import React, { useEffect, useState } from "react";

interface Achievement {
  id: number;
  title: string;
  progress: number;
  type: string; 
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Mengambil data achievements menggunakan fetch
        const response = await fetch("/api/me/achievements");  // Endpoint API yang disediakan
        const data = await response.json();

        if (response.ok) {
          const fetchedAchievements = data.data;

          // Map data pencapaian
          const formattedAchievements = fetchedAchievements.map((item: any) => ({
            id: item.id,
            title: item.title,
            progress: item.progress,
            type: item.type, // Misalnya "gold", "blue", "red"
          }));

          setAchievements(formattedAchievements);
        } else {
          console.error("Error fetching achievements:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false); // Set loading ke false setelah pengambilan data selesai
      }
    };

    fetchAchievements();
  }, []);

  const getStyle = (type: string) => {
    switch (type) {
      case "gold":
        return {
          color: "bg-yellow-100 text-yellow-600",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          )
        };
      case "blue":
        return {
          color: "bg-blue-100 text-blue-500",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )
        };
      case "red":
        return {
          color: "bg-red-100 text-red-500",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        };
      default:
        return {
          color: "bg-gray-100 text-gray-500",
          icon: <div className="w-4 h-4 rounded-full bg-gray-400"></div>
        };
    }
  };

  if (loading)
    return (
      <div className="w-full h-[390px] bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Memuat pencapaian...</div>
      </div>
    );

  const hasData = achievements.length > 0;

  return (
    <div className="w-full h-[390px] bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
      <h2 className="text-xl font-bold text-black mb-4 flex-shrink-0">Pencapaian</h2>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {hasData ? (
          <div className="flex flex-col gap-4">
            {achievements.map((item) => {
              const style = getStyle(item.type);

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg ${style.color}`}
                  >
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        {item.title}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#0f4c81] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center pb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>

            <h3 className="text-gray-900 font-semibold text-lg">
              Belum Ada Pencapaian
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-[250px]">
              Yuk, tetap semangat belajar dan kerjakan tugasmu untuk membuka
              achievement baru!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
