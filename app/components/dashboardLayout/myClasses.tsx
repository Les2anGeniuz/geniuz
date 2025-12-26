"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type KelasSayaItem = {
  id_Kelas?: string | number;
  id_Fakultas?: string | number; // ✅ buat routing ke /Kelas/:idFakultas/:idKelas
  nama_kelas?: string;
  hari?: string;
  jam?: string;
  isOnline?: boolean; // optional => default online
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
        throw new Error("Unauthorized");
      }

      return (await res.json()) as T;
    };

    (async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
          setClasses([]);
          return;
        }

        const data = await apiGet<DashKelasSayaRes>(
          "/dashboard/kelas-saya",
          token
        );
        const rows = Array.isArray(data?.kelas_saya) ? data.kelas_saya : [];

        const normalized = rows
          .map((k) => ({
            id_Kelas: k.id_Kelas,
            id_Fakultas: k.id_Fakultas ?? "11", // ✅ fallback kayak Sidebar
            nama_kelas: (k.nama_kelas || "").trim(),
            hari: (k.hari || "").trim(),
            jam: (k.jam || "").trim(),
            isOnline: k.isOnline ?? true, // ✅ default online kalau field-nya gak ada
          }))
          .filter((k) => k.nama_kelas !== "");

        setClasses(normalized);
      } catch (e) {
        console.error(e);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API_BASE]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-[390px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[28px] leading-none font-extrabold text-[#0f172a]">
          Kelas Saya
        </h2>
        <span className="text-gray-500 text-sm">Minggu ini</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-10">Memuat data...</p>
        ) : classes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {classes.map((cls) => {
              const dotClass = cls.isOnline ? "bg-green-500" : "bg-red-500";
              const hasMeta = Boolean(cls.hari) || Boolean(cls.jam);

              const classPath = `/Kelas/${cls.id_Fakultas ?? "11"}/${cls.id_Kelas ?? ""}`;

              return (
                <Link
                  key={String(cls.id_Kelas ?? cls.nama_kelas)}
                  href={classPath}
                  className="block"
                >
                  <div className="flex items-center bg-[#f8fafc] rounded-2xl border border-gray-200 px-6 py-5
                                  transition hover:bg-[#f1f5f9] hover:border-gray-300 cursor-pointer">
                    {/* Left: dot + meta (kalau ada), TANPA space kosong */}
                    <div className="flex items-start gap-3 min-w-fit">
                      <div className={`w-3.5 h-3.5 rounded-full mt-1 ${dotClass}`} />
                      {hasMeta ? (
                        <div className="leading-tight">
                          {cls.hari ? (
                            <div className="text-sm font-semibold text-[#0f172a]">
                              {cls.hari}
                            </div>
                          ) : null}
                          {cls.jam ? (
                            <div className="text-xs text-gray-500 mt-1">{cls.jam}</div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {/* Divider */}
                    <div className="h-12 w-px bg-gray-300 mx-8" />

                    {/* Right: nama kelas */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[20px] font-extrabold text-[#0f172a] truncate">
                        {cls.nama_kelas}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">
            Belum ada kelas terdaftar minggu ini.
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500">Offline</span>
        </div>
      </div>
    </div>
  );
};

export default MyClasses;
