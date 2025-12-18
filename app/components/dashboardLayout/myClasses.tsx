"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Ambil ID User dari tabel User berdasarkan email auth
        const { data: userData } = await supabase
          .from("User")
          .select("id_User")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          // Ambil data progress untuk mendapatkan id_kelas yang diikuti
          const { data: progressData } = await supabase
            .from("Progress")
            .select(`
              id_Kelas,
              Kelas (
                id_Kelas,
                nama_kelas
              )
            `)
            .eq("id_User", userData.id_User);

          // Mapping data (Contoh: Menambahkan data statis untuk Hari/Jam karena biasanya ada di tabel Jadwal)
          if (progressData) {
            const formatted = progressData.map((item: any) => ({
              id_Kelas: item.Kelas.id_Kelas,
              nama_kelas: item.Kelas.nama_kelas,
              hari: "Senin", // Idealnya ambil dari tabel Jadwal
              jam: "16.00 WIB",
              isOnline: Math.random() > 0.5, // Dummy status online/offline
            }));
            setClasses(formatted);
          }
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
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1e293b]">Kelas Saya</h2>
        <span className="text-gray-400 text-sm">Minggu ini</span>
      </div>

      <div className="flex flex-col gap-3">
        {classes.length > 0 ? (
          classes.map((cls, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-3 h-3 rounded-full mb-1 ${cls.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase text-center leading-tight">
                  {cls.hari}, 6 Okt <br/> {cls.jam}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-gray-200"></div>
              <h3 className="font-bold text-[#1e293b] text-sm md:text-base truncate">
                {cls.nama_kelas}
              </h3>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">Belum ada kelas terdaftar.</p>
        )}
      </div>

      <div className="flex gap-4 mt-4">
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