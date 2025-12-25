"use client";

import React, { useEffect, useState } from "react";

interface ClassItem {
  id_Kelas: number;
  nama_kelas: string;
  hari: string;
  jam: string;
  isOnline: boolean;
}

const MyClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const response = await fetch("/api/dashboard/kelas-saya");  // Menggunakan API yang sesuai
        const data = await response.json();

        console.log("Data kelas saya:", data);

        if (response.ok) {
          const fetchedClasses = data.data;

          const formattedClasses = fetchedClasses.map((item: any) => ({
            id_Kelas: item.id_Kelas,
            nama_kelas: item.nama_kelas,
            hari: item.hari,
            jam: item.jam,
            isOnline: item.isOnline,
          }));

          setClasses(formattedClasses);
        } else {
          console.error("Error fetching classes:", data.message);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyClasses();
  }, []);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-[390px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1e293b]">Kelas Saya</h2>
        <span className="text-gray-400 text-sm">Minggu ini</span>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-4">Memuat data...</p>
        ) : classes.length > 0 ? (
          classes.map((cls, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-3 h-3 rounded-full mb-1 ${cls.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase text-center leading-tight">
                  {cls.hari}, {new Date(cls.hari).getDate()} Okt <br /> {cls.jam}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-gray-200"></div>
              <h3 className="font-bold text-[#1e293b] text-sm md:text-base truncate">
                {cls.nama_kelas}
              </h3>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">Belum ada kelas terdaftar minggu ini.</p>
        )}
      </div>

      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-500">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-500">Offline</span>
        </div>
      </div>
    </div>
  );
};

export default MyClasses;
