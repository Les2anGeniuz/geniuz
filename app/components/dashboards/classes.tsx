"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Kelas {
  id_Kelas: number;
  nama_kelas: string;
  deskripsi: string;
}

const DashboardClasses = () => {
  const [kelas, setKelas] = useState<Kelas[]>([]);

  useEffect(() => {
    const fetchKelas = async () => {
      const { data, error } = await supabase
        .from('"Kelas"')
        .select("id_Kelas, nama_kelas, deskripsi")
        .order("id_Kelas", { ascending: false })
        .limit(5);

      if (!error && data) setKelas(data);
    };

    fetchKelas();
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Kelas Terbaru</h2>
          <p className="text-sm text-gray-500">Overview dari kelas terbaru</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {kelas.length > 0 ? (
          kelas.map((item) => (
            <div key={item.id_Kelas} className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.nama_kelas}</p>
                <p className="text-xs text-gray-500 truncate max-w-xs">
                  {item.deskripsi || "Tidak ada deskripsi"}
                </p>
              </div>
              <button className="bg-[#002D5B] text-white text-xs px-4 py-1.5 rounded-full">
                Active
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">Belum ada kelas tersedia</p>
        )}
      </div>
    </div>
  );
};

export default DashboardClasses;