"use client";

import React, { useEffect, useState } from "react";

interface TaskItem {
  id_Tugas: number;
  nama_tugas: string;
  tenggat_waktu: string;
  status?: string; // optional biar bisa default
  // opsional kalau suatu saat API ngasih:
  // nama_kelas?: string;
  // nama_matkul?: string;
}

function formatTanggalID(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatJamID(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const hhmm = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${hhmm} WIB`;
}

const ActiveTasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/dashboard/tugas-aktif", {
          signal: controller.signal,
        });
        const data = await response.json();

        console.log("Data tugas aktif:", data);

        if (response.ok) {
          const fetchedTasks = Array.isArray(data?.data) ? data.data : [];

          const formattedTasks: TaskItem[] = fetchedTasks.map((item: any) => ({
            id_Tugas: Number(item.id_Tugas),
            nama_tugas: String(item.nama_tugas ?? "").trim(),
            tenggat_waktu: String(item.tenggat_waktu ?? ""),
            status: item.status ?? "BELUM", // ✅ default BELUM kalau kosong
          })).filter((t: TaskItem) => t.nama_tugas !== "");

          setTasks(formattedTasks);
        } else {
          console.error("Error fetching tasks:", data?.message);
          setTasks([]);
        }
      } catch (error) {
        // kalau dibatalkan, ga usah error di console
        if ((error as any)?.name !== "AbortError") {
          console.error("Error fetching tasks:", error);
        }
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    return () => controller.abort();
  }, []);

  // Ambil 1 tugas utama (yang deadline paling dekat)
  const activeTask = React.useMemo(() => {
    if (!tasks.length) return null;
    const sorted = [...tasks].sort((a, b) => {
      const ta = a.tenggat_waktu ? new Date(a.tenggat_waktu).getTime() : Number.POSITIVE_INFINITY;
      const tb = b.tenggat_waktu ? new Date(b.tenggat_waktu).getTime() : Number.POSITIVE_INFINITY;
      return ta - tb;
    });
    return sorted[0];
  }, [tasks]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[390px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[28px] leading-none font-extrabold text-[#0f172a]">Tugas Aktif</h2>
      </div>

      <div className="flex-1">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-10">Memuat tugas...</p>
        ) : activeTask ? (
          <div className="bg-[#f3f6f9] border border-gray-200 rounded-2xl p-8 h-full flex flex-col justify-center relative">
            {/* Dot status kanan */}
            <div
              className={`w-8 h-8 rounded-full absolute right-8 top-1/2 -translate-y-1/2 ${
                (activeTask.status ?? "BELUM") === "TELAH" ? "bg-green-500" : "bg-red-500"
              }`}
            />

            {/* Kalau suatu saat API punya nama matkul, taruh di sini */}
            {/* <div className="text-lg font-medium text-[#0f172a]">{activeTask.nama_matkul}</div> */}

            <div className="text-lg font-medium text-[#0f172a]">Tugas</div>

            <div className="mt-4 text-[40px] leading-[1.05] font-extrabold text-[#0b1220]">
              {activeTask.nama_tugas}
            </div>

            <div className="mt-8 text-lg font-semibold text-[#0f172a]">
              {formatTanggalID(activeTask.tenggat_waktu)}
            </div>
            <div className="text-lg text-[#0f172a]">
              {formatJamID(activeTask.tenggat_waktu)}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">Belum ada tugas aktif.</p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm text-gray-600">Belum Dikerjakan</span>
      </div>
    </div>
  );
};

export default ActiveTasks;
