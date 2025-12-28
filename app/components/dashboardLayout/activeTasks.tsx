"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
const clearToken = () =>
  typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const ActiveTasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
    []
  );

  // --- LOGIKA ASLI TETAP DIPERTAHANKAN ---
  useEffect(() => {
    const controller = new AbortController();

    const apiGet = async <T,>(path: string, token: string): Promise<T> => {
      const url = `${API_BASE}${path}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (res.status === 401) {
        clearToken();
        router.replace("/login");
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed ${res.status}: ${text}`);
      }

      return (await res.json()) as T;
    };

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const data = await apiGet<any>("/dashboard/tugas-aktif", token);

        if (data && data.tugas) {
          const tugasArray = Array.isArray(data.tugas) ? data.tugas : [data.tugas];
          setTasks(tugasArray);
        } else {
          setTasks([]);
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("[ActiveTasks] Error:", e);
        setError(e?.message || "Terjadi kesalahan sistem.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API_BASE, router]);

  const formatIndoDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatIndoTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return (
      date
        .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        .replace(":", ".") + " WIB"
    );
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[390px] flex flex-col">
      {/* Header - Ukuran text-[28px] sesuai Kelas Saya */}
      <div className="mb-4">
        <h2 className="text-[28px] leading-none font-extrabold text-[#0f172a]">
          Tugas Aktif
        </h2>
      </div>

      {/* List Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 space-y-4">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-10">Memuat data...</p>
        ) : error ? (
          <p className="text-red-500 text-sm text-center py-10">{error}</p>
        ) : tasks.length > 0 ? (
          tasks.map((task: any) => {
            const isDone = task.status === "Selesai" || task.status === "TELAH";
            const dotColor = isDone ? "bg-green-500" : "bg-red-500";

            return (
              <Link 
                key={task.id_Tugas} 
                href={`/tugas/${task.id_Tugas}`} 
                className="block group"
              >
                {/* Card besar (min-h-[250px]) agar memenuhi area sesuai desain */}
                <div
                  className="w-full bg-[#f8fafc] rounded-[24px] border border-gray-200 p-8 
                             transition group-hover:bg-[#f1f5f9] group-hover:border-gray-300 cursor-pointer flex flex-col min-h-[250px] justify-between"
                >
                  {/* Judul Tugas - Font dikecilkan ke text-[26px] sesuai permintaan */}
                  <h3 className="text-[26px] font-extrabold text-[#0f172a] leading-tight group-hover:text-blue-700 transition">
                    {task.judul_tugas}
                  </h3>

                  {/* Deadline & Dot Indicator */}
                  <div className="flex justify-between items-end">
                    <div className="text-lg font-bold text-[#0f172a] leading-tight">
                      <p>{formatIndoDate(task.tenggat_waktu || task.tanggal_selesai)}</p>
                      <p className="font-medium text-gray-500">{formatIndoTime(task.tenggat_waktu || task.tanggal_selesai)}</p>
                    </div>

                    {/* Status Dot */}
                    <div className={`w-4 h-4 rounded-full ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
            <p className="text-gray-400 font-medium">Belum ada tugas aktif.</p>
          </div>
        )}
      </div>

      {/* Legend - Teks "Belum Dikerjakan" tidak italic */}
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 font-medium">Selesai</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500 font-medium">Belum Dikerjakan</span>
        </div>
      </div>
    </div>
  );
};

export default ActiveTasks;