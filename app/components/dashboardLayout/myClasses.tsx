"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type KelasSayaItem = {
  id_Kelas?: string | number;
  id_Fakultas?: string | number;
  nama_kelas?: string;
  isOnline?: boolean;
};

type DashKelasSayaRes = {
  kelas_saya?: KelasSayaItem[];
};

const TOKEN_KEY = "access_token";
const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
const clearToken = () =>
  typeof window !== "undefined" && localStorage.removeItem(TOKEN_KEY);

const MyClasses: React.FC = () => {
  const [classes, setClasses] = useState<KelasSayaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
        throw new Error(`Gagal memuat data: ${res.status}`);
      }

      return (await res.json()) as T;
    };

    (async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const token = getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const data = await apiGet<DashKelasSayaRes>("/dashboard/kelas-saya", token);
        const rows = Array.isArray(data?.kelas_saya) ? data.kelas_saya : [];

        const normalized = rows
          .map((k) => ({
            id_Kelas: k.id_Kelas,
            id_Fakultas: k.id_Fakultas ?? "11",
            nama_kelas: (k.nama_kelas || "").trim(),
            isOnline: k.isOnline ?? true,
          }))
          .filter((k) => k.nama_kelas !== "");

        if (!controller.signal.aborted) {
          setClasses(normalized);
        }
      } catch (e: any) {
        if (e.name === "AbortError") return;
        console.error("[MyClasses] Error:", e);
        setErrorMsg(e.message || "Terjadi kesalahan sistem.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [API_BASE, router]);

  return (
    <div className="w-[600px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[390px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[28px] leading-none font-extrabold text-[#0f172a]">
          Kelas Saya
        </h2>
        <span className="text-gray-500 text-sm font-medium">Minggu ini</span>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : errorMsg ? (
          <p className="text-red-500 text-sm text-center py-10">{errorMsg}</p>
        ) : classes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {classes.map((cls) => {
              const dotClass = cls.isOnline ? "bg-green-500" : "bg-red-500";
              const classPath = `/Kelas/${cls.id_Fakultas}/${cls.id_Kelas}`;

              return (
                <Link
                  key={String(cls.id_Kelas ?? cls.nama_kelas)}
                  href={classPath}
                  className="block group"
                >
                  <div className="flex items-center bg-[#f8fafc] rounded-2xl border border-gray-200 px-6 py-5
                                  transition group-hover:bg-[#f1f5f9] group-hover:border-gray-300 cursor-pointer">
                    
                    {/* Status Dot Saja (Tanpa Jadwal) */}
                    <div className="flex items-center justify-center min-w-[20px]">
                      <div className={`w-3.5 h-3.5 rounded-full ${dotClass} shadow-sm`} />
                    </div>

                    {/* Pembatas Vertikal */}
                    <div className="h-10 w-px bg-gray-300 mx-6" />

                    {/* Judul Kelas */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[20px] font-extrabold text-[#0f172a] truncate group-hover:text-blue-700 transition">
                        {cls.nama_kelas}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-14 italic">
            Belum ada jadwal kelas terdaftar.
          </p>
        )}
      </div>

      {/* Legend Status */}
      <div className="flex gap-6 mt-4 pt-2 border-t border-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 font-medium">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500 font-medium">Offline</span>
        </div>
      </div>
    </div>
  );
};

export default MyClasses;