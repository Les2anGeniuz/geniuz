
//activetasks
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TugasCard from '../../components/Kelas2/Tugas'; // Pastikan path ini benar

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

        // MENGGUNAKAN PATH DASHBOARD SESUAI SERVER.JS
        const data = await apiGet<any>("/dashboard/tugas-aktif", token);

        console.log("Active Tasks Data:", data);

        if (data && data.tugas) {
          /** * LOGIC FIX: 
           * Karena backend mengirim satu objek { tugas: {...} }, 
           * kita ubah jadi Array agar bisa di-.map di render bawah.
           */
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

  if (loading) {
    return (
      <div className="w-full h-[390px] bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-500">Memuat data tugas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-black mb-3">Tugas Aktif</h1>
        <div className="w-[600px] bg-white border border-red-200 rounded-xl p-6 shadow-sm">
          <p className="text-red-600 font-semibold">Gagal memuat data</p>
          <p className="text-gray-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const hasData = tasks.length > 0;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[390px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[28px] leading-none font-extrabold text-[#0f172a]">
          Tugas Aktif
        </h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
        {hasData ? (
          <div className="flex flex-col gap-4">
            {tasks.map((task: any) => (
              <TugasCard
                key={task.id_Tugas} 
                id={task.id_Tugas}
                title={task.judul_tugas} // Menyesuaikan nama kolom dari Controller
                dueDate={task.tenggat_waktu || task.tanggal_selesai} // Menyesuaikan deadline
                status={task.status || "Belum Selesai"}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
             </div>
            <p className="text-gray-400 font-medium">Santai dulu! Belum ada tugas aktif buat kamu.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveTasks;