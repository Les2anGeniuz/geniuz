"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Kelas {
  id_Kelas: number;
  id_Fakultas?: number | null;
  nama_kelas: string;
  deskripsi: string | null;
  nama_fakultas: string | null;
  nama_mentor: string | null;
  Fakultas?: { id_Fakultas?: number; nama_fakultas?: string | null };
  Mentor?: { nama_mentor?: string | null };
}

const ClassesDashboard = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const [data, setData] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLatest = async () => {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      if (!token) {
        setError("Admin token not found. Please login again.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${backendUrl}/api/admin/kelas?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        const normalized = (json.data || []).map((row: Kelas) => ({
          ...row,
          id_Fakultas: row.id_Fakultas ?? row.Fakultas?.id_Fakultas ?? null,
          nama_fakultas: row.nama_fakultas ?? row.Fakultas?.nama_fakultas ?? null,
          nama_mentor: row.nama_mentor ?? row.Mentor?.nama_mentor ?? null,
        }));
        setData(normalized);
      } else {
        setError(json.message || "Gagal mengambil data kelas");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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

  if (error)
    return (
      <div className="text-center py-10 text-red-500 text-sm border rounded-xl bg-white">
        {error}
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
            href={`/admin/kelas/${item.id_Fakultas || ''}/${item.id_Kelas}`}
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
        ))}
      </div>
    </div>
  );
};

export default ClassesDashboard;