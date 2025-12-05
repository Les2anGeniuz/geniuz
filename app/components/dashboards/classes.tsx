<<<<<<< HEAD
import React from "react";

const DashboardKelasTerbaru = () => {
  const kelas = [
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
    "Integrasi Data dengan Airflow",
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Kelas Terbaru</h2>
          <p className="text-sm text-gray-500">Overview dari kelas terbaru</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {kelas.map((nama, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{nama}</p>
              <p className="text-xs text-gray-500">23 students</p>
            </div>
            <button className="bg-[#002D5B] text-white text-xs px-4 py-1.5 rounded-full">
              Active
            </button>
          </div>
=======
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Kelas {
  id_Kelas: number;
  nama_kelas: string;
  deskripsi: string | null;
  nama_fakultas: string | null;
  nama_mentor: string | null;
}

export default function KelasDashboardTable() {
  const [data, setData] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatest = async () => {
    const res = await fetch("/api/kelas?page=1&limit=5");
    const json = await res.json();
    if (res.ok) setData(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  if (loading)
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        Loading kelas...
      </div>
    );

  if (data.length === 0)
    return (
      <div className="text-center py-10 text-gray-500 text-sm border rounded-xl bg-white">
        Tidak ada kelas
      </div>
    );

  return (
    <div className="w-full overflow-x-auto">

      {/* HEADER */}
      <div
        className="
          grid
          grid-cols-[1.5fr_1fr_1.3fr]
          gap-x-6
          px-6 py-3
          rounded-xl mb-2
          bg-[#F4F7FC]
          text-[13px] font-bold text-[#002D5B]
        "
      >
        <div>Kelas</div>
        <div>Fakultas</div>
        <div>Mentor</div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {data.map((item) => (
          <Link
            key={item.id_Kelas}
            href={`/admin/kelas/${item.id_Kelas}`}
          >
            <div
              className="
                grid
                grid-cols-[1.5fr_1fr_1.3fr]
                gap-x-6
                px-6 py-5
                rounded-2xl
                bg-white border border-gray-200 shadow-sm
                hover:bg-gray-50 hover:shadow-md
                transition cursor-pointer
              "
            >
              <div>
                <p className="text-[15px] font-bold text-[#002D5B]">
                  {item.nama_kelas}
                </p>
                <p className="text-[12px] text-gray-500">
                  {item.deskripsi || "Tidak ada deskripsi"}
                </p>
              </div>

              <div className="text-[13px] font-medium text-[#002D5B]">
                {item.nama_fakultas || "-"}
              </div>

              <div className="text-[13px] text-gray-700">
                {item.nama_mentor || "-"}
              </div>
            </div>
          </Link>
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
        ))}
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default DashboardKelasTerbaru;
=======
}
>>>>>>> 9cd2c56285d9d590dfa31b3b9564b7362b191ccd
